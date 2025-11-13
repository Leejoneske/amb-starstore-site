import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Mail,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { TELEGRAM_CONFIG } from '@/config/telegram';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface SetupStatus {
  botUsername: boolean;
  emailService: boolean;
  edgeFunctions: boolean;
}

export const SetupChecker = () => {
  const [status, setStatus] = useState<SetupStatus>({
    botUsername: false,
    emailService: false,
    edgeFunctions: false
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSetup = async () => {
    setIsChecking(true);
    const newStatus: SetupStatus = {
      botUsername: false,
      emailService: false,
      edgeFunctions: false
    };

    try {
      // Check bot username
      newStatus.botUsername = TELEGRAM_CONFIG.BOT_USERNAME !== 'StarStoreBot';

      // Check edge functions
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          // Test email function
          const emailResponse = await fetch('/functions/v1/send-approval-email', {
            method: 'OPTIONS'
          });
          newStatus.emailService = emailResponse.status !== 404;
          newStatus.edgeFunctions = emailResponse.status !== 404;
        }
      } catch (error) {
        logger.warn('Function check failed', { function: 'setup-check' }, error as Error);
      }

    } catch (error) {
      logger.error('Setup check failed', {}, error as Error);
    }

    setStatus(newStatus);
    setIsChecking(false);
  };

  useEffect(() => {
    checkSetup();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isOk: boolean) => {
    return (
      <Badge variant={isOk ? 'default' : 'destructive'}>
        {isOk ? 'OK' : 'Needs Setup'}
      </Badge>
    );
  };

  const allGood = Object.values(status).every(Boolean);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Setup Status</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkSetup}
          disabled={isChecking}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check Again'}
        </Button>
      </div>

      {allGood ? (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            🎉 All systems are configured correctly! Your Telegram integration is ready to use.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some components need configuration. Please follow the setup instructions below.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {/* Bot Username */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(status.botUsername)}
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Telegram Bot Username</div>
              <div className="text-sm text-muted-foreground">
                Current: @{TELEGRAM_CONFIG.BOT_USERNAME}
              </div>
            </div>
          </div>
          {getStatusBadge(status.botUsername)}
        </div>

        {/* Edge Functions */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(status.edgeFunctions)}
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Edge Functions</div>
              <div className="text-sm text-muted-foreground">
                Email and approval functions
              </div>
            </div>
          </div>
          {getStatusBadge(status.edgeFunctions)}
        </div>

        {/* Email Service */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(status.emailService)}
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Email Service</div>
              <div className="text-sm text-muted-foreground">
                Email notifications for ambassadors
              </div>
            </div>
          </div>
          {getStatusBadge(status.emailService)}
        </div>
      </div>

      {/* Setup Instructions */}
      {!allGood && (
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {!status.botUsername && (
              <li>Update your bot username in <code>src/config/telegram.ts</code></li>
            )}
            {!status.edgeFunctions && (
              <li>Deploy edge functions via Supabase dashboard</li>
            )}
            {!status.emailService && (
              <li>Configure email service for notifications</li>
            )}
          </ol>
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/SETUP_INSTRUCTIONS.md" target="_blank">
                View Complete Setup Guide
              </a>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};