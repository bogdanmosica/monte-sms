'use client';

import { AlertTriangle, Database, FileX, Lock, Wifi } from 'lucide-react';
import type React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'card' | 'alert' | 'inline';
}

export function ErrorState({
  title,
  description,
  action,
  icon: Icon = AlertTriangle,
  variant = 'card',
}: ErrorStateProps) {
  if (variant === 'alert') {
    return (
      <Alert className="border-destructive/20 bg-destructive/5">
        <Icon className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          <strong>{title}</strong> - {description}
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="ml-2 bg-transparent"
            >
              {action.label}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
        <Icon className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-destructive">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-destructive/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-destructive" />
        </div>
        <CardTitle className="text-xl text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent>
          <Button
            onClick={action.onClick}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {action.label}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// Specific error state components
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      icon={Wifi}
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  );
}

export function UnauthorizedError({ onLogin }: { onLogin?: () => void }) {
  return (
    <ErrorState
      title="Access Denied"
      description="You do not have permission to view this page. Please contact your administrator if you believe this is an error."
      icon={Lock}
      action={onLogin ? { label: 'Login', onClick: onLogin } : undefined}
    />
  );
}

export function DataLoadError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Failed to Load Data"
      description="Unable to load the requested information. This might be a temporary issue."
      icon={Database}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
      variant="inline"
    />
  );
}

export function NotFoundError({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <ErrorState
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      icon={FileX}
      action={onGoBack ? { label: 'Go Back', onClick: onGoBack } : undefined}
    />
  );
}
