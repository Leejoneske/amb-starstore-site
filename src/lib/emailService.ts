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
    // Sending approval email
    
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
    // Email sent successfully
    
    return { success: true };
  } catch (error: unknown) {
    // Email sending error occurred
    return { success: false, error: error?.message || 'Unknown error' };
  }
};
