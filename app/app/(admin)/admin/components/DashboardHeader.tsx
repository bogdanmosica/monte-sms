import { Button } from '@/components/ui/button';
import { FileText, Settings } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, Administrator
        </h1>
        <p className="text-muted-foreground">
          Sunshine Montessori Academy • Administrative Dashboard
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
        <Button className="bg-primary hover:bg-primary/90">
          <Settings className="w-4 h-4 mr-2" />
          School Settings
        </Button>
      </div>
    </div>
  );
}