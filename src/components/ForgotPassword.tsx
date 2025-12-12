import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle2, Mail, Send, Clock, AlertTriangle } from 'lucide-react';
import { forgotPasswordService } from '@/services/forgotPasswordService';
import { cn } from '@/lib/utils';

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
          title: 'Check Your Email',
          description: 'If registered, you will receive a password reset link.',
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

  if (submitted) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-lg" />
            <div className="relative p-4 rounded-full bg-success/10 ring-4 ring-success/20">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground mt-1">
              We've sent a reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
        </div>

        {/* Instructions Card */}
        <Card className="bg-muted/50 border-0">
          <CardContent className="p-5 space-y-4">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="font-medium text-sm">What to do next:</p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Check your email inbox (and spam folder)',
                    'Click the "Reset Password" link in the email',
                    'Create your new password',
                    'Log in with your new credentials'
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary flex-shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              The reset link expires in 1 hour for security
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            For security, we don't confirm if an email exists in our system. If you don't receive an email, verify you entered the correct address.
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
          >
            Try Another Email
          </Button>
          <Button className="flex-1" onClick={onBack}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-2">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-background text-xs text-muted-foreground">or</span>
        </div>
      </div>

      <Button variant="ghost" className="w-full gap-2" onClick={onBack} disabled={loading}>
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Button>
    </div>
  );
};
