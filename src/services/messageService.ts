// Message Service - Tracks all email communications
// Provides comprehensive logging and tracking for all messages sent to users

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type MessageType = 
  | 'welcome'
  | 'approval' 
  | 'rejection'
  | 'login_credentials'
  | 'password_reset'
  | 'tier_upgrade'
  | 'commission_payout'
  | 'referral_activation'
  | 'monthly_report'
  | 'system_notification'
  | 'manual_email'
  | 'reminder'
  | 'announcement';

export type MessageStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'failed'
  | 'bounced';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface MessageData {
  recipientEmail: string;
  recipientName?: string;
  userId?: string;
  ambassadorId?: string;
  subject: string;
  messageType: MessageType;
  templateName?: string;
  contentHtml?: string;
  contentText?: string;
  priority?: MessagePriority;
  sentBy?: string;
  sentVia?: 'system' | 'manual' | 'automation';
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  externalMessageId?: string;
  emailService?: string;
}

export interface MessageEvent {
  messageId: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  eventData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface MessageTemplate {
  name: string;
  messageType: MessageType;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables?: Record<string, any>;
  isActive?: boolean;
}

export interface MessageFilter {
  recipientEmail?: string;
  messageType?: MessageType;
  status?: MessageStatus;
  dateFrom?: Date;
  dateTo?: Date;
  sentBy?: string;
  priority?: MessagePriority;
  search?: string;
  limit?: number;
  offset?: number;
}

class MessageService {
  // Create a new message record
  async createMessage(messageData: MessageData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          recipient_email: messageData.recipientEmail,
          recipient_name: messageData.recipientName,
          user_id: messageData.userId,
          ambassador_id: messageData.ambassadorId,
          subject: messageData.subject,
          message_type: messageData.messageType,
          template_name: messageData.templateName,
          content_html: messageData.contentHtml,
          content_text: messageData.contentText,
          priority: messageData.priority || 'normal',
          sent_by: messageData.sentBy,
          sent_via: messageData.sentVia || 'system',
          variables: messageData.variables || {},
          metadata: messageData.metadata || {},
          external_message_id: messageData.externalMessageId,
          email_service: messageData.emailService || 'supabase',
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      logger.info('Message created successfully', { 
        messageId: data.id, 
        type: messageData.messageType,
        recipient: messageData.recipientEmail 
      });

      return { success: true, messageId: data.id };
    } catch (error) {
      logger.error('Failed to create message', { messageData }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Log a message event (sent, delivered, opened, etc.)
  async logMessageEvent(event: MessageEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('message_events')
        .insert({
          message_id: event.messageId,
          event_type: event.eventType,
          event_data: event.eventData || {},
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          occurred_at: new Date().toISOString()
        });

      if (error) throw error;

      logger.info('Message event logged', { 
        messageId: event.messageId, 
        eventType: event.eventType 
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to log message event', { event }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Update message status
  async updateMessageStatus(
    messageId: string, 
    status: MessageStatus, 
    errorMessage?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      // Set timestamp fields based on status
      switch (status) {
        case 'sent':
          updateData.sent_at = new Date().toISOString();
          break;
        case 'delivered':
          updateData.delivered_at = new Date().toISOString();
          break;
        case 'opened':
          updateData.opened_at = new Date().toISOString();
          break;
        case 'clicked':
          updateData.clicked_at = new Date().toISOString();
          break;
        case 'failed':
        case 'bounced':
          updateData.failed_at = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      // Also log as an event
      await this.logMessageEvent({
        messageId,
        eventType: status === 'bounced' ? 'bounced' : status,
        eventData: errorMessage ? { error: errorMessage } : {}
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to update message status', { messageId, status }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get messages with filtering
  async getMessages(filter: MessageFilter = {}): Promise<{ 
    success: boolean; 
    messages?: any[]; 
    total?: number; 
    error?: string 
  }> {
    try {
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter.recipientEmail) {
        query = query.ilike('recipient_email', `%${filter.recipientEmail}%`);
      }

      if (filter.messageType) {
        query = query.eq('message_type', filter.messageType);
      }

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.priority) {
        query = query.eq('priority', filter.priority);
      }

      if (filter.sentBy) {
        query = query.eq('sent_by', filter.sentBy);
      }

      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom.toISOString());
      }

      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo.toISOString());
      }

      if (filter.search) {
        query = query.or(`subject.ilike.%${filter.search}%,recipient_name.ilike.%${filter.search}%`);
      }

      // Pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { 
        success: true, 
        messages: data || [], 
        total: count || 0 
      };
    } catch (error) {
      logger.error('Failed to get messages', { filter }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get message by ID with events
  async getMessageById(messageId: string): Promise<{ 
    success: boolean; 
    message?: any; 
    events?: any[]; 
    error?: string 
  }> {
    try {
      const [messageResult, eventsResult] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('id', messageId)
          .single(),
        
        supabase
          .from('message_events')
          .select('*')
          .eq('message_id', messageId)
          .order('occurred_at', { ascending: true })
      ]);

      if (messageResult.error) throw messageResult.error;
      if (eventsResult.error) throw eventsResult.error;

      return { 
        success: true, 
        message: messageResult.data,
        events: eventsResult.data || []
      };
    } catch (error) {
      logger.error('Failed to get message by ID', { messageId }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get message statistics
  async getMessageStats(dateFrom?: Date, dateTo?: Date): Promise<{ 
    success: boolean; 
    stats?: any; 
    error?: string 
  }> {
    try {
      let query = supabase
        .from('messages')
        .select('status, message_type, priority, created_at');

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data?.length || 0,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      };

      data?.forEach(message => {
        // Count by status
        stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1;
        
        // Count by type
        stats.byType[message.message_type] = (stats.byType[message.message_type] || 0) + 1;
        
        // Count by priority
        stats.byPriority[message.priority] = (stats.byPriority[message.priority] || 0) + 1;
      });

      // Calculate rates
      const sent = stats.byStatus.sent || 0;
      const delivered = stats.byStatus.delivered || 0;
      const opened = stats.byStatus.opened || 0;
      const clicked = stats.byStatus.clicked || 0;

      if (sent > 0) {
        stats.deliveryRate = Math.round((delivered / sent) * 100);
        stats.openRate = Math.round((opened / sent) * 100);
        stats.clickRate = Math.round((clicked / sent) * 100);
      }

      return { success: true, stats };
    } catch (error) {
      logger.error('Failed to get message stats', { dateFrom, dateTo }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create or update message template
  async saveTemplate(template: MessageTemplate & { id?: string }): Promise<{ 
    success: boolean; 
    templateId?: string; 
    error?: string 
  }> {
    try {
      const templateData = {
        name: template.name,
        message_type: template.messageType,
        subject_template: template.subjectTemplate,
        html_template: template.htmlTemplate,
        text_template: template.textTemplate,
        variables: template.variables || {},
        is_active: template.isActive !== false
      };

      let result;
      if (template.id) {
        // Update existing template
        result = await supabase
          .from('message_templates')
          .update(templateData)
          .eq('id', template.id)
          .select('id')
          .single();
      } else {
        // Create new template
        result = await supabase
          .from('message_templates')
          .insert(templateData)
          .select('id')
          .single();
      }

      if (result.error) throw result.error;

      return { success: true, templateId: result.data.id };
    } catch (error) {
      logger.error('Failed to save template', { template }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get message templates
  async getTemplates(messageType?: MessageType): Promise<{ 
    success: boolean; 
    templates?: any[]; 
    error?: string 
  }> {
    try {
      let query = supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (messageType) {
        query = query.eq('message_type', messageType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, templates: data || [] };
    } catch (error) {
      logger.error('Failed to get templates', { messageType }, error as Error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Process template with variables
  processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(placeholder, String(value || ''));
    });

    return processed;
  }

  // Send message using template
  async sendTemplatedMessage(
    templateName: string,
    recipientEmail: string,
    variables: Record<string, any>,
    options: {
      recipientName?: string;
      userId?: string;
      ambassadorId?: string;
      priority?: MessagePriority;
      sentBy?: string;
      sentVia?: 'system' | 'manual' | 'automation';
      metadata?: Record<string, any>;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      if (templateError) throw new Error(`Template not found: ${templateName}`);

      // Process template with variables
      const subject = this.processTemplate(template.subject_template, variables);
      const htmlContent = this.processTemplate(template.html_template, variables);
      const textContent = template.text_template 
        ? this.processTemplate(template.text_template, variables) 
        : undefined;

      // Create message record
      const messageResult = await this.createMessage({
        recipientEmail,
        recipientName: options.recipientName,
        userId: options.userId,
        ambassadorId: options.ambassadorId,
        subject,
        messageType: template.message_type,
        templateName,
        contentHtml: htmlContent,
        contentText: textContent,
        priority: options.priority,
        sentBy: options.sentBy,
        sentVia: options.sentVia,
        variables,
        metadata: options.metadata
      });

      if (!messageResult.success) {
        throw new Error(messageResult.error);
      }

      // Here you would integrate with your actual email sending service
      // For now, we'll just mark it as sent
      await this.updateMessageStatus(messageResult.messageId!, 'sent');

      logger.info('Templated message sent successfully', { 
        templateName, 
        recipient: recipientEmail,
        messageId: messageResult.messageId 
      });

      return { success: true, messageId: messageResult.messageId };
    } catch (error) {
      logger.error('Failed to send templated message', { 
        templateName, 
        recipientEmail, 
        variables 
      }, error as Error);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const messageService = new MessageService();
export type { MessageData, MessageEvent, MessageTemplate, MessageFilter };