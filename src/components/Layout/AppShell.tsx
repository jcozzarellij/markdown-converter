import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  toolbar: ReactNode;
  sidebar: ReactNode;
}

export function AppShell({ children, toolbar, sidebar }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {toolbar}
      <div className="flex-1 flex overflow-hidden">
        {sidebar}
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}