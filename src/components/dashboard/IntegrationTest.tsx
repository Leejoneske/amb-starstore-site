import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { starStoreService } from '@/services/starStoreService';
import { generateTelegramReferralLink } from '@/config/telegram';
import { 
  TestTube, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink,
  Users,
  DollarSign
} from 'lucide-react';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
}

export const IntegrationTest = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const TEST_TELEGRAM_ID = '5953938402'; // Your Telegram ID for testing

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Test Connection',
        endpoint: '/api/version',
        test: () => starStoreService.testConnection()
      },
      {
        name: 'Get User Info',
        endpoint: `/api/users/${TEST_TELEGRAM_ID}`,
        test: () => starStoreService.getUserByTelegramId(TEST_TELEGRAM_ID)
      },
      {
        name: 'Get Referral Stats',
        endpoint: `/api/referral-stats/${TEST_TELEGRAM_ID}`,
        test: () => starStoreService.getReferralStats(TEST_TELEGRAM_ID)
      },
      {
        name: 'Get User Referrals',
        endpoint: `/api/referrals/${TEST_TELEGRAM_ID}`,
        test: () => starStoreService.getUserReferrals(TEST_TELEGRAM_ID)
      }
    ];

    for (const test of tests) {
      // Add loading state
      setTestResults(prev => [...prev, {
        endpoint: test.endpoint,
        status: 'loading'
      }]);

      try {
        const result = await test.test();
        
        setTestResults(prev => prev.map(r => 
          r.endpoint === test.endpoint 
            ? {
                endpoint: test.endpoint,
                status: result.success ? 'success' : 'error',
                data: result.data,
                error: result.error
              }
            : r
        ));

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        setTestResults(prev => prev.map(r => 
          r.endpoint === test.endpoint 
            ? {
                endpoint: test.endpoint,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : r
        ));
      }
    }

    setIsRunning(false);
    
    toast({
      title: "Integration Test Complete",
      description: "Check the results below to see the connection status.",
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'loading':
        return 'bg-blue-100 text-blue-800';
    }
  };

  const referralLink = generateTelegramReferralLink(TEST_TELEGRAM_ID);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Main App Integration Test
        </CardTitle>
        <CardDescription>
          Test the connection between Ambassador App and Main App (starstore.site)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Test Configuration:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Main App URL:</strong> https://starstore.site</p>
            <p><strong>Test Telegram ID:</strong> {TEST_TELEGRAM_ID}</p>
            <p><strong>Expected Referral Link:</strong></p>
            <a 
              href={referralLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
            >
              {referralLink}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Run Test Button */}
        <Button 
          onClick={runIntegrationTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Run Integration Tests
            </>
          )}
        </Button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.endpoint}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                
                {result.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                
                {result.data && (
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <strong>Response:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Integration Status Summary */}
        {testResults.length > 0 && !isRunning && (
          <div className="mt-4 p-4 rounded-lg border-2 border-dashed">
            <h3 className="font-medium mb-2">Integration Status:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>User Data: {testResults.find(r => r.endpoint.includes('/users/'))?.status === 'success' ? '✅ Connected' : '❌ Failed'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Referrals: {testResults.find(r => r.endpoint.includes('/referral-stats/'))?.status === 'success' ? '✅ Connected' : '❌ Failed'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};