import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { getAppById } from '@/data/apps';

type SyncState = 'red' | 'yellow' | 'green';

interface SyncIndicatorProps {
  appId: string;
  onPermissionGranted: () => void;
  onPermissionRevoked?: () => void;
}

export function SyncIndicator({ appId, onPermissionGranted, onPermissionRevoked }: SyncIndicatorProps) {
  const [syncState, setSyncState] = useState<SyncState>('red');
  const [appName, setAppName] = useState<string>('');

  // Fetch app name when component mounts
  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const app = await getAppById(appId);
        if (app) {
          setAppName(app.title);
        }
      } catch (error) {
        console.error('Failed to fetch app name:', error);
      }
    };
    fetchAppName();
  }, [appId]);

  useEffect(() => {
    // Check if we already have permission
    const checkPermission = async () => {
      const permissions = localStorage.getItem('conversation-permissions');
      if (permissions) {
        const parsed = JSON.parse(permissions);
        if (parsed[appId]) {
          setSyncState('green');
          onPermissionGranted();
        }
      }
    };

    checkPermission();
  }, [appId, onPermissionGranted]);

  const requestPermission = async () => {
    if (!appName) return;


    try {
      // Store permission in localStorage
      const permissions = JSON.parse(localStorage.getItem('conversation-permissions') || '{}');
      permissions[appId] = {
        timestamp: Date.now(),
      };
      localStorage.setItem('conversation-permissions', JSON.stringify(permissions));

      setSyncState('green');
      onPermissionGranted();
    } catch (error) {
      console.error('Permission request failed:', error);
      setSyncState('red');
    }
  };

  const revokePermission = () => {
    // Remove permission from localStorage
    const permissions = JSON.parse(localStorage.getItem('conversation-permissions') || '{}');
    delete permissions[appId];
    localStorage.setItem('conversation-permissions', JSON.stringify(permissions));
    
    setSyncState('red');
    onPermissionRevoked?.();
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={syncState === 'green' ? revokePermission : syncState === 'red' ? requestPermission : undefined}
        disabled={syncState === 'yellow'}
        className={`flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50`}
      >
        <div className="relative">
          {/* Base dot */}
          <div 
            className={`relative z-10 w-3 h-3 rounded-full ${
              syncState === 'red' ? 'bg-red-500' :
              syncState === 'yellow' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
          />
          {/* Pulsing light animation */}
          {(syncState === 'yellow' || syncState === 'green') && (
            <>
              {/* Inner ping animation */}
              <div 
                className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${
                  syncState === 'yellow' ? 'bg-yellow-400' : 'bg-green-400'
                } opacity-75`}
              />
              {/* Outer glow */}
              <div 
                className={`absolute -inset-2 rounded-full blur-md ${
                  syncState === 'yellow' ? 'bg-yellow-500/30' : 'bg-green-500/30'
                } animate-pulse`}
              />
            </>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {syncState === 'red' && 'Not Synced'}
          {syncState === 'yellow' && 'Syncing...'}
          {syncState === 'green' && 'Synced'}
        </span>
      </button>
    </div>
  );
} 