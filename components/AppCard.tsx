import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { App } from '@/types/app';
import { EcosystemApp } from '@/types/ecosystem';
import { FlameButton } from './FlameButton';
import { ExternalLink } from 'lucide-react';

// Text formatting function
const formatText = (text: string) => {
  return text
    // Handle bold text (*text*)
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    // Handle italic text (_text_)
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Handle bullet points with minimal spacing
    .replace(/^[•\s]+(.+)$/gm, '<div class="flex items-start gap-2 leading-5"><span class="text-muted-foreground">•</span><span>$1</span></div>')
    .replace(/(?:\n|^)(\s*•\s*[^\n]+)/g, '<div class="flex items-start gap-2 leading-5"><span class="text-muted-foreground">•</span><span>$1</span></div>')
    // Handle line breaks
    .replace(/\\n/g, '')
    .replace(/\n/g, '');
};

type AppCardProps = {
  app: App | EcosystemApp;
};

export function AppCard({ app }: AppCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if ('redirectUrl' in app) {
      window.open(app.redirectUrl, '_blank');
    } else {
      router.push(`/app/${app.id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={app.imageUrl}
          alt={app.title}
          fill
          className="rounded-xl object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">{app.title}</h2>
            {'redirectUrl' in app && (
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          {'flames' in app && (
            <div onClick={(e) => e.stopPropagation()}>
              <FlameButton initialCount={app.flames} appId={app.id} />
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {'description' in app ? app.description : app.traits}
        </div>
      </div>
    </div>
  );
} 