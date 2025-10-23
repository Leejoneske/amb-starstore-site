import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, type MessageFilter, type MessageType } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';

// Hook to get messages with filtering
export const useMessages = (filter: MessageFilter = {}) => {
  return useQuery({
    queryKey: ['messages', filter],
    queryFn: async () => {
      const result = await messageService.getMessages(filter);
      if (!result.success) {
        throw new Error(result.error);
      }
      return {
        messages: result.messages || [],
        total: result.total || 0
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get message statistics
export const useMessageStats = (dateFrom?: Date, dateTo?: Date) => {
  return useQuery({
    queryKey: ['message-stats', dateFrom, dateTo],
    queryFn: async () => {
      const result = await messageService.getMessageStats(dateFrom, dateTo);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get message by ID
export const useMessage = (messageId: string | undefined) => {
  return useQuery({
    queryKey: ['message', messageId],
    queryFn: async () => {
      if (!messageId) return null;
      
      const result = await messageService.getMessageById(messageId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return {
        message: result.message,
        events: result.events || []
      };
    },
    enabled: !!messageId,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook to get message templates
export const useMessageTemplates = (messageType?: MessageType) => {
  return useQuery({
    queryKey: ['message-templates', messageType],
    queryFn: async () => {
      const result = await messageService.getTemplates(messageType);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.templates || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to send templated message
export const useSendTemplatedMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      templateName: string;
      recipientEmail: string;
      variables: Record<string, any>;
      options?: {
        recipientName?: string;
        userId?: string;
        ambassadorId?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        sentBy?: string;
        sentVia?: 'system' | 'manual' | 'automation';
        metadata?: Record<string, any>;
      };
    }) => {
      const result = await messageService.sendTemplatedMessage(
        params.templateName,
        params.recipientEmail,
        params.variables,
        params.options || {}
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.messageId;
    },
    onSuccess: (messageId, variables) => {
      toast({
        title: "Message Sent Successfully! 📧",
        description: `Email sent to ${variables.recipientEmail}`,
      });
      
      // Invalidate messages queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
    onError: (error, variables) => {
      toast({
        title: "Failed to Send Message",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
};

// Hook to update message status
export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      messageId: string;
      status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
      errorMessage?: string;
    }) => {
      const result = await messageService.updateMessageStatus(
        params.messageId,
        params.status,
        params.errorMessage
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message', variables.messageId] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Message Status",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
};

// Hook to create message template
export const useSaveMessageTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: {
      id?: string;
      name: string;
      messageType: MessageType;
      subjectTemplate: string;
      htmlTemplate: string;
      textTemplate?: string;
      variables?: Record<string, any>;
      isActive?: boolean;
    }) => {
      const result = await messageService.saveTemplate(template);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.templateId;
    },
    onSuccess: (templateId, variables) => {
      toast({
        title: "Template Saved Successfully! 📝",
        description: `Template "${variables.name}" has been saved`,
      });
      
      // Invalidate templates queries
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Save Template",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
};