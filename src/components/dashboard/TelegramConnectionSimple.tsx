import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageCircle } from 'lucide-react';

export const TelegramConnectionSimple = () => {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) return;

    // Basic validation
    const telegramIdTrimmed = telegramId.trim();
    if (!/^\d+$/.test(telegramIdTrimmed) || telegramIdTrimmed.length < 5) {
      toast({
        title: "Invalid Telegram ID",
        description: "Telegram ID must be numeric and at least 5 digits long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('🚀🚀🚀 SIMPLE TELEGRAM CONNECTION v5.0 - ISOLATED TEST - Testing with ID:', telegramIdTrimmed);
    console.log('🔥 IF YOU SEE THIS LOG, YOU ARE USING THE SIMPLE COMPONENT!');

    try {
      // Use ONLY the secure function - no other database calls
      const { data: result, error } = await supabase
        .rpc('update_ambassador_telegram_info', {
          p_telegram_id: telegramIdTrimmed,
          p_telegram_username: null
        });

      if (error) {
        console.error('Function error:', error);
        
        if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          toast({
            title: "Database Function Missing",
            description: "Please run the SQL setup in your Supabase dashboard first.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(error.message);
      }

      if (!result?.success) {
        console.error('Function returned error:', result);
        throw new Error(result?.error || 'Failed to update Telegram information');
      }

      console.log('✅ SUCCESS:', result);
      
      toast({
        title: "Telegram Connected! 🎉",
        description: `Successfully connected Telegram ID: ${telegramIdTrimmed}`,
      });

      // Clear the input
      setTelegramId('');

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          Simple Telegram Connection Test
        </CardTitle>
        <CardDescription>
          Test the secure function approach for connecting Telegram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram-id">Telegram User ID</Label>
            <Input
              id="telegram-id"
              type="text"
              placeholder="123456789"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your numeric Telegram user ID (get it from @userinfobot)
            </p>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test Telegram Connection"
            )}
          </Button>
        </form>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            SQL Function Required:
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Make sure you've run the SQL function in your Supabase dashboard first. Check the console for the SQL code if needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};