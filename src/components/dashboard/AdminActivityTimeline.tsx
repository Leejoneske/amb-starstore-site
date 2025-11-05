import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  UserPlus, 
  DollarSign, 
  Mail,
  UserX,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'approval' | 'rejection' | 'payout' | 'signup' | 'email';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface AdminActivityTimelineProps {
  activities?: Activity[];
  limit?: number;
}

export const AdminActivityTimeline = ({ activities, limit = 10 }: AdminActivityTimelineProps) => {
  // Mock data for demonstration - in real app, fetch from database
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'approval',
      title: 'Ambassador Approved',
      description: 'John Doe application approved',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: 'Admin'
    },
    {
      id: '2',
      type: 'signup',
      title: 'New Application',
      description: 'Jane Smith submitted ambassador application',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: '3',
      type: 'payout',
      title: 'Payout Processed',
      description: '$150.00 sent to Mike Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ];

  const displayActivities = (activities || mockActivities).slice(0, limit);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejection':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'payout':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'signup':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      case 'email':
        return <Mail className="h-4 w-4 text-orange-600" />;
    }
  };

  const getBadgeVariant = (type: Activity['type']) => {
    switch (type) {
      case 'approval':
        return 'default';
      case 'rejection':
        return 'destructive';
      case 'payout':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest admin actions and system events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="mt-1 flex-shrink-0">
                  <div className="p-2 rounded-full bg-muted">
                    {getIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <Badge variant={getBadgeVariant(activity.type)} className="text-xs flex-shrink-0">
                      {activity.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    {activity.user && <span>• by {activity.user}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
