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
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendApprovalEmailWithResend } from "@/lib/emailService";

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
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole(user?.id);
  const { applications, isLoading: appsLoading } = useApplications();
  const { ambassadors, isLoading: ambLoading } = useAllAmbassadors();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loading = appsLoading || ambLoading;

  // Calculate stats
  const stats = {
    totalApplications: applications?.length || 0,
    pendingApplications: applications?.filter(app => app.status === 'pending').length || 0,
    totalAmbassadors: ambassadors?.length || 0,
    totalEarnings: ambassadors?.reduce((sum, amb) => sum + amb.total_earnings, 0) || 0
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    setActionLoading(applicationId);
    try {
      const application = applications?.find(app => app.id === applicationId);
      if (!application) throw new Error('Application not found');

      // Update application status using admin function
      const { error: updateError } = await supabase.rpc('update_application_as_admin' as any, {
        application_id: applicationId,
        new_status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user?.id,
        rejection_reason: action === 'reject' ? 'Application rejected by admin' : null
      });

      if (updateError) throw updateError;

      // If approved, create complete ambassador setup
      if (action === 'approve') {
        // Generate a UUID for the profile
        const profileId = crypto.randomUUID();
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const tempPassword = 'STAR' + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Create profile using admin function
        const { data: profileData, error: profileError } = await supabase.rpc('create_profile_as_admin' as any, {
          profile_id: profileId,
          profile_email: application.email,
          profile_name: application.full_name
        });

        if (profileError) throw profileError;

        // Create ambassador profile using admin function
        const { data: ambassadorData, error: ambassadorError } = await supabase.rpc('create_ambassador_as_admin' as any, {
          user_id: profileId,
          referral_code: referralCode,
          approved_by: user?.id
        });

        if (ambassadorError) throw ambassadorError;

        // Send approval email with credentials
        const emailResult = await sendApprovalEmailWithResend({
          userEmail: application.email,
          userName: application.full_name,
          tempPassword: tempPassword,
          referralCode: referralCode
        });

        if (emailResult.success) {
          toast({
            title: "Application Approved!",
            description: `Ambassador profile created and welcome email sent to ${application.email}`,
          });
        } else {
          toast({
            title: "Application Approved!",
            description: `Ambassador profile created. Email sending failed: ${emailResult.error}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Application Rejected",
          description: "Application rejected successfully.",
        });
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['all-ambassadors'] });
    } catch (error: any) {
      // Error handling - log only in development
      if (import.meta.env.DEV) {
        console.error('Error updating application:', error);
      }
      toast({
        title: "Error",
        description: `Failed to ${action === 'approve' ? 'approve' : 'reject'} application: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDatabaseReset = async () => {
    if (!confirm('Are you sure you want to reset the database? This will delete ALL data and cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('reset');
      
      // Clear all data
      const tables = [
        'analytics_events',
        'payouts', 
        'transactions',
        'social_posts',
        'referrals',
        'applications',
        'ambassador_profiles',
        'user_roles',
        'profiles'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table as any)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Database has been reset successfully.",
      });

      // Refresh queries
      await queryClient.invalidateQueries();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error resetting database:', error);
      }
      toast({
        title: "Error",
        description: `Failed to reset database: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportData = () => {
    try {
      // Export applications
      const applicationsData = applications?.map(app => ({
        'Full Name': app.full_name,
        'Email': app.email,
        'Status': app.status,
        'Applied Date': new Date(app.created_at).toLocaleDateString(),
        'Experience': app.experience,
        'Why Join': app.why_join,
        'Strategy': app.referral_strategy
      })) || [];

      // Export ambassadors
      const ambassadorsData = ambassadors?.map(amb => ({
        'Name': amb.profiles?.full_name || 'N/A',
        'Email': amb.profiles?.email || 'N/A',
        'Tier': amb.current_tier,
        'Referrals': amb.total_referrals,
        'Earnings': amb.total_earnings,
        'Status': amb.status,
        'Referral Code': amb.referral_code
      })) || [];

      // Create CSV content
      const applicationsCSV = convertToCSV(applicationsData);
      const ambassadorsCSV = convertToCSV(ambassadorsData);

      // Download files
      downloadCSV(applicationsCSV, 'applications.csv');
      downloadCSV(ambassadorsCSV, 'ambassadors.csv');

      toast({
        title: "Success!",
        description: "Data exported successfully.",
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error exporting data:', error);
      }
      toast({
        title: "Error",
        description: `Failed to export data: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
                            disabled={actionLoading === app.id}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {actionLoading === app.id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApplicationAction(app.id, 'reject')}
                            disabled={actionLoading === app.id}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            {actionLoading === app.id ? 'Processing...' : 'Reject'}
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
                          <h4 className="font-semibold">{amb.profiles?.full_name || 'Unknown'}</h4>
                          <Badge variant="outline">{amb.current_tier}</Badge>
                          <Badge variant={amb.status === 'active' ? 'default' : 'secondary'}>
                            {amb.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{amb.profiles?.email || 'No email'}</p>
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
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDatabaseReset}
                    disabled={actionLoading === 'reset'}
                  >
                    {actionLoading === 'reset' ? 'Resetting...' : 'Reset Database'}
                  </Button>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export all applications and ambassador data.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportData}
                  >
                    Export CSV
                  </Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">RLS Policy Fix</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Run the simple-rls-fix.sql script in Supabase SQL Editor to fix admin permissions.
                  </p>
                  <div className="text-xs bg-muted p-2 rounded font-mono">
                    Copy and run: simple-rls-fix.sql
                  </div>
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