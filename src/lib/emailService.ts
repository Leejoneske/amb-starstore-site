// Email service for sending approval notifications via Supabase Edge Function

import { z } from 'zod';
import { supabaseConfig } from '@/config/env';
import { logger } from '@/lib/logger';
import { validateApiResponse, safeValidate } from '@/lib/validation';
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

export const sendApprovalEmailWithResend = async (data: ApprovalEmailData): Promise<ApiResponse<EmailResponse>> => {
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

  try {
    logger.info('Sending approval email', { 
      userEmail, 
      userName,
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
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const rawResult = await response.json();
    
    // Validate API response
    const result = validateApiResponse(rawResult, emailResponseSchema);
    
    logger.info('Approval email sent successfully', { 
      userEmail, 
      messageId: result.messageId 
    });
    
    return { 
      success: true, 
      data: { success: true, messageId: result.messageId }
    };
  } catch (error) {
    logger.apiError('send-approval-email', error as Error, { 
      userEmail, 
      userName 
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { success: false }
    };
  }
};
