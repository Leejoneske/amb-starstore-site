import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle2, Mail, Send, Clock, Shield, Inbox, RefreshCw } from 'lucide-react';
import { forgotPasswordService } from '@/services/forgotPasswordService';

interface ForgotPasswordProps {
  onBack?: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPasswordService.requestPasswordReset(email);

      if (result.success) {
        setSubmitted(true);
        toast({
          title: 'Email Sent',
          description: 'Check your inbox for the reset link.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send reset email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await forgotPasswordService.requestPasswordReset(email);
      toast({
        title: 'Email Resent',
        description: 'A new reset link has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl" />
            <div className="relative p-5 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-4 ring-blue-500/10">
              <Inbox className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Check Your Inbox</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-foreground bg-muted px-4 py-2 rounded-lg inline-block text-sm">
              {email}
            </p>
          </div>
        </div>

        {/* Steps Card */}
        <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="font-medium text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Follow these steps
              </p>
              <div className="space-y-3">
                {[
                  { text: 'Open your email inbox', sub: 'Check spam if needed' },
                  { text: 'Click the reset link', sub: 'Valid for 1 hour' },
                  { text: 'Create a new password', sub: 'Make it strong & unique' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium">{step.text}</p>
                      <p className="text-xs text-muted-foreground">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Expires in 1 hour</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure link</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Resend Email
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
            >
              Try Different Email
            </Button>
            <Button className="flex-1" onClick={onBack}>
              Back to Login
            </Button>
          </div>
        </div>

        {/* Security note */}
        <p className="text-xs text-center text-muted-foreground">
          Didn't receive an email? Check your spam folder or verify the email address is correct.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Forgot Password?</h2>
          <p className="text-muted-foreground text-sm mt-1">
            No worries, we'll send you reset instructions
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 pl-11"
              disabled={loading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 gap-2 shadow-lg shadow-primary/20" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Reset Link
            </>
          )}
        </Button>
      </form>

      {/* Back button */}
      <Button 
        variant="ghost" 
        className="w-full gap-2 text-muted-foreground hover:text-foreground" 
        onClick={onBack} 
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Button>
    </div>
  );
};
