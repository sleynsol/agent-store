'use client';

import { Flame } from 'lucide-react';
import { useState } from 'react';

interface FlameButtonProps {
  initialCount?: number;
  appId: string;
}

export function FlameButton({ initialCount = 0, appId }: FlameButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {

    setIsLoading(true);
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId }),
      });

      if (!response.ok) throw new Error('Failed to update likes');

      const { likes } = await response.json();
      setCount(likes);
    } catch (error) {
      console.error('Failed to update likes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50"
      >
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm">{count}</span>
      </button>
    </>
  );
} 