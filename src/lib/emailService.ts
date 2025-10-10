// Email service for sending approval notifications via Supabase Edge Function

interface ApprovalEmailData {
  userEmail: string;
  userName: string;
  tempPassword: string;
  referralCode: string;
}

export const sendApprovalEmailWithResend = async (data: ApprovalEmailData) => {
  const { userEmail, userName, tempPassword, referralCode } = data;

  try {
    // In production, this would call a Supabase Edge Function that handles email sending
    // For now, we'll simulate the email sending
    console.log('Sending approval email to:', userEmail);
    console.log('Credentials:', { tempPassword, referralCode });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success for now - in production, implement actual email service
    return { success: true };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};
