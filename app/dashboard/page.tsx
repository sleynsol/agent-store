'use client';

import { useState, useEffect } from 'react';
import { Drawer } from '@/components/Drawer';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, History, Lock, Shield, ExternalLink, Wrench, Trash2, Users, Database } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeLogo } from '@/components/ThemeLogo';
import { getAppById } from '@/data/apps';
import { App } from '@/types/app';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

interface DashboardStats {
  totalChats: number;
  dataPodCount: number;
  historySize: number;
}

interface AppPermission {
  appId: string;
  appName: string;
  timestamp: number;
  imageUrl: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    dataPodCount: 0,
    historySize: 0
  });
  const [permittedApps, setPermittedApps] = useState<AppPermission[]>([]);
  const { theme } = useTheme();
  const [myAgents, setMyAgents] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<App | null>(null);

 useEffect(() => {
      // Calculate dashboard statistics from localStorage
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter(key => key.startsWith('appChat_'));
      const dataPodKeys = allKeys.filter(key => key.startsWith('dataPod_'));
      
      // Calculate total size of chat history
      const totalSize = allKeys.reduce((size, key) => {
        if (key.startsWith('appChat_') || key === 'conversationHistory') {
          return size + (localStorage.getItem(key)?.length || 0);
        }
        return size;
      }, 0);

      setStats({
        totalChats: chatKeys.length,
        dataPodCount: dataPodKeys.length,
        historySize: Math.round(totalSize / 1024) // Convert to KB
      });

      // Load apps with permissions
      const loadPermittedApps = async () => {
        try {
          const permissions = localStorage.getItem('conversation-permissions');
          if (!permissions) {
            setPermittedApps([]);
            return;
          }

          const parsedPermissions = JSON.parse(permissions);
          if (!parsedPermissions || Object.keys(parsedPermissions).length === 0) {
            setPermittedApps([]);
            return;
          }

          const apps: AppPermission[] = [];
          const validPermissions: Record<string, any> = {};

          for (const [appId, data] of Object.entries(parsedPermissions)) {
            if (!appId || typeof appId !== 'string') continue;
            
            try {
              const appInfo = await getAppById(appId);
              if (appInfo && appInfo.title && appInfo.imageUrl) {
                apps.push({
                  appId,
                  appName: appInfo.title,
                  timestamp: (data as any).timestamp || Date.now(),
                  imageUrl: appInfo.imageUrl
                });
                validPermissions[appId] = data;
              }
            } catch (error) {
              console.error(`Failed to load app info for ${appId}:`, error);
            }
          }

          // Update localStorage to only keep valid permissions
          localStorage.setItem('conversation-permissions', JSON.stringify(validPermissions));

          // Sort by most recently granted permissions
          apps.sort((a, b) => b.timestamp - a.timestamp);
          setPermittedApps(apps);
        } catch (error) {
          console.error('Failed to load permitted apps:', error);
          setPermittedApps([]);
        }
      };

      loadPermittedApps();
  }, []);

  useEffect(() => {
    const fetchMyAgents = async () => {
      try {
        const response = await fetch(`/api/my-agents?wallet=${user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch agents');
        
        const agents = await response.json();
        setMyAgents(agents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMyAgents();
    }
  }, [user]);

  const handleDeleteClick = (e: React.MouseEvent, agent: App) => {
    e.preventDefault(); // Prevent navigation
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;

    try {
      const response = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete agent');

      // Remove the agent from the list
      setMyAgents(current => current.filter(agent => agent.id !== agentToDelete.id));
      
      // Clear chat history for this agent
      localStorage.removeItem(`appChat_${agentToDelete.id}`);
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Drawer />
        </div>
        <ThemeLogo />
      </header>

      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Chats</p>
              <p className="text-2xl font-bold">{stats.totalChats}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Pods</p>
              <p className="text-2xl font-bold">{stats.dataPodCount}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">History Size</p>
              <p className="text-2xl font-bold">{stats.historySize} KB</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Agents Section */}
      <div className="rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">My Agents</h2>
          </div>
          <Link
            href="/build"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Create New Agent
          </Link>
        </div>
        
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading your agents...</p>
        ) : myAgents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">
              You haven't created any agents yet
            </p>
            <Link
              href="/build"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Build Your First Agent
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myAgents.map((agent) => (
              <div 
                key={agent.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={agent.imageUrl}
                    alt={agent.title}
                    fill
                    className="rounded-xl object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/app/${agent.id}`}
                        className="font-medium hover:underline"
                      >
                        {agent.title}
                      </Link>
                      <div className="flex items-center gap-1">
                        {!agent.isPublic && (
                          <div className="group relative">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-secondary rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Private Agent
                            </div>
                          </div>
                        )}
                        {agent.creatorWallet && (
                          <div className="group relative">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-secondary rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Created by: {agent.creatorWallet.slice(0, 4)}...{agent.creatorWallet.slice(-4)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, agent)}
                      className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
                      aria-label="Delete agent"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div 
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: formatText(agent.traits) }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Synchronized Agents */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Synchronized Agents</h2>
        </div>
        
        {permittedApps.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No agents are synchronized with your conversation history. Synchronized agents can access and learn from your past conversations.
          </p>
        ) : (
          <div className="space-y-4">
            {permittedApps.map((app) => (
              <div 
                key={app.appId}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={app.imageUrl}
                      alt={app.appName}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{app.appName}</div>
                    <div className="text-xs text-muted-foreground">
                      Synchronized: {new Date(app.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const permissions = JSON.parse(localStorage.getItem('conversation-permissions') || '{}');
                    delete permissions[app.appId];
                    localStorage.setItem('conversation-permissions', JSON.stringify(permissions));
                    setPermittedApps(current => current.filter(a => a.appId !== app.appId));
                  }}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove synchronization"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {agentToDelete?.title}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 