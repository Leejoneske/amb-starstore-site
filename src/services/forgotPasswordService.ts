import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { messageService } from '@/services/messageService';

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

      // Send password reset email using our custom template via message service
      // This gives us full control over the email content and tracking
      const resetLink = `${window.location.origin}/auth?reset=true`;
      
      const emailResult = await messageService.sendTemplatedMessage(
        'password_reset',
        email,
        {
          userName: userData.full_name || 'User',
          resetLink: resetLink,
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

      if (!emailResult.success) {
        logger.error('Failed to send password reset email', { email }, new Error(emailResult.error));
        return {
          success: false,
          error: 'Failed to send reset email. Please try again later.',
        };
      }

      // Also trigger Supabase's password reset (which sends a second email with actual secure token)
      // This is needed because we can't generate our own secure password reset tokens
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetLink,
      }).catch((error) => {
        // Log but don't fail - we already sent our custom email
        logger.error('Supabase password reset failed', { email }, error);
      });

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
