import { type ReactNode } from 'react';

interface WorkspaceShellProps {
  topBar: ReactNode;
  sidebar: ReactNode;
  canvas: ReactNode;
  assistant?: ReactNode;
}

export function WorkspaceShell({ topBar, sidebar, canvas, assistant }: WorkspaceShellProps) {
  return (
    <div className="h-screen flex flex-col bg-white text-ink">
      {topBar}
      <div className="flex-1 flex min-h-0">
        {sidebar}
        {canvas}
        {assistant}
      </div>
    </div>
  );
}
