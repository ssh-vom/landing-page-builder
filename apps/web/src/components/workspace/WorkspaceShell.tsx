import { type ReactNode } from 'react';

interface WorkspaceShellProps {
  topBar: ReactNode;
  sidebar: ReactNode;
  canvas: ReactNode;
  assistant: ReactNode;
}

/**
 * Three-pane editor layout (sidebar · canvas · assistant) under a top bar.
 * Mirrors the structure shown in internal-design-editor.png.
 */
export function WorkspaceShell({ topBar, sidebar, canvas, assistant }: WorkspaceShellProps) {
  return (
    <div className="h-screen flex flex-col bg-paper text-ink">
      {topBar}
      <div className="flex-1 flex min-h-0">
        {sidebar}
        {canvas}
        {assistant}
      </div>
    </div>
  );
}
