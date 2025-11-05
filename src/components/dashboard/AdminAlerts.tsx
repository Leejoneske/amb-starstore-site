import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Bell,
  Clock,
  TrendingDown,
  UserX,
  FileWarning
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
}

interface AdminAlertsProps {
  pendingApplications?: number;
  inactiveAmbassadors?: number;
  lowPerformers?: number;
}

export const AdminAlerts = ({ 
  pendingApplications = 0, 
  inactiveAmbassadors = 0,
  lowPerformers = 0 
}: AdminAlertsProps) => {
  const alerts: Alert[] = [];

  if (pendingApplications > 0) {
    alerts.push({
      id: 'pending-apps',
      type: 'warning',
      title: `${pendingApplications} Pending Applications`,
      description: 'Ambassador applications awaiting review',
      action: 'applications',
      actionLabel: 'Review Now'
    });
  }

  if (inactiveAmbassadors > 3) {
    alerts.push({
      id: 'inactive-ambassadors',
      type: 'info',
      title: `${inactiveAmbassadors} Inactive Ambassadors`,
      description: 'Ambassadors with no activity in 30 days',
      action: 'ambassadors',
      actionLabel: 'View List'
    });
  }

  if (lowPerformers > 0) {
    alerts.push({
      id: 'low-performers',
      type: 'info',
      title: `${lowPerformers} Low Performing Ambassadors`,
      description: 'Below average quality transaction rate',
      action: 'ambassadors',
      actionLabel: 'View Details'
    });
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <FileWarning className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-success" />
            Alerts & Notifications
          </CardTitle>
          <CardDescription>All clear - no pending issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-success">
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto mb-3 flex items-center justify-center">
              <Bell className="h-8 w-8" />
            </div>
            <p className="font-medium">Everything looks good!</p>
            <p className="text-sm text-muted-foreground mt-1">No alerts or action items at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-warning" />
          Alerts & Notifications
        </CardTitle>
        <CardDescription>{alerts.length} item(s) require attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
                {alert.actionLabel && (
                  <Button variant="outline" size="sm">
                    {alert.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
