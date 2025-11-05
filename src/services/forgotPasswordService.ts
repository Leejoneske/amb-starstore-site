import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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

      // Use Supabase's built-in password reset with proper redirect
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
