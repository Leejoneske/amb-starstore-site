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
    console.log('Sending approval email to:', userEmail);
    
    // Call the Supabase Edge Function
    const response = await fetch(
      'https://jrtqbntwwkqxpexpplly.supabase.co/functions/v1/send-approval-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

    const result = await response.json();
    console.log('Email sent successfully:', result);
    
    return { success: true };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};
