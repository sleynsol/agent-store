'use client';

import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface BulletPointListProps {
  items: string[];
  onChange: (items: string[]) => void;
  showValidation?: boolean;
}

const MAX_ITEMS = 3;

export function BulletPointList({ items, onChange, showValidation = false }: BulletPointListProps) {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim() && items.length < MAX_ITEMS) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      {/* Existing Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 group px-3 py-1.5 rounded-lg border bg-background"
          >
            <span className="text-muted-foreground">•</span>
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary/50 rounded-full transition-all"
              aria-label="Remove item"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      {items.length < MAX_ITEMS ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed">
          <span className="text-muted-foreground">•</span>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a specialty and press Enter..."
            className="flex-1 bg-transparent border-none p-0 focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="p-1 hover:bg-secondary/50 rounded-full transition-colors"
            aria-label="Add item"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Maximum of {MAX_ITEMS} specialties reached
        </p>
      )}

      {/* Validation Message */}
      {showValidation && items.length === 0 && (
        <p className="text-xs text-red-500 px-1">
          At least one specialty is required
        </p>
      )}
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          {items.length} {items.length === 1 ? 'specialty' : 'specialties'} added
        </p>
      )}
    </div>
  );
} 