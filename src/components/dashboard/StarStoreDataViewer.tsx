import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { dataSyncService } from '@/services/dataSyncService';
import { 
  RefreshCw, 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  Star,
  Clock,
  Activity,
  Database,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SyncStatus {
  inProgress: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
}

export const StarStoreDataViewer = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    inProgress: false,
    lastSync: null,
    nextSync: null
  });
  const [loading, setLoading] = useState(false);
  const [lastSyncTimes, setLastSyncTimes] = useState({
    users: null as string | null,
    referrals: null as string | null,
    transactions: null as string | null
  });
  
  const { toast } = useToast();

  // Load cached data on component mount
  useEffect(() => {
    dataSyncService.startAutoSync();
    loadCachedData();
    updateSyncStatus();
    
    // Update sync status every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);
    return () => {
      clearInterval(interval);
      dataSyncService.stopAutoSync();
    };
  }, []);

  const updateSyncStatus = () => {
    setSyncStatus(dataSyncService.getSyncStatus());
  };

  const loadCachedData = async () => {
    setLoading(true);
    try {
      const [usersData, referralsData, transactionsData, analyticsData] = await Promise.all([
        dataSyncService.getCachedUsers(50, 1),
        dataSyncService.getCachedReferrals(50, 1),
        dataSyncService.getCachedTransactions(50, 1),
        dataSyncService.getCachedAnalytics()
      ]);

      setUsers(usersData.users);
      setReferrals(referralsData.referrals);
      setTransactions(transactionsData.transactions);
      setAnalytics(analyticsData);
      
      setLastSyncTimes({
        users: usersData.lastSync,
        referrals: referralsData.lastSync,
        transactions: transactionsData.lastSync
      });
    } catch (error) {
      toast({
        title: "Failed to Load Cached Data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await dataSyncService.syncAllData();
      
      if (result.success) {
        toast({
          title: "Sync Successful! 🎉",
          description: `Synced ${result.synced.users} users, ${result.synced.referrals} referrals, ${result.synced.transactions} transactions`,
        });
        await loadCachedData();
      } else {
        toast({
          title: "Sync Completed with Errors",
          description: `Errors: ${result.errors.join(', ')}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      updateSyncStatus();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Star Store Data Viewer
              </CardTitle>
              <CardDescription>
                Live data from your main Star Store app with local caching for resilience
              </CardDescription>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={loading || syncStatus.inProgress}
              className="flex items-center gap-2"
            >
              {loading || syncStatus.inProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {syncStatus.inProgress ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : syncStatus.lastSync ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">Sync Status</p>
                <p className="text-sm text-muted-foreground">
                  {syncStatus.inProgress ? 'Syncing...' : 
                   syncStatus.lastSync ? 'Up to date' : 'Never synced'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Last Sync</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(syncStatus.lastSync?.toISOString() || null)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Next Auto Sync</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(syncStatus.nextSync?.toISOString() || null)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(analytics.total_users)}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(analytics.active_referrals)}</p>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">${formatNumber(analytics.total_earnings)}</p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(analytics.total_stars_traded)}</p>
                  <p className="text-sm text-muted-foreground">Stars Traded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Tables */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Referrals ({referrals.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Data</CardTitle>
              <CardDescription>
                Last synced: {formatDate(lastSyncTimes.users)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Telegram ID</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Stars Earned</TableHead>
                      <TableHead>Ambassador</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {user.username || 'N/A'}
                        </TableCell>
                        <TableCell>{user.telegram_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {user.active_referrals}/{user.total_referrals}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>${user.total_earnings}</TableCell>
                        <TableCell>{formatNumber(user.total_stars_earned)}</TableCell>
                        <TableCell>
                          {user.is_ambassador ? (
                            <Badge className="bg-purple-100 text-purple-800">
                              {user.ambassador_tier || 'Ambassador'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.last_active)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Referrals Data</CardTitle>
              <CardDescription>
                Last synced: {formatDate(lastSyncTimes.referrals)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Withdrawn</TableHead>
                      <TableHead>Referrer Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {referral.referrer_username || referral.referrer_user_id}
                        </TableCell>
                        <TableCell>
                          {referral.referred_username || referral.referred_user_id}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={referral.status === 'active' ? 'default' : 
                                   referral.status === 'pending' ? 'secondary' : 'outline'}
                          >
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(referral.date_referred)}</TableCell>
                        <TableCell>
                          {referral.withdrawn ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {referral.referrer_is_ambassador ? (
                            <Badge className="bg-purple-100 text-purple-800">
                              {referral.referrer_tier || 'Ambassador'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions Data</CardTitle>
              <CardDescription>
                Last synced: {formatDate(lastSyncTimes.transactions)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Stars</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge 
                            variant={transaction.type === 'buy' ? 'default' : 'secondary'}
                          >
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.username || transaction.telegram_id}
                        </TableCell>
                        <TableCell>${transaction.amount}</TableCell>
                        <TableCell>{formatNumber(transaction.stars)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'outline'}
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.is_premium ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {transaction.premium_duration}m
                            </Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};