import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  Key,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuthTracking, useUserActivationStats, UserAuthStatus } from '@/hooks/useAuthTracking';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AmbassadorStatusListProps {
  isAdmin: boolean;
}

export const AmbassadorStatusList = ({ isAdmin }: AmbassadorStatusListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const { data: userStatuses, isLoading, refetch } = useAuthTracking(isAdmin);
  const { data: stats } = useUserActivationStats(isAdmin);
  const { toast } = useToast();

  if (!isAdmin) return null;

  const filteredUsers = userStatuses?.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedTab) {
      case 'activated':
        return matchesSearch && user.is_activated;
      case 'pending':
        return matchesSearch && !user.is_activated;
      case 'recent':
        return matchesSearch && user.days_since_approval <= 7;
      default:
        return matchesSearch;
    }
  }) || [];

  const getStatusBadge = (user: UserAuthStatus) => {
    if (user.is_activated) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Activated
        </Badge>
      );
    }
    
    if (user.days_since_approval > 7) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const resendActivationEmail = async (user: UserAuthStatus) => {
    try {
      // Call the send-approval-email function again
      const { error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          userEmail: user.email,
          userName: user.full_name,
          tempPassword: 'TEMP_PASSWORD', // This would need to be regenerated or stored
          referralCode: 'REF_CODE' // This would need to be fetched from ambassador profile
        }
      });

      if (error) throw error;

      toast({
        title: "Email Resent",
        description: `Activation email sent to ${user.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend activation email",
        variant: "destructive"
      });
    }
  };

  const exportUserData = () => {
    if (!userStatuses) return;

    const csvData = userStatuses.map(user => ({
      'Name': user.full_name,
      'Email': user.email,
      'Status': user.is_activated ? 'Activated' : 'Pending',
      'Days Since Approval': user.days_since_approval,
      'Last Sign In': user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never',
      'Email Confirmed': user.email_confirmed_at ? 'Yes' : 'No',
      'Password Changed': user.password_changed ? 'Yes' : 'No'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ambassador-status-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Ambassador status data exported successfully",
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.activated}</div>
                <div className="text-xs text-muted-foreground">Activated</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.recent_approvals}</div>
                <div className="text-xs text-muted-foreground">Recent</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.never_logged_in}</div>
                <div className="text-xs text-muted-foreground">Never Logged</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Ambassador Activation Status</h3>
            <p className="text-sm text-muted-foreground">Track user activation and login status</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportUserData}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({userStatuses?.length || 0})</TabsTrigger>
            <TabsTrigger value="activated">Activated ({stats?.activated || 0})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
            <TabsTrigger value="recent">Recent ({stats?.recent_approvals || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No ambassadors found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{user.full_name}</h4>
                            {getStatusBadge(user)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Approved {user.days_since_approval} days ago</span>
                            {user.last_sign_in_at && (
                              <span>Last login: {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}</span>
                            )}
                            {!user.password_changed && user.is_activated && (
                              <Badge variant="outline" className="text-xs">
                                <Key className="h-3 w-3 mr-1" />
                                Temp Password
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!user.is_activated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendActivationEmail(user)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Resend Email
                          </Button>
                        )}
                        
                        {user.days_since_approval > 7 && !user.is_activated && (
                          <Badge variant="destructive" className="text-xs">
                            Follow up needed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};