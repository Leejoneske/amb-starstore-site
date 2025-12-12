import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Shield, 
  KeyRound, 
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { forgotPasswordService } from '@/services/forgotPasswordService';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkResetToken();
  }, []);

  const checkResetToken = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      navigate('/auth');
    } else {
      setIsValid(true);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.password = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await forgotPasswordService.updatePasswordWithToken(newPassword);

      if (result.success) {
        setSubmitted(true);
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
        });

        setTimeout(() => navigate('/auth'), 3000);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Password validation checks
  const checks = {
    length: newPassword.length >= 6,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword)
  };

  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-destructive', 'bg-warning', 'bg-info', 'bg-success'];
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative p-4 rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-xl" />
              <div className="relative p-4 rounded-full bg-success/10 ring-4 ring-success/20">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Password Updated!</h1>
            <p className="text-muted-foreground mb-8">
              Your password has been successfully changed. Redirecting to login...
            </p>
            
            <Button onClick={() => navigate('/auth')} className="gap-2">
              Continue to Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 ring-4 ring-primary/5">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Password</h1>
            <p className="text-muted-foreground mt-1">
              Choose a strong password to secure your account
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={cn(
                      'pl-10 pr-10 h-12',
                      errors.password && 'border-destructive focus-visible:ring-destructive'
                    )}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}

                {/* Password Strength */}
                {newPassword && (
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-all duration-300',
                            i < strengthScore ? strengthColors[strengthScore - 1] : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{strengthScore > 0 ? strengthLabels[strengthScore - 1] : 'Too weak'}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={cn(
                      'pl-10 pr-10 h-12',
                      errors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
                      passwordsMatch && 'border-success focus-visible:ring-success'
                    )}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
                {passwordsMatch && (
                  <p className="text-sm text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Requirements Checklist */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Password Requirements
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { check: checks.length, label: 'At least 6 characters' },
                    { check: checks.uppercase, label: 'One uppercase letter' },
                    { check: checks.number, label: 'One number' },
                    { check: checks.special, label: 'One special character' }
                  ].map(({ check, label }) => (
                    <div
                      key={label}
                      className={cn(
                        'flex items-center gap-2 transition-colors',
                        check ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      <div className={cn(
                        'h-4 w-4 rounded-full flex items-center justify-center border transition-all',
                        check 
                          ? 'bg-success border-success' 
                          : 'border-muted-foreground/30'
                      )}>
                        {check && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                disabled={loading || !checks.length}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back Link */}
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline font-medium"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
};
