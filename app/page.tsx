'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getApps } from '@/data/apps';
import { AppCard } from '@/components/AppCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { App } from '@/types/app';
import { Drawer } from '@/components/Drawer';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ThemeLogo } from '@/components/ThemeLogo';
import { Info, Users, Star, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SearchHeader } from '@/components/SearchHeader';
import { useAuth } from '@/contexts/AuthContext';

type Section = 'community' | 'my-own';

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState<App[]>([]);
  const [myApps, setMyApps] = useState<App[]>([]);
  const [currentSection, setCurrentSection] = useState<Section>('community');
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [totalApps, setTotalApps] = useState<number | null>(null);
  const [showAgentStats, setShowAgentStats] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const { theme } = useTheme();

  // Fetch total app count
  useEffect(() => {
    const fetchTotalApps = async () => {
      try {
        const response = await fetch('/api/agents/count');
        if (!response.ok) throw new Error('Failed to fetch app count');
        const data = await response.json();
        setTotalApps(data.count);
      } catch (error) {
        console.error('Error fetching app count:', error);
      }
    };
    fetchTotalApps();
  }, []);

  // Load community apps
  const loadApps = useCallback(async (pageNum: number) => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const newApps = await getApps(pageNum);
      
      // If we got less than the expected page size (10), there are no more apps
      if (newApps.length < 10) {
        setHasMore(false);
      }

      setApps(prev => {
        const uniqueApps = new Set([...prev, ...newApps].map(app => JSON.stringify(app)));
        return Array.from(uniqueApps).map(app => JSON.parse(app));
      });
      setPage(pageNum);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, isInitialLoad]);

  // Load personal apps
  useEffect(() => {
    const loadMyApps = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/my-agents?wallet=${user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch agents');
        
        const agents = await response.json();
        setMyApps(agents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSection === 'my-own' && user) {
      loadMyApps();
    }
  }, [currentSection, user]);

  // Initial load of community apps
  useEffect(() => {
    if (currentSection === 'community') {
      loadApps(0);
    }
  }, [loadApps, currentSection]);


  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadApps(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loadApps]);

  const displayedApps = currentSection === 'community' ? apps : myApps;
  const filteredApps = displayedApps.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.traits.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Drawer />
          <div className="hidden sm:block">
          </div>
          {totalApps !== null && (
            <button
              onClick={() => setShowAgentStats(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg border text-sm hover:bg-secondary/50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-mono">{totalApps} Agents</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
            <ThemeLogo onClick={() => setShowOnboarding(true)} />
        </div>
      </header>

      <div className="flex gap-2 mb-4 p-1.5 rounded-lg border bg-card">
        <button
          onClick={() => setCurrentSection('community')}
          className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currentSection === 'community'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Discover Agents</span>
        </button>
        <button
          onClick={() => setCurrentSection('my-own')}
          className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currentSection === 'my-own'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary/50'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>My Creations</span>
        </button>
      </div>

      {/* Search Header */}
      <SearchHeader
        placeholder={`Search ${currentSection === 'community' ? 'community' : 'your'} agents...`}
        value={searchQuery}
        onChange={setSearchQuery}
        showCreateButton={true}
      />

      {/* Apps List */}
      <div className="space-y-2 mt-4">
        {filteredApps.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
        
        {/* Loading indicator and observer target */}
        <div ref={observerTarget} className="py-4 text-center">
          {isLoading && (
            <p className="text-muted-foreground">Loading more apps...</p>
          )}
        </div>

        {filteredApps.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {currentSection === 'my-own' 
                ? "You haven't created any agents yet"
                : "No apps found matching your search."}
            </p>

          </div>
        )}
      </div>

    </div>
  );
}
