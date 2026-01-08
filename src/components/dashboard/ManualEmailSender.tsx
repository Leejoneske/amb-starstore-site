import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ManualEmailSenderProps {
  applicantName: string;
  applicantEmail: string;
  tempPassword?: string;
  referralCode?: string;
  trigger?: React.ReactNode;
}

export const ManualEmailSender = ({ 
  applicantName, 
  applicantEmail, 
  tempPassword, 
  referralCode,
  trigger 
}: ManualEmailSenderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Professional plain text email template (matching the HTML version)
  const emailTemplate = `Subject: Your StarStore Ambassador Application is Approved

StarStore

Hello, ${applicantName}

Your application has been approved.
==========================================

Congratulations! You have been accepted into the StarStore Ambassador Program. We're excited to have you on board and can't wait to see the impact you'll make.

YOUR CREDENTIALS
---
Email: ${applicantEmail}
Temporary Password: ${tempPassword || '[TEMP_PASSWORD]'}
Your Referral Code: ${referralCode || '[REFERRAL_CODE]'}
---

[IMPORTANT] Please change your password immediately after your first login for security.

Login to Dashboard: ${window.location.origin}/auth

HERE'S HOW TO GET STARTED:

1. Log in to your ambassador dashboard using the credentials above
2. Complete your profile and change your password
3. Share your unique referral code with friends and followers
4. Track your earnings and referrals in real-time

If you have questions about your account or the program, please don't hesitate to get in touch with us on Telegram: https://t.me/thestarstore

---
Thank you for being part of StarStore.
The StarStore Team

---
© ${new Date().getFullYear()} StarStore. All rights reserved.
Help: https://starstore.site/help
Support: https://starstore.site/support
Telegram: https://t.me/thestarstore`;

  const copyEmailTemplate = () => {
    copyToClipboard(emailTemplate, 'Email template');
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent('Your StarStore Ambassador Application is Approved');
    // Remove subject line from body since it's in the subject field
    const bodyText = emailTemplate.replace('Subject: Your StarStore Ambassador Application is Approved\n\n', '');
    const body = encodeURIComponent(bodyText);
    const mailtoLink = `mailto:${applicantEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Mail className="h-4 w-4 mr-1" />
      Send Manual Email
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Manual Email Sending
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The automatic email delivery failed. You can send the credentials manually using the options below.
            </AlertDescription>
          </Alert>

          {/* Credentials Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Ambassador Credentials</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{applicantName}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(applicantName, 'Name')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{applicantEmail}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(applicantEmail, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {tempPassword && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temp Password:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{tempPassword}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(tempPassword, 'Password')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {referralCode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referral Code:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{referralCode}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Email Options */}
          <div className="space-y-3">
            <h3 className="font-semibold">Send Email</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={openEmailClient} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Open Email Client
              </Button>
              
              <Button variant="outline" onClick={copyEmailTemplate} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy Email Template
              </Button>
            </div>
          </div>

          {/* Email Preview */}
          <div className="space-y-2">
            <h3 className="font-semibold">Email Preview</h3>
            <div className="bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
              {emailTemplate}
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Click "Open Email Client" to compose the email automatically</li>
                <li>Or copy the template and paste it into your preferred email client</li>
                <li>Make sure to include all credentials (password and referral code)</li>
                <li>Send the email to complete the ambassador onboarding</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};