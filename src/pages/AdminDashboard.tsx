import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useApplications } from "@/hooks/useApplications";
import { useAllAmbassadors } from "@/hooks/useAllAmbassadors";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Settings,
  UserCheck,
  UserX,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  experience: string;
  why_join: string;
  referral_strategy: string;
}

interface Ambassador {
  id: string;
  user_id: string;
  referral_code: string;
  current_tier: string;
  total_referrals: number;
  total_earnings: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);
  const { applications, isLoading: appsLoading, updateApplicationStatus } = useApplications();
  const { ambassadors, isLoading: ambLoading } = useAllAmbassadors();

  const loading = appsLoading || ambLoading;

  // Calculate stats
  const stats = {
    totalApplications: applications?.length || 0,
    pendingApplications: applications?.filter(app => app.status === 'pending').length || 0,
    totalAmbassadors: ambassadors?.length || 0,
    totalEarnings: ambassadors?.reduce((sum, amb) => sum + amb.total_earnings, 0) || 0
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      await updateApplicationStatus.mutateAsync({
        applicationId,
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' ? 'Application rejected by admin' : undefined
      });

      // If approved, create ambassador profile
      if (action === 'approve') {
        const application = applications?.find(app => app.id === applicationId);
        if (application) {
          // First, get or create user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', application.email)
            .single();

          if (profile) {
            // Create ambassador profile
            await supabase
              .from('ambassador_profiles')
              .insert({
                user_id: profile.id,
                referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
                status: 'active',
                approved_at: new Date().toISOString(),
                approved_by: user?.id
              });
          }
        }
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have admin privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage applications, ambassadors, and system settings</p>
          </div>
          <Badge variant="destructive" className="text-sm">
            Admin Access
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalAmbassadors}</div>
                <div className="text-sm text-muted-foreground">Active Ambassadors</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-info/10">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Paid Out</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="ambassadors">Ambassadors</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Application Management</h3>
                <Badge variant="outline">{applications?.length || 0} total</Badge>
              </div>

              <div className="space-y-4">
                {applications?.map((app) => (
                  <div key={app.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{app.full_name}</h4>
                          <Badge 
                            variant={app.status === 'pending' ? 'default' : app.status === 'approved' ? 'default' : 'destructive'}
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{app.email}</p>
                        <p className="text-sm mb-3">{app.experience}</p>
                        <div className="text-xs text-muted-foreground">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {app.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            onClick={() => handleApplicationAction(app.id, 'approve')}
                            className="bg-success hover:bg-success/90"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApplicationAction(app.id, 'reject')}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(!applications || applications.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No applications found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Ambassadors Tab */}
          <TabsContent value="ambassadors" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Ambassador Management</h3>
                <Badge variant="outline">{ambassadors?.length || 0} active</Badge>
              </div>

              <div className="space-y-4">
                {ambassadors?.map((amb) => (
                  <div key={amb.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{amb.profiles.full_name}</h4>
                          <Badge variant="outline">{amb.current_tier}</Badge>
                          <Badge variant={amb.status === 'active' ? 'default' : 'secondary'}>
                            {amb.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{amb.profiles.email}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Referrals:</span> {amb.total_referrals}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Earnings:</span> ${amb.total_earnings.toFixed(2)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Code:</span> {amb.referral_code}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!ambassadors || ambassadors.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No ambassadors found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">System Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Database Management</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Clear all data and reset the system to initial state.
                  </p>
                  <Button variant="destructive" size="sm">
                    Reset Database
                  </Button>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export all applications and ambassador data.
                  </p>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;