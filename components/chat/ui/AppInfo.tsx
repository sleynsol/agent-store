import { App } from '@/types/app';

interface AppInfoProps {
  app: App;
  formatText: (text: string) => string;
}

export const AppInfo = ({ app, formatText }: AppInfoProps) => {
  return (
    <div className="mb-4 px-4 py-3 bg-muted/50 rounded-lg space-y-4">
      <div 
        className="text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: formatText(app.traits) }}
      />
      
      {/* Tools Section */}
      {app.tools?.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2">Available Tools</div>
          <div className="flex flex-wrap gap-2">
            {app.tools.map((tool) => (
              <div key={tool} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary">
                <span>
                  {tool === 'web' ? '🌐' : 
                   tool === 'calendar' ? '📅' : 
                   tool === 'data_pods' ? '📦' :
                   '📁'}
                </span>
                {tool === 'web' ? 'Web Access' : 
                 tool === 'calendar' ? 'Calendar Access' : 
                 tool === 'data_pods' ? 'Data Pods' :
                 'File Access'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 