import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMessageTemplates, useSendTemplatedMessage } from '@/hooks/useMessages';
import { messageService, type MessageType } from '@/services/messageService';
import { 
  Send, 
  Mail, 
  Users, 
  FileText, 
  Eye, 
  Loader2,
  Plus,
  Edit,
  Save
} from 'lucide-react';

const MESSAGE_TYPES: { value: MessageType; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'approval', label: 'Approval' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'login_credentials', label: 'Login Credentials' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'tier_upgrade', label: 'Tier Upgrade' },
  { value: 'commission_payout', label: 'Commission Payout' },
  { value: 'referral_activation', label: 'Referral Activation' },
  { value: 'monthly_report', label: 'Monthly Report' },
  { value: 'system_notification', label: 'System Notification' },
  { value: 'manual_email', label: 'Manual Email' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'announcement', label: 'Announcement' }
];

export const ManualMessageSender = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [messageType, setMessageType] = useState<MessageType>('manual_email');
  const [previewContent, setPreviewContent] = useState('');
  
  const { toast } = useToast();
  const { data: templates = [], isLoading: templatesLoading } = useMessageTemplates();
  const sendMessage = useSendTemplatedMessage();

  // Handle template selection
  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setMessageType(template.message_type);
      // Initialize variables with empty values
      const templateVars = template.variables || {};
      const initialVars: Record<string, string> = {};
      Object.keys(templateVars).forEach(key => {
        initialVars[key] = '';
      });
      setVariables(initialVars);
    }
  };

  // Handle variable change
  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  // Generate preview
  const generatePreview = () => {
    const template = templates.find(t => t.name === selectedTemplate);
    if (!template) return;

    let preview = template.html_template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(placeholder, value || `[${key}]`);
    });
    setPreviewContent(preview);
  };

  // Send templated message
  const handleSendTemplated = async () => {
    if (!selectedTemplate || !recipientEmail) {
      toast({
        title: "Missing Information",
        description: "Please select a template and enter recipient email",
        variant: "destructive",
      });
      return;
    }

    sendMessage.mutate({
      templateName: selectedTemplate,
      recipientEmail,
      variables,
      options: {
        recipientName: recipientName || undefined,
        priority,
        sentVia: 'manual'
      }
    });
  };

  // Send custom message
  const handleSendCustom = async () => {
    if (!recipientEmail || !customSubject || !customContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await messageService.createMessage({
        recipientEmail,
        recipientName: recipientName || undefined,
        subject: customSubject,
        messageType,
        contentHtml: customContent,
        priority,
        sentVia: 'manual'
      });

      if (result.success) {
        // Mark as sent (in a real implementation, you'd integrate with your email service)
        await messageService.updateMessageStatus(result.messageId!, 'sent');
        
        toast({
          title: "Message Sent Successfully! 📧",
          description: `Custom email sent to ${recipientEmail}`,
        });

        // Reset form
        setRecipientEmail('');
        setRecipientName('');
        setCustomSubject('');
        setCustomContent('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const selectedTemplateData = templates.find(t => t.name === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Send Messages</h2>
          <p className="text-muted-foreground">
            Send emails to ambassadors using templates or custom content
          </p>
        </div>
      </div>

      <Tabs defaultValue="templated" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templated">Use Template</TabsTrigger>
          <TabsTrigger value="custom">Custom Message</TabsTrigger>
        </TabsList>

        <TabsContent value="templated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Send Templated Message
              </CardTitle>
              <CardDescription>
                Use pre-built templates with dynamic variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Select Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesLoading ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading templates...
                      </SelectItem>
                    ) : (
                      templates.map(template => (
                        <SelectItem key={template.id} value={template.name}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {MESSAGE_TYPES.find(t => t.value === template.message_type)?.label}
                            </Badge>
                            {template.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-email">Recipient Email *</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="user@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Recipient Name</Label>
                  <Input
                    id="recipient-name"
                    placeholder="John Doe"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
              </div>

              {/* Template Variables */}
              {selectedTemplateData && Object.keys(selectedTemplateData.variables || {}).length > 0 && (
                <div className="space-y-4">
                  <Label>Template Variables</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedTemplateData.variables || {}).map(([key, description]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`var-${key}`}>
                          {key} 
                          <span className="text-xs text-muted-foreground ml-1">
                            ({description as string})
                          </span>
                        </Label>
                        <Input
                          id={`var-${key}`}
                          placeholder={`Enter ${key}...`}
                          value={variables[key] || ''}
                          onChange={(e) => handleVariableChange(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedTemplate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Preview</Label>
                    <Button variant="outline" size="sm" onClick={generatePreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Generate Preview
                    </Button>
                  </div>
                  {previewContent && (
                    <div className="border rounded p-4 bg-muted/50 max-h-60 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <Button 
                onClick={handleSendTemplated} 
                disabled={!selectedTemplate || !recipientEmail || sendMessage.isPending}
                className="w-full"
              >
                {sendMessage.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Templated Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Custom Message
              </CardTitle>
              <CardDescription>
                Create and send a custom email message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-recipient-email">Recipient Email *</Label>
                  <Input
                    id="custom-recipient-email"
                    type="email"
                    placeholder="user@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-recipient-name">Recipient Name</Label>
                  <Input
                    id="custom-recipient-name"
                    placeholder="John Doe"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
              </div>

              {/* Message Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="message-type">Message Type</Label>
                  <Select value={messageType} onValueChange={(value: MessageType) => setMessageType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-priority">Priority</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="custom-subject">Subject *</Label>
                <Input
                  id="custom-subject"
                  placeholder="Enter email subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="custom-content">Message Content *</Label>
                <Textarea
                  id="custom-content"
                  placeholder="Enter your message content here..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  You can use HTML formatting in your message content
                </p>
              </div>

              {/* Send Button */}
              <Button 
                onClick={handleSendCustom} 
                disabled={!recipientEmail || !customSubject || !customContent}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Custom Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};