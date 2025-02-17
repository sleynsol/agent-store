import { App } from '@/types/app';

interface ToolSuggestionsProps {
  isVisible: boolean;
  tools: string[];
  onSelect: (tool: string) => void;
}

export function ToolSuggestions({ isVisible, tools, onSelect }: ToolSuggestionsProps) {
  if (!isVisible || tools.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full bg-background border rounded-lg shadow-lg p-2 space-y-1">
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => onSelect(tool)}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors flex items-center gap-2"
        >
          <span>
            {tool === 'web' ? '🌐' : 
             tool === 'data_pods' ? '📦' :
             '🔧'}
          </span>
          <div>
            <div className="font-medium">@{tool}</div>
            <div className="text-xs text-muted-foreground">
              {tool === 'web' ? 'Search the web' : 
               tool === 'data_pods' ? 'Access data pods' :
               'Use tool'}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
