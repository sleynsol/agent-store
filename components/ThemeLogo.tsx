'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface ThemeLogoProps {
  onClick?: () => void;
}

export function ThemeLogo({ onClick }: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // Only show logo after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[120px] h-[40px]" />
    );
  }

  // Use resolvedTheme instead of theme to get the actual theme (including system preference)
  const isDark = resolvedTheme === 'dark';

  const Logo = () => (
    <div className="relative w-[160px] h-[40px] transition-opacity hover:opacity-80">
      <Image
        src="/assets/logo.png"
        alt="Agent Shop Logo"
        fill
        className={`object-contain transition-all ${!isDark ? 'invert brightness-200' : ''}`}
        priority
        unoptimized
      />
    </div>
  );

  const content = (
    <div className="flex items-center gap-2">
      {onClick ? (
        <button 
          onClick={onClick}
          className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <Logo />
        </button>
      ) : (
        <Link href="/">
          <Logo />
        </Link>
      )}
    </div>
  );

  return content;
} 