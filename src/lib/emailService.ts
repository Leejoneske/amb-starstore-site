// Email service for sending approval notifications via Supabase Edge Function

import { z } from 'zod';
import { supabaseConfig } from '@/config/env';
import { logger } from '@/lib/logger';
import { validateApiResponse, safeValidate } from '@/lib/validation';
import { messageService, type MessageType } from '@/services/messageService';
import type { ApiResponse } from '@/types';

// Validation schemas
const approvalEmailDataSchema = z.object({
  userEmail: z.string().email('Invalid email address'),
  userName: z.string().min(1, 'User name is required'),
  tempPassword: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().min(6, 'Referral code must be at least 6 characters'),
});

const emailResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

interface ApprovalEmailData {
  userEmail: string;
  userName: string;
  tempPassword: string;
  referralCode: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
}

export const sendApprovalEmailWithResend = async (
  data: ApprovalEmailData,
  options: {
    userId?: string;
    ambassadorId?: string;
    sentBy?: string;
  } = {}
): Promise<ApiResponse<EmailResponse>> => {
  // Validate input data
  const validationResult = safeValidate(data, approvalEmailDataSchema);
  if (!validationResult.success) {
    logger.error('Invalid email data provided', { validationErrors: validationResult.error?.errors });
    return {
      success: false,
      error: `Invalid input data: ${validationResult.error?.errors.map(e => e.message).join(', ')}`,
      data: { success: false }
    };
  }

  const { userEmail, userName, tempPassword, referralCode } = validationResult.data;

  // Create message record first
  const messageResult = await messageService.createMessage({
    recipientEmail: userEmail,
    recipientName: userName,
    userId: options.userId,
    ambassadorId: options.ambassadorId,
    subject: 'Congratulations! Your Ambassador Application is Approved',
    messageType: 'approval' as MessageType,
    templateName: 'approval_email',
    priority: 'high',
    sentBy: options.sentBy,
    sentVia: 'system',
    variables: {
      name: userName,
      email: userEmail,
      password: tempPassword,
      referralCode,
      login_url: `${window.location.origin}/auth`
    },
    metadata: {
      source: 'ambassador_approval',
      tempPassword: tempPassword, // Store for reference (encrypted in production)
      referralCode
    }
  });

  if (!messageResult.success) {
    logger.error('Failed to create message record', { error: messageResult.error });
  }

  try {
    logger.info('Sending approval email', { 
      userEmail, 
      userName,
      messageId: messageResult.messageId,
      action: 'send_approval_email'
    });
    
    // Call the Supabase Edge Function
    const response = await fetch(
      `${supabaseConfig.functionsUrl}/send-approval-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          userEmail,
          userName,
          tempPassword,
          referralCode,
          messageId: messageResult.messageId, // Pass message ID for tracking
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      // Update message status to failed
      if (messageResult.messageId) {
        await messageService.updateMessageStatus(
          messageResult.messageId, 
          'failed', 
          errorData.error || 'Failed to send email'
        );
      }
      
      throw new Error(errorData.error || 'Failed to send email');
    }

    const rawResult = await response.json();
    
    // Validate API response
    const result = validateApiResponse(rawResult, emailResponseSchema);
    
    // Update message status to sent
    if (messageResult.messageId) {
      await messageService.updateMessageStatus(messageResult.messageId, 'sent');
      
      // If we got an external message ID, update it
      if (result.messageId) {
        await messageService.updateMessageStatus(messageResult.messageId, 'sent');
      }
    }
    
    logger.info('Approval email sent successfully', { 
      userEmail, 
      messageId: messageResult.messageId,
      externalMessageId: result.messageId 
    });
    
    return { 
      success: true, 
      data: { 
        success: true, 
        messageId: messageResult.messageId || result.messageId 
      }
    };
  } catch (error) {
    // Update message status to failed
    if (messageResult.messageId) {
      await messageService.updateMessageStatus(
        messageResult.messageId, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    
    logger.apiError('send-approval-email', error as Error, { 
      userEmail, 
      userName,
      messageId: messageResult.messageId
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { success: false }
    };
  }
};

// Send templated email using the message service
export const sendTemplatedEmail = async (
  templateName: string,
  recipientEmail: string,
  variables: Record<string, any>,
  options: {
    recipientName?: string;
    userId?: string;
    ambassadorId?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    sentBy?: string;
    sentVia?: 'system' | 'manual' | 'automation';
    metadata?: Record<string, any>;
  } = {}
): Promise<ApiResponse<EmailResponse>> => {
  try {
    const result = await messageService.sendTemplatedMessage(
      templateName,
      recipientEmail,
      variables,
      options
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: { success: true, messageId: result.messageId }
    };
  } catch (error) {
    logger.error('Failed to send templated email', { 
      templateName, 
      recipientEmail, 
      variables 
    }, error as Error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { success: false }
    };
  }
};
