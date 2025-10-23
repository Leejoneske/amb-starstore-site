import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { starStoreService } from '@/services/starStoreService';
import { webhookService } from '@/services/webhookService';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Globe, Zap } from 'lucide-react';

interface ConnectionStatus {
  connected: boolean;
  latency: number;
  error?: string;
  lastChecked: Date;
}

export const StarStoreConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    latency: 0,
    lastChecked: new Date()
  });
  const [webhookRegistered, setWebhookRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check connection status
  const checkConnection = async () => {
    setLoading(true);
    try {
      const result = await starStoreService.testConnection();
      setConnectionStatus({
        connected: result.connected,
        latency: result.latency,
        error: result.error,
        lastChecked: new Date()
      });

      if (result.connected) {
        toast({
          title: "Connection Successful! ✅",
          description: `Connected to Star Store (${result.latency}ms)`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Unable to connect to Star Store",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        latency: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  // Register webhook for real-time updates
  const registerWebhook = async () => {
    setLoading(true);
    try {
      const success = await webhookService.registerWebhook();
      setWebhookRegistered(success);

      if (success) {
        toast({
          title: "Webhook Registered! 🎉",
          description: "Real-time updates from Star Store are now active",
        });
      } else {
        toast({
          title: "Webhook Registration Failed",
          description: "Unable to register for real-time updates",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Webhook Error",
        description: error instanceof Error ? error.message : "Failed to register webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    if (!connectionStatus.connected) return 'destructive';
    if (connectionStatus.latency > 1000) return 'secondary';
    return 'default';
  };

  const getLatencyColor = () => {
    if (connectionStatus.latency < 500) return 'text-green-600';
    if (connectionStatus.latency < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Star Store Integration
        </CardTitle>
        <CardDescription>
          Connection status with your primary Star Store system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {connectionStatus.connected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Latency: <span className={getLatencyColor()}>{connectionStatus.latency}ms</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Disconnected</p>
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.error || 'Unable to reach Star Store'}
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge variant={getStatusColor()}>
            {connectionStatus.connected ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Webhook Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className={`h-5 w-5 ${webhookRegistered ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium">Real-time Updates</p>
              <p className="text-sm text-muted-foreground">
                {webhookRegistered ? 'Active' : 'Not configured'}
              </p>
            </div>
          </div>
          <Badge variant={webhookRegistered ? 'default' : 'secondary'}>
            {webhookRegistered ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={checkConnection}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test Connection
          </Button>
          
          <Button 
            variant="outline" 
            onClick={registerWebhook}
            disabled={loading || !connectionStatus.connected}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Enable Real-time
          </Button>
        </div>

        {/* Connection Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Server: {starStoreService['baseUrl']}</p>
          <p>Last checked: {connectionStatus.lastChecked.toLocaleTimeString()}</p>
          {webhookRegistered && (
            <p>Webhook: {webhookService.getWebhookUrl()}</p>
          )}
        </div>

        {/* Error Alert */}
        {connectionStatus.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {connectionStatus.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {connectionStatus.connected && !connectionStatus.error && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Successfully connected to Star Store. Your referral data will be synced automatically.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};