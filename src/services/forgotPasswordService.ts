import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { sendTemplatedEmail } from '@/lib/emailService';

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

      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        logger.error('Error checking user existence', { email }, userError);
        // Don't reveal if user exists for security
        return {
          success: true,
          message: 'If the email exists in our system, you will receive a password reset link.',
        };
      }

      if (!userData) {
        // User doesn't exist - return success message anyway for security
        logger.info('Password reset requested for non-existent user', { email });
        return {
          success: true,
          message: 'If the email exists in our system, you will receive a password reset link.',
        };
      }

      // Send password reset email via Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (resetError) {
        logger.error('Error sending password reset email', { email }, resetError);
        return {
          success: false,
          error: 'Failed to send reset email. Please try again later.',
        };
      }

      // Track password reset request in message service
      await sendTemplatedEmail(
        'password_reset',
        email,
        {
          userName: userData.full_name || 'User',
          resetLink: 'Check your email for the reset link',
        },
        {
          recipientName: userData.full_name,
          userId: userData.id,
          sentVia: 'system',
          metadata: {
            requestType: 'password_reset',
          },
        }
      );

      logger.info('Password reset email sent successfully', { email });

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
