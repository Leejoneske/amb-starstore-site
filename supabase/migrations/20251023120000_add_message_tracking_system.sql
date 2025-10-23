-- Message Tracking System
-- Tracks all emails sent to users including automated ones

-- Message types enum
CREATE TYPE message_type AS ENUM (
  'welcome',
  'approval',
  'rejection', 
  'login_credentials',
  'password_reset',
  'tier_upgrade',
  'commission_payout',
  'referral_activation',
  'monthly_report',
  'system_notification',
  'manual_email',
  'reminder',
  'announcement'
);

-- Message status enum
CREATE TYPE message_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'failed',
  'bounced'
);

-- Message priority enum
CREATE TYPE message_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Main messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Recipient information
  recipient_email text NOT NULL,
  recipient_name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ambassador_id uuid REFERENCES ambassador_profiles(id) ON DELETE SET NULL,
  
  -- Message content
  subject text NOT NULL,
  message_type message_type NOT NULL,
  template_name text,
  content_html text,
  content_text text,
  
  -- Message metadata
  status message_status DEFAULT 'pending',
  priority message_priority DEFAULT 'normal',
  
  -- Sending information
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_via text DEFAULT 'system', -- 'system', 'manual', 'automation'
  
  -- Tracking data
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  failed_at timestamptz,
  
  -- Error information
  error_message text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  
  -- Email service data
  external_message_id text, -- ID from email service (SendGrid, etc.)
  email_service text DEFAULT 'supabase',
  
  -- Additional data
  metadata jsonb DEFAULT '{}',
  variables jsonb DEFAULT '{}', -- Template variables used
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  filename text NOT NULL,
  content_type text,
  file_size integer,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Message events table (for detailed tracking)
CREATE TABLE IF NOT EXISTS message_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  event_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  occurred_at timestamptz DEFAULT now()
);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  message_type message_type NOT NULL,
  subject_template text NOT NULL,
  html_template text NOT NULL,
  text_template text,
  variables jsonb DEFAULT '{}', -- Available template variables
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_email ON messages(recipient_email);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_ambassador_id ON messages(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);

CREATE INDEX IF NOT EXISTS idx_message_events_message_id ON message_events(message_id);
CREATE INDEX IF NOT EXISTS idx_message_events_type ON message_events(event_type);
CREATE INDEX IF NOT EXISTS idx_message_events_occurred_at ON message_events(occurred_at);

CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(message_type);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_profiles 
      WHERE user_id = auth.uid() AND current_tier = 'admin'
    )
  );

CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all messages" ON messages
  FOR ALL TO service_role USING (true);

-- RLS Policies for message_attachments
CREATE POLICY "Admins can view all attachments" ON message_attachments
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_profiles 
      WHERE user_id = auth.uid() AND current_tier = 'admin'
    )
  );

CREATE POLICY "Users can view attachments for their messages" ON message_attachments
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE id = message_attachments.message_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all attachments" ON message_attachments
  FOR ALL TO service_role USING (true);

-- RLS Policies for message_events
CREATE POLICY "Admins can view all events" ON message_events
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_profiles 
      WHERE user_id = auth.uid() AND current_tier = 'admin'
    )
  );

CREATE POLICY "Service role can manage all events" ON message_events
  FOR ALL TO service_role USING (true);

-- RLS Policies for message_templates
CREATE POLICY "Authenticated users can view active templates" ON message_templates
  FOR SELECT TO authenticated 
  USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON message_templates
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_profiles 
      WHERE user_id = auth.uid() AND current_tier = 'admin'
    )
  );

CREATE POLICY "Service role can manage all templates" ON message_templates
  FOR ALL TO service_role USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
  BEFORE UPDATE ON message_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update message status based on events
CREATE OR REPLACE FUNCTION update_message_status_from_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message status based on event type
  UPDATE messages 
  SET 
    status = CASE 
      WHEN NEW.event_type = 'sent' THEN 'sent'::message_status
      WHEN NEW.event_type = 'delivered' THEN 'delivered'::message_status
      WHEN NEW.event_type = 'opened' THEN 'opened'::message_status
      WHEN NEW.event_type = 'clicked' THEN 'clicked'::message_status
      WHEN NEW.event_type = 'bounced' THEN 'bounced'::message_status
      WHEN NEW.event_type = 'failed' THEN 'failed'::message_status
      ELSE status
    END,
    sent_at = CASE WHEN NEW.event_type = 'sent' THEN NEW.occurred_at ELSE sent_at END,
    delivered_at = CASE WHEN NEW.event_type = 'delivered' THEN NEW.occurred_at ELSE delivered_at END,
    opened_at = CASE WHEN NEW.event_type = 'opened' THEN NEW.occurred_at ELSE opened_at END,
    clicked_at = CASE WHEN NEW.event_type = 'clicked' THEN NEW.occurred_at ELSE clicked_at END,
    failed_at = CASE WHEN NEW.event_type IN ('failed', 'bounced') THEN NEW.occurred_at ELSE failed_at END,
    updated_at = now()
  WHERE id = NEW.message_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update message status from events
CREATE TRIGGER update_message_status_trigger
  AFTER INSERT ON message_events
  FOR EACH ROW EXECUTE FUNCTION update_message_status_from_event();

-- Insert default message templates
INSERT INTO message_templates (name, message_type, subject_template, html_template, text_template, variables) VALUES
(
  'welcome_email',
  'welcome',
  'Welcome to StarStore Ambassador Program!',
  '<h1>Welcome {{name}}!</h1><p>Thank you for joining the StarStore Ambassador Program. We''re excited to have you on board!</p><p>Your journey to earning commissions starts now.</p>',
  'Welcome {{name}}! Thank you for joining the StarStore Ambassador Program. We''re excited to have you on board! Your journey to earning commissions starts now.',
  '{"name": "Recipient name"}'
),
(
  'approval_email',
  'approval',
  'Congratulations! Your Ambassador Application is Approved',
  '<h1>Congratulations {{name}}!</h1><p>Your ambassador application has been approved. You can now start earning commissions!</p><p><strong>Your login credentials:</strong></p><p>Email: {{email}}<br>Temporary Password: {{password}}</p><p><a href="{{login_url}}">Login to your dashboard</a></p>',
  'Congratulations {{name}}! Your ambassador application has been approved. You can now start earning commissions! Your login credentials: Email: {{email}}, Temporary Password: {{password}}. Login at: {{login_url}}',
  '{"name": "Recipient name", "email": "Login email", "password": "Temporary password", "login_url": "Dashboard login URL"}'
),
(
  'tier_upgrade_email',
  'tier_upgrade',
  'Congratulations! You''ve been promoted to {{new_tier}}!',
  '<h1>Tier Upgrade!</h1><p>Congratulations {{name}}! You''ve been promoted to <strong>{{new_tier}}</strong> tier.</p><p>Your new commission rate is <strong>{{commission_rate}}%</strong>.</p><p>Keep up the great work!</p>',
  'Congratulations {{name}}! You''ve been promoted to {{new_tier}} tier. Your new commission rate is {{commission_rate}}%. Keep up the great work!',
  '{"name": "Recipient name", "new_tier": "New tier name", "commission_rate": "New commission rate"}'
),
(
  'referral_activation_email',
  'referral_activation',
  'Great News! Your Referral is Now Active',
  '<h1>Referral Activated!</h1><p>Hi {{name}},</p><p>Great news! Your referral <strong>{{referred_user}}</strong> has reached 100 stars and is now active.</p><p>You''ve earned <strong>${{commission_amount}}</strong> in commission!</p>',
  'Hi {{name}}, Great news! Your referral {{referred_user}} has reached 100 stars and is now active. You''ve earned ${{commission_amount}} in commission!',
  '{"name": "Recipient name", "referred_user": "Referred user name", "commission_amount": "Commission earned"}'
);

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Tracks all email messages sent to users including automated ones';
COMMENT ON TABLE message_attachments IS 'File attachments for messages';
COMMENT ON TABLE message_events IS 'Detailed tracking events for messages (opens, clicks, etc.)';
COMMENT ON TABLE message_templates IS 'Email templates for different message types';

COMMENT ON COLUMN messages.sent_via IS 'How the message was sent: system, manual, automation';
COMMENT ON COLUMN messages.metadata IS 'Additional metadata about the message';
COMMENT ON COLUMN messages.variables IS 'Template variables used when sending the message';
COMMENT ON COLUMN messages.external_message_id IS 'ID from external email service for tracking';