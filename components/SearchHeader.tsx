import Link from 'next/link';
import { Bot } from 'lucide-react';

interface SearchHeaderProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showCreateButton?: boolean;
}

export function SearchHeader({ placeholder, value, onChange, showCreateButton = false }: SearchHeaderProps) {
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-4 z-10">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <input
            type="search"
            placeholder={placeholder}
            className="w-full px-4 py-2 rounded-lg border bg-background"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        {showCreateButton && (
          <Link
            href="/build"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Create your Agent"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden md:inline-block md:ml-2">Create Agent</span>
          </Link>
        )}
      </div>
    </div>
  );
} 