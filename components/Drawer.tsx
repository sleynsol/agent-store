'use client';

import { Menu, LogOut, LogIn, Wallet, Import, LayoutDashboard, Grid, Wrench, Database, Blocks } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';

export function Drawer() {
  const [isOpen, setIsOpen] = useState(false);

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-200 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex-1">

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm"
              >
                <Grid className="w-4 h-4" />
                Apps
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/data-pods"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm"
              >
                <Database className="w-4 h-4" />
                Data Pods
              </Link>

              <Link
                href="/build"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm"
              >
                <Wrench className="w-4 h-4" />
                Build Your Own Agent
              </Link>
            </div>
          </div>

          {/* Theme Toggle at Bottom */}
          <div className="pt-4 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm">
                <span className="text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  // Clear all conversation histories and permissions from localStorage
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('appChat_') || 
                        key === 'conversationHistory' || 
                        key === 'conversation-permissions') {
                      localStorage.removeItem(key);
                    }
                  });
                  window.location.reload();
                }}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <span>Clear All History</span>
              </button>
              <div className="flex flex-col gap-1">
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
} 