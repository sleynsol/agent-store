'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Database, ArrowLeft, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface DataPod {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  size: number;
  permissions: Array<{
    appId: string;
    appName: string;
    grantedAt: string;
  }>;
}

interface App {
  id: number;
  title: string;
  tools?: string[];
  imageUrl?: string;
}

export default function DataPodPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  
  const [pod, setPod] = useState<DataPod | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    // Load the data pod
    try {
      const podData = localStorage.getItem(`dataPod_${params.id}`);
      if (podData) {
        const found = JSON.parse(podData);
        // Initialize permissions array if it doesn't exist
        if (!found.permissions) {
          found.permissions = [];
        }
        setPod(found);
        setEditingName(found.name);
      }
    } catch (error) {
      console.error('Failed to load data pod:', error);
    }
  }, [params.id]);
  
  useEffect(() => {
    // Load available apps
    const loadApps = async () => {
      try {
        const responses = await Promise.all([
          fetch(`/api/my-agents?wallet=${user?.id}`),
          fetch('/api/agents')
        ]);
        
        // Check if responses are ok before parsing
        const validResponses = responses.filter(r => r.ok);
        
        if (validResponses.length === 0) {
          console.error('Failed to fetch apps: No valid responses');
          return;
        }
        
        const results = await Promise.all(
          validResponses.map(async (response) => {
            try {
              const data = await response.json();
              return Array.isArray(data) ? data : [];
            } catch (e) {
              console.error('Failed to parse response:', e);
              return [];
            }
          })
        );
        
        const [personalApps = [], communityApps = []] = results;
        
        const allApps = [...personalApps, ...communityApps]
          .filter((app): app is App => 
            app && typeof app === 'object' && 
            'id' in app && 'title' in app && 
            'tools' in app
          )
          .filter((app, index, self) => 
            index === self.findIndex(a => a.id === app.id)
          )
          .filter(app => app.tools?.includes('data_pods'));
          
        console.log('Loaded apps:', allApps); // Debug log
        setApps(allApps);
      } catch (error) {
        console.error('Failed to load apps:', error);
        setApps([]);
      }
    };
    
    if (user) {
      loadApps();
    }
  }, [user]);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleRename = () => {
    if (!pod || !editingName.trim()) return;
    
    const updatedPod = { ...pod, name: editingName.trim() };
    localStorage.setItem(`dataPod_${pod.id}`, JSON.stringify(updatedPod));
    setPod(updatedPod);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (!pod) return;
    
    localStorage.removeItem(`dataPod_${pod.id}`);
    router.push('/data-pods');
  };
  
  const handleGrantAccess = (appId: string) => {
    if (!pod || !appId) {
      console.log('Cannot grant access: pod or appId is missing', { pod, appId });
      return;
    }
    
    // Convert appId to number since IDs from the database are numbers
    const numericAppId = parseInt(appId, 10);
    console.log('Looking for app with ID:', { numericAppId, availableApps: apps });
    
    const app = apps.find(a => a.id === numericAppId);
    if (!app) {
      console.log('Cannot grant access: app not found', { numericAppId, availableApps: apps });
      return;
    }
    
    console.log('Granting access to app:', { app, pod });
    
    const updatedPod = {
      ...pod,
      permissions: [
        ...pod.permissions,
        {
          appId: appId, // Keep as string in permissions for consistency
          appName: app.title,
          grantedAt: new Date().toISOString()
        }
      ]
    };
    
    try {
      localStorage.setItem(`dataPod_${pod.id}`, JSON.stringify(updatedPod));
      setPod(updatedPod);
      setSelectedApp(null);
      console.log('Access granted successfully', { updatedPod });
    } catch (error) {
      console.error('Failed to grant access:', error);
    }
  };
  
  const handleRevokeAccess = (appId: string) => {
    if (!pod) return;
    
    const updatedPod = {
      ...pod,
      permissions: pod.permissions.filter(p => p.appId !== appId)
    };
    
    localStorage.setItem(`dataPod_${pod.id}`, JSON.stringify(updatedPod));
    setPod(updatedPod);
  };
  
  if (!pod) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Data Pod Not Found</h2>
          <button
            onClick={() => router.push('/data-pods')}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Data Pods
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/data-pods')}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Data Pods
          </button>
        </div>
        
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="px-3 py-2 rounded border bg-background text-lg font-bold flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleRename}
                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-md transition-colors"
                    title="Save"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingName(pod.name);
                    }}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{pod.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                    title="Rename pod"
                  >
                    ✎
                  </button>
                </>
              )}
              
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors ml-auto"
                title="Delete pod"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-muted-foreground">
              <div>Size: {formatFileSize(pod.size)}</div>
              <div>Created: {formatDate(pod.createdAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Content Preview</h2>
            <pre className="bg-secondary/10 p-4 rounded-lg overflow-x-auto">
              {pod.content}
            </pre>
          </div>
          
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Access Permissions</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {pod.permissions.map(permission => {
                  const app = apps.find(a => a.id.toString() === permission.appId);
                  return (
                    <div
                      key={permission.appId}
                      className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2"
                    >
                      {app?.imageUrl && (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={app.imageUrl}
                            alt={permission.appName}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <span>{permission.appName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevokeAccess(permission.appId);
                        }}
                        className="text-red-500 hover:text-red-600 ml-2"
                        title="Revoke access"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                
                {pod.permissions.length === 0 && (
                  <p className="text-muted-foreground">
                    No apps have access to this data pod
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 rounded border bg-background text-left flex items-center justify-between"
                  >
                    {selectedApp ? (
                      <div className="flex items-center gap-2">
                        {apps.find(a => a.id.toString() === selectedApp)?.imageUrl && (
                          <div className="relative w-6 h-6 flex-shrink-0">
                            <Image
                              src={apps.find(a => a.id.toString() === selectedApp)?.imageUrl || ''}
                              alt=""
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                        <span>{apps.find(a => a.id.toString() === selectedApp)?.title || 'Select an app'}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select an app to grant access...</span>
                    )}
                    <svg className="w-4 h-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 py-1 bg-background border rounded-md shadow-lg">
                      {apps
                        .filter(app => !pod.permissions.some(p => p.appId === app.id.toString()))
                        .map(app => (
                          <button
                            key={app.id}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-secondary/50"
                            onClick={() => {
                              setSelectedApp(app.id.toString());
                              setIsDropdownOpen(false);
                            }}
                          >
                            {app.imageUrl && (
                              <div className="relative w-6 h-6 flex-shrink-0">
                                <Image
                                  src={app.imageUrl}
                                  alt={app.title}
                                  fill
                                  className="rounded-md object-cover"
                                />
                              </div>
                            )}
                            <span>{app.title}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (selectedApp) {
                      handleGrantAccess(selectedApp);
                    }
                  }}
                  disabled={!selectedApp}
                  className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                >
                  Grant Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 