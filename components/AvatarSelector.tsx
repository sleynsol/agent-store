'use client';

import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import Image from 'next/image';

interface AvatarSelectorProps {
  selectedAvatar: number;
  onSelect: (avatarNumber: number) => void;
  title: string;
  onTitleChange: (title: string) => void;
  showValidation?: boolean;
}

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 20;

export function AvatarSelector({ selectedAvatar, onSelect, title, onTitleChange, showValidation = false }: AvatarSelectorProps) {
  const getRandomAvatar = () => Math.floor(Math.random() * 8) + 1;
  
  const handleRandomize = () => {
    const newAvatar = getRandomAvatar();
    onSelect(newAvatar);
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="relative aspect-square w-40 rounded-full overflow-hidden border-2">
          <Image
            src={`https://rpmksfqpzamwgrmdqkzf.supabase.co/storage/v1/object/public/app_icons/${selectedAvatar}.png`}
            alt={`Avatar ${selectedAvatar}`}
            fill
            className="object-cover"
          />
        </div>
        <button
          type="button"
          onClick={handleRandomize}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors shadow-sm"
          aria-label="Randomize avatar"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>
      
      <div className="w-full max-w-[200px] space-y-1">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          minLength={MIN_NAME_LENGTH}
          maxLength={MAX_NAME_LENGTH}
          className="w-full text-center px-4 py-2 rounded-lg border bg-background text-lg font-medium"
          placeholder="Agent Name"
          required
        />
        {showValidation && title.length < MIN_NAME_LENGTH && (
          <p className="text-xs text-red-500 text-center">
            Name must be at least {MIN_NAME_LENGTH} characters
          </p>
        )}
        <p className="text-xs text-muted-foreground text-center">
          {title.length > 0 && `${title.length}/${MAX_NAME_LENGTH} characters`}
        </p>
      </div>
    </div>
  );
} 