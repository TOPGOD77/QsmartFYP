import React from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  variant?: 'default' | 'sidebar';
  className?: string;
}

export function AppShell({ children, variant = 'default', className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen', variant === 'sidebar' && 'flex', className)}>
      {children}
    </div>
  );
} 