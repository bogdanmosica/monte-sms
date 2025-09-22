import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  DollarSign,
  FileText,
  UserPlus,
  Users,
  Eye,
  Activity as ActivityIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Activity } from '../types/dashboard';

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const router = useRouter();

  const getActivityRoute = (activity: Activity) => {
    switch (activity.type) {
      case 'enrollment':
        return '/admin/enrollment';
      case 'payment':
        return '/admin/payments';
      case 'observation':
        return '/admin/observations';
      case 'staff':
        return '/admin/staff';
      default:
        return '/admin';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-secondary-foreground" />
            Recent Activity
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/activities')}
            className="text-primary hover:text-primary/80"
          >
            <Eye className="w-4 h-4 mr-1" />
            View All
          </Button>
        </CardTitle>
        <CardDescription>
          Latest school activities and updates from the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ActivityIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No recent activities</p>
              <p className="text-xs">Activities will appear here as they happen</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(getActivityRoute(activity))}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'enrollment'
                        ? 'bg-primary/20'
                        : activity.type === 'payment'
                          ? 'bg-green-500/20'
                          : activity.type === 'access'
                            ? 'bg-blue-500/20'
                            : activity.type === 'observation'
                              ? 'bg-purple-500/20'
                              : 'bg-secondary/20'
                    }`}
                  >
                    {activity.type === 'enrollment' && (
                      <UserPlus className="w-4 h-4 text-primary" />
                    )}
                    {activity.type === 'payment' && (
                      <DollarSign className="w-4 h-4 text-green-500" />
                    )}
                    {activity.type === 'staff' && (
                      <Users className="w-4 h-4 text-secondary-foreground" />
                    )}
                    {activity.type === 'access' && (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    {activity.type === 'observation' && (
                      <FileText className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    variant={
                      activity.status === 'completed' ? 'default' : 'secondary'
                    }
                    className={`text-xs ${
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : activity.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          : activity.status === 'failed'
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : ''
                    }`}
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
        {activities.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/activities')}
              className="w-full"
            >
              View All Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}