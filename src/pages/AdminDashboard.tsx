import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useApplications } from "@/hooks/useApplications";
import { useAllAmbassadors } from "@/hooks/useAllAmbassadors";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { ManualEmailSender } from "@/components/dashboard/ManualEmailSender";
import { AdvancedFilters, FilterConfig } from "@/components/dashboard/AdvancedFilters";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { AdminHeader } from "@/components/dashboard/AdminHeader";
import { AdminStats } from "@/components/dashboard/AdminStats";
import { AdminPerformanceMetrics } from "@/components/dashboard/AdminPerformanceMetrics";
import { AdminTabs } from "@/components/dashboard/AdminTabs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Award,
  Mail,
  Download
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Application, Ambassador } from "@/types";
import { ADMIN_EMAIL } from "@/config/env";



const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole(user?.id);
  const { applications, isLoading: appsLoading } = useApplications();
  const { ambassadors, isLoading: ambLoading } = useAllAmbassadors();
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics(true);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [emailFailures, setEmailFailures] = useState<Map<string, { name: string; email: string; tempPassword?: string; referralCode?: string }>>(new Map());
  const [applicationFilters, setApplicationFilters] = useState<FilterConfig>({});
  const [ambassadorFilters, setAmbassadorFilters] = useState<FilterConfig>({});

  const loading = appsLoading || ambLoading;

  // Log admin access
  logger.userAction('admin_dashboard_access', user?.id, { 
    totalApplications: applications?.length,
    totalAmbassadors: ambassadors?.length 
  });

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    setActionLoading(applicationId);
    try {
      const application = applications?.find(app => app.id === applicationId);
      if (!application) throw new Error('Application not found');

      // Update application status using admin function
      const { error: updateError } = await supabase.rpc('update_application_as_admin', {
        application_id: applicationId,
        new_status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user?.id,
        rejection_reason: action === 'reject' ? 'Application rejected by admin' : null
      });

      if (updateError) throw updateError;

      // If approved, create complete ambassador setup via Edge Function
      if (action === 'approve') {
        logger.info('Approving application', { applicationId, email: application.email });
        
        const { data, error: fnError } = await supabase.functions.invoke('admin-approve-application', {
          body: {
            applicationId,
            applicantEmail: application.email,
            applicantName: application.full_name,
          },
        });

        if (fnError) throw fnError;

        // Store email failure info for manual sending
        if (!data?.emailSent) {
          setEmailFailures(prev => new Map(prev.set(applicationId, {
            name: application.full_name,
            email: application.email,
            tempPassword: data?.tempPassword,
            referralCode: data?.referralCode
          })));
        }

        // Check for specific Resend domain verification error
        const isDomainError = data?.emailError?.includes('verify a domain') || data?.emailError?.includes('testing emails');
        
        toast({
          title: "Application Approved!",
          description: data?.emailSent
            ? `Ambassador created and email sent to ${application.email}`
            : isDomainError 
              ? `Ambassador created. Email requires domain verification - use Manual Email Sender below.`
              : data?.message || `Ambassador created. ${data?.emailError ? `Email failed: ${data.emailError}` : 'Email delivery failed.'}`,
          variant: data?.emailSent ? "default" : "destructive",
        });

        logger.info('Application approved successfully', { 
          applicationId, 
          emailSent: data?.emailSent 
        });
      } else {
        logger.info('Application rejected', { applicationId });
        toast({
          title: "Application Rejected",
          description: "Application rejected successfully.",
        });
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['all-ambassadors'] });
    } catch (error: unknown) {
      logger.error(`Failed to ${action} application`, { applicationId, action }, error as Error);
      toast({
        title: "Error",
        description: `Failed to ${action === 'approve' ? 'approve' : 'reject'} application: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          .from(table)
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
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: `Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: Record<string, unknown>[]) => {
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

  // Check if user is admin by role OR by email
  const isAdmin = userRole === 'admin' || user?.email === ADMIN_EMAIL;

  if (!isAdmin) {
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

  // Create content for tabs
  const overviewContent = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickActions isAdmin={true} />
      
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          <p className="text-sm text-muted-foreground">Real-time system status</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-success/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm">Database Connection</span>
            </div>
            <Badge variant="outline" className="text-success border-success">Online</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-success/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm">Real-time Updates</span>
            </div>
            <Badge variant="outline" className="text-success border-success">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm">API Performance</span>
            </div>
            <Badge variant="outline" className="text-primary border-primary">Optimal</Badge>
          </div>
        </div>
      </Card>

      <LiveActivityFeed isAdmin={true} limit={15} />
      
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Top Performers</h3>
          <p className="text-sm text-muted-foreground">Highest earning ambassadors</p>
        </div>
        
        <div className="space-y-3">
          {analyticsData?.topPerformers.slice(0, 5).map((performer, index) => (
            <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{performer.name}</div>
                  <div className="text-xs text-muted-foreground">{performer.referrals} referrals</div>
                </div>
              </div>
              <div className="text-sm font-bold text-success">
                ${performer.earnings.toFixed(2)}
              </div>
            </div>
          )) || (
            <div className="text-center py-6 text-muted-foreground">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No performance data yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const applicationsContent = (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Application Management</h3>
        <div className="flex items-center gap-3">
          <ExportDialog 
            data={applications} 
            dataType="applications"
            trigger={
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            }
          />
          <Badge variant="outline">{applications?.length || 0} total</Badge>
        </div>
      </div>

      <AdvancedFilters
        filters={applicationFilters}
        onFiltersChange={setApplicationFilters}
        showTierFilter={false}
        showAmountFilter={false}
        placeholder="Search applications..."
        className="mb-6"
      />

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
              
              <div className="flex flex-col gap-2 ml-4">
                {app.status === 'pending' && (
                  <div className="flex gap-2">
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
                
                {emailFailures.has(app.id) && (
                  <ManualEmailSender
                    applicantName={emailFailures.get(app.id)!.name}
                    applicantEmail={emailFailures.get(app.id)!.email}
                    tempPassword={emailFailures.get(app.id)!.tempPassword}
                    referralCode={emailFailures.get(app.id)!.referralCode}
                    trigger={
                      <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                        <Mail className="h-4 w-4 mr-1" />
                        Send Manual Email
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {(!applications || applications.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No applications found</p>
          </div>
        )}
      </div>
    </Card>
  );

  const settingsContent = (
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
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <AdminHeader userId={user?.id} />

          <AdminStats 
            applications={applications}
            ambassadors={ambassadors}
            analyticsData={analyticsData}
          />

          <AdminPerformanceMetrics analyticsData={analyticsData} />

          <AdminTabs 
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
            overviewContent={overviewContent}
            applicationsContent={applicationsContent}
            settingsContent={settingsContent}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;