'use client';

import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  MessageCircle,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'card' | 'inline';
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = FileText,
  variant = 'card',
}: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div className="text-center py-8">
        <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-primary hover:bg-primary/90"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-lg font-medium text-foreground mb-2">
            {title}
          </CardTitle>
          <CardDescription className="mb-4">{description}</CardDescription>
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-primary hover:bg-primary/90"
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specific empty state components
export function NoStudentsEmpty({
  onAddStudent,
}: {
  onAddStudent?: () => void;
}) {
  return (
    <EmptyState
      title="No students found"
      description="There are no students in your classroom yet. Students will appear here once they are enrolled."
      icon={Users}
      action={
        onAddStudent
          ? { label: 'Add Student', onClick: onAddStudent }
          : undefined
      }
    />
  );
}

export function NoActivitiesEmpty({
  onAddActivity,
}: {
  onAddActivity?: () => void;
}) {
  return (
    <EmptyState
      title="No activities recorded"
      description="Start tracking student learning by adding their first activity or observation."
      icon={BookOpen}
      action={
        onAddActivity
          ? { label: 'Add Activity', onClick: onAddActivity }
          : undefined
      }
    />
  );
}

export function NoMessagesEmpty({
  onSendMessage,
}: {
  onSendMessage?: () => void;
}) {
  return (
    <EmptyState
      title="No messages yet"
      description="Messages from teachers and school administration will appear here."
      icon={MessageCircle}
      action={
        onSendMessage
          ? { label: 'Send Message', onClick: onSendMessage }
          : undefined
      }
    />
  );
}

export function NoEventsEmpty({ onAddEvent }: { onAddEvent?: () => void }) {
  return (
    <EmptyState
      title="No upcoming events"
      description="School events and important dates will be displayed here when available."
      icon={Calendar}
      action={
        onAddEvent ? { label: 'Add Event', onClick: onAddEvent } : undefined
      }
    />
  );
}

export function NoObservationsEmpty({
  onAddObservation,
}: {
  onAddObservation?: () => void;
}) {
  return (
    <EmptyState
      title="No observations yet"
      description="Start documenting student development by adding your first observation."
      icon={ClipboardList}
      action={
        onAddObservation
          ? { label: 'Add Observation', onClick: onAddObservation }
          : undefined
      }
    />
  );
}

export function NoApplicationsEmpty({
  onAddApplication,
}: {
  onAddApplication?: () => void;
}) {
  return (
    <EmptyState
      title="No applications found"
      description="Student enrollment applications will appear here when submitted."
      icon={UserPlus}
      action={
        onAddApplication
          ? { label: 'New Application', onClick: onAddApplication }
          : undefined
      }
    />
  );
}

export function NoInvoicesEmpty({
  onCreateInvoice,
}: {
  onCreateInvoice?: () => void;
}) {
  return (
    <EmptyState
      title="No invoices found"
      description="Billing records and payment information will be displayed here."
      icon={DollarSign}
      action={
        onCreateInvoice
          ? { label: 'Create Invoice', onClick: onCreateInvoice }
          : undefined
      }
    />
  );
}

export function NoTasksEmpty({ onAddTask }: { onAddTask?: () => void }) {
  return (
    <EmptyState
      title="No tasks found"
      description="Create tasks to organize your classroom activities and administrative work."
      icon={ClipboardList}
      action={onAddTask ? { label: 'Add Task', onClick: onAddTask } : undefined}
    />
  );
}

export function NoSearchResultsEmpty({
  onClearSearch,
}: {
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      icon={Search}
      action={
        onClearSearch
          ? { label: 'Clear Search', onClick: onClearSearch }
          : undefined
      }
      variant="inline"
    />
  );
}

export function NoPortfolioEmpty({ onAddWork }: { onAddWork?: () => void }) {
  return (
    <EmptyState
      title="Portfolio is empty"
      description="Your child's learning activities and achievements will appear here as they complete them."
      icon={Award}
      action={onAddWork ? { label: 'Add Work', onClick: onAddWork } : undefined}
    />
  );
}
