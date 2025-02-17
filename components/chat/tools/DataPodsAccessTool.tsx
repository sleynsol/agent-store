import { FileText, Database } from 'lucide-react';
import { ToolInvocation } from '@/types/chat';

export const DataPodsAccessTool = ({ part }: { part: ToolInvocation }) => {
  if (part.toolName !== 'data_pods_access') {
    return null;
  }

  const { state, args, result } = part;

  return (
    <div className="mt-2 space-y-2 border-t pt-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {state === 'partial-call' ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="animate-pulse">Searching data pods...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Search completed</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground font-medium">
            Searching for: "{args?.query || ''}"
          </span>
        </div>
      </div>
    </div>
  );
}; 