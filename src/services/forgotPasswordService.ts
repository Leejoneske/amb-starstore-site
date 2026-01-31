import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { supabaseConfig } from '@/config/env';

export interface ForgotPasswordRequest {
  email: string;
}

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const forgotPasswordService = {
  async requestPasswordReset(email: string): Promise<PasswordResetResult> {
    try {
      logger.info('Password reset requested', { email });

      // Generate the reset URL using Supabase's built-in flow
      // This triggers Supabase to generate a secure token
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        logger.error('Password reset failed', { email }, error);
        // Don't reveal if user exists for security
        return {
          success: true,
          message: 'If the email exists in our system, you will receive a password reset link.',
        };
      }

      // Also send our custom professional email via edge function
      // This provides a better user experience with branded emails
      try {
        const resetUrl = `${window.location.origin}/reset-password`;
        
        const response = await fetch(
          `${supabaseConfig.functionsUrl}/send-password-reset`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseConfig.anonKey}`,
            },
            body: JSON.stringify({
              email,
              resetUrl,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          logger.warn('Custom password reset email failed, falling back to Supabase email', { 
            email, 
            error: errorData.error 
          });
          // Don't fail the whole operation - Supabase already sent its email
        } else {
          logger.info('Custom password reset email sent successfully', { email });
        }
      } catch (customEmailError) {
        logger.warn('Failed to send custom password reset email', { email }, customEmailError as Error);
        // Don't fail - Supabase email was already sent
      }

      return {
        success: true,
        message: 'If the email exists in our system, you will receive a password reset link.',
      };
    } catch (error) {
      logger.error('Unexpected error during password reset request', { email }, error as Error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      };
    }
  },

  async updatePasswordWithToken(newPassword: string): Promise<PasswordResetResult> {
    try {
      logger.info('Attempting to update password with token');

      if (!newPassword || newPassword.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long.',
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.error('Error updating password', {}, error);
        return {
          success: false,
          error: error.message || 'Failed to update password. Please try again.',
        };
      }

      logger.info('Password updated successfully');

      return {
        success: true,
        message: 'Your password has been updated successfully. You can now log in with your new password.',
      };
    } catch (error) {
      logger.error('Unexpected error during password update', {}, error as Error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      };
    }
  },

  async verifyResetToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        return false;
      }

      // Check if there's a valid session (token)
      return !!data.session.access_token;
    } catch (error) {
      logger.error('Error verifying reset token', {}, error as Error);
      return false;
    }
  },
};
