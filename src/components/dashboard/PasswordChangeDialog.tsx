import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordChangeTracker } from '@/hooks/useFirstLoginTracker';

interface PasswordChangeDialogProps {
  trigger?: React.ReactNode;
  isUsingTempPassword?: boolean;
}

export const PasswordChangeDialog = ({ trigger, isUsingTempPassword = false }: PasswordChangeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { markPasswordChanged } = usePasswordChangeTracker();

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
  };

  const handlePasswordChange = async () => {
    setErrors([]);
    
    // Validate passwords
    const passwordErrors = validatePassword(newPassword);
    
    if (newPassword !== confirmPassword) {
      passwordErrors.push('Passwords do not match');
    }
    
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Mark password as changed in ambassador profile
      await markPasswordChanged();
      
      toast({
        title: "Password Updated Successfully! 🔐",
        description: "Your password has been changed and your account is now fully secure.",
      });
      
      // Reset form and close dialog
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsOpen(false);
      
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button 
      variant={isUsingTempPassword ? "default" : "outline"} 
      size="sm"
      className={isUsingTempPassword ? "bg-orange-600 hover:bg-orange-700" : ""}
    >
      <Key className="h-4 w-4 mr-1" />
      {isUsingTempPassword ? 'Change Temporary Password' : 'Change Password'}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isUsingTempPassword && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                For your security, please change your temporary password to something more secure.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters long</li>
              <li>One uppercase and one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character (@$!%*?&)</li>
            </ul>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handlePasswordChange}
              disabled={isLoading || !newPassword || !confirmPassword}
              className="flex-1"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};