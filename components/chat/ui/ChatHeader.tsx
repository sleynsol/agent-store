import { Users } from 'lucide-react';
import Image from 'next/image';
import { App } from '@/types/app';
import { SyncIndicator as HistoryPermissionIndicator } from '@/components/SyncIndicator';

interface ChatHeaderProps {
  app: App;
  isAppInfoExpanded: boolean;
  setIsAppInfoExpanded: (expanded: boolean) => void;
  onPermissionGranted: () => void;
  onPermissionRevoked: () => void;
  appId: string;
}

export const ChatHeader = ({
  app,
  isAppInfoExpanded,
  setIsAppInfoExpanded,
  onPermissionGranted,
  onPermissionRevoked,
  appId
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={app.imageUrl}
            alt={app.title}
            fill
            className="rounded-xl object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-bold text-xl">{app.title}</h1>
            {app.creatorWallet && (
              <div className="group relative">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-secondary rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Created by: {app.creatorWallet.slice(0, 4)}...{app.creatorWallet.slice(-4)}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsAppInfoExpanded(!isAppInfoExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
          >
            {isAppInfoExpanded ? 'Hide description' : 'Show description'}
          </button>
        </div>
      </div>
      <HistoryPermissionIndicator 
        appId={appId}
        onPermissionGranted={onPermissionGranted}
        onPermissionRevoked={onPermissionRevoked}
      />
    </div>
  );
}; 