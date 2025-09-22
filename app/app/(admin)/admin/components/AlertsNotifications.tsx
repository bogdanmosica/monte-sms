import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Alert } from '../types/dashboard';

interface AlertsNotificationsProps {
  alerts: Alert[];
}

export function AlertsNotifications({ alerts }: AlertsNotificationsProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Alerts & Notifications
        </CardTitle>
        <CardDescription>
          Important items requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts at this time
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                {alert.icon === 'AlertCircle' && (
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'error' ? 'text-destructive' :
                    alert.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                  }`} />
                )}
                {alert.icon === 'Clock' && (
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                )}
                {alert.icon === 'CheckCircle' && (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                )}
                {alert.icon === 'DollarSign' && (
                  <DollarSign className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
                {alert.action ? (
                  <Button variant="outline" size="sm">
                    {alert.action}
                  </Button>
                ) : (
                  <Badge variant={alert.type === 'success' ? 'default' : 'secondary'}
                         className={alert.type === 'success' ? 'bg-green-100 text-green-700' : ''}>
                    {alert.type === 'success' ? 'Complete' : alert.priority}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}