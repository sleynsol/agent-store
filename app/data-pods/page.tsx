'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Drawer } from '@/components/Drawer';
import { ThemeLogo } from '@/components/ThemeLogo';
import { Upload, Trash2, Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DataPod {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  size: number;
  permissions: {
    appId: string;
    appName: string;
    grantedAt: string;
  }[];
}

interface AgentResponse {
  id: string;
  title: string;
  tools?: string[];
}

export default function DataPodsPage() {
  const [dataPods, setDataPods] = useState<DataPod[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingPodId, setEditingPodId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [apps, setApps] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const router = useRouter();

  // Load apps for permissions
  useEffect(() => {
    const loadApps = async () => {
      try {
        // Load community apps
        const communityAppsResponse = await fetch('/api/agents');
        if (communityAppsResponse.ok) {
          const communityApps = (await communityAppsResponse.json()) as AgentResponse[];
          
          // Filter for data_pods tool
          const uniqueApps = Array.from(
            new Map(communityApps.map((app: AgentResponse) => [app.id, app])).values()
          ).filter((app: AgentResponse) => app.tools?.includes('data_pods'))
            .map(app => ({ id: app.id, title: app.title }));

          setApps(uniqueApps);
        }
      } catch (error) {
        console.error('Failed to load apps:', error);
      }
    };
    
    loadApps();
  }, []);

  // Load data pods from localStorage on mount
  useEffect(() => {
    const loadDataPods = () => {
      const pods = Object.keys(localStorage)
        .filter(key => key.startsWith('dataPod_'))
        .map(key => {
          try {
            const pod = JSON.parse(localStorage.getItem(key) || '');
            // Initialize permissions array if it doesn't exist
            if (!pod.permissions) {
              pod.permissions = [];
            }
            return pod;
          } catch {
            return null;
          }
        })
        .filter((pod): pod is DataPod => pod !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setDataPods(pods);
    };

    loadDataPods();
  }, []);

  // Simulated upload progress
  useEffect(() => {
    if (isUploading) {
      const startTime = Date.now();
      const duration = 2000; // 2 seconds
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        if (progress < 100) {
          setUploadProgress(progress);
          requestAnimationFrame(updateProgress);
        } else {
          setUploadProgress(100);
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [isUploading]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus('idle');
      setUploadProgress(0);

      // Read the file content
      const content = await file.text();

      const newPod: DataPod = {
        id: `pod_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        content,
        createdAt: new Date().toISOString(),
        size: file.size,
        permissions: [],
      };

      // Save to localStorage
      localStorage.setItem(`dataPod_${newPod.id}`, JSON.stringify(newPod));
      
      // Update state
      setDataPods(prev => [newPod, ...prev]);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDelete = (podId: string) => {
    localStorage.removeItem(`dataPod_${podId}`);
    setDataPods(prev => prev.filter(pod => pod.id !== podId));
    if (editingPodId === podId) {
      setEditingPodId(null);
    }
  };

  const startEditing = (pod: DataPod) => {
    setEditingPodId(pod.id);
    setEditingName(pod.name);
  };

  const handleRename = (podId: string) => {
    if (!editingName.trim()) return;

    const updatedPods = dataPods.map(pod => {
      if (pod.id === podId) {
        const updatedPod = { ...pod, name: editingName.trim() };
        localStorage.setItem(`dataPod_${podId}`, JSON.stringify(updatedPod));
        return updatedPod;
      }
      return pod;
    });

    setDataPods(updatedPods);
    setEditingPodId(null);
    setEditingName('');
  };

  const handleGrantAccess = (podId: string, appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    setDataPods(prev => prev.map(pod => {
      if (pod.id === podId) {
        const newPermissions = [
          ...pod.permissions,
          {
            appId,
            appName: app.title,
            grantedAt: new Date().toISOString()
          }
        ];
        const updatedPod = { ...pod, permissions: newPermissions };
        localStorage.setItem(`dataPod_${podId}`, JSON.stringify(updatedPod));
        return updatedPod;
      }
      return pod;
    }));
    setSelectedApp(null);
  };

  const handleRevokeAccess = (podId: string, appId: string) => {
    setDataPods(prev => prev.map(pod => {
      if (pod.id === podId) {
        const newPermissions = pod.permissions.filter(p => p.appId !== appId);
        const updatedPod = { ...pod, permissions: newPermissions };
        localStorage.setItem(`dataPod_${podId}`, JSON.stringify(updatedPod));
        return updatedPod;
      }
      return pod;
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Drawer />
        </div>
        <ThemeLogo />
      </header>

      {/* Main Content */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Data Pods</h1>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 mb-8
            flex flex-col items-center justify-center gap-4
            cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center">
            {isDragActive ? (
              <p className="text-lg font-medium">Drop your file here</p>
            ) : (
              <>
                <p className="text-lg font-medium">Drag & drop your file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="w-full max-w-xs">
              <div className="h-2 w-full bg-secondary rounded-full">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <p className="text-sm text-green-500 font-medium mt-2">
              Data pod uploaded successfully!
            </p>
          )}
          {uploadStatus === 'error' && (
            <p className="text-sm text-red-500 font-medium mt-2">
              Upload failed. Please try again.
            </p>
          )}
        </div>

        {/* Data Pods List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Data Pods</h2>
          {dataPods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data pods yet. Upload your first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {dataPods.map((pod) => (
                <div
                  key={pod.id}
                  className="p-4 border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/data-pods/${pod.id}`)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3 className="font-medium truncate">{pod.name}</h3>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Size: {formatFileSize(pod.size)}</div>
                          <div>Created: {formatDate(pod.createdAt)}</div>
                          <div className="mt-2">
                            {pod.permissions.length === 0 ? (
                              <span className="text-yellow-500">No apps have access</span>
                            ) : (
                              <span className="text-green-500">{pod.permissions.length} app{pod.permissions.length === 1 ? '' : 's'} have access</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Drag and drop or click to select a file</li>
            <li>Your data will be stored securely in your browser</li>
            <li>Access your data pods anytime from this page</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 