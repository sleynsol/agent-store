import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ToolSuggestions } from './ToolSuggestions';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  tools?: string[];
}

export const ChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
  tools = []
}: ChatInputProps) => {
  const [showTools, setShowTools] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleToolSelect = (tool: string) => {
    if (!inputRef.current) return;

    const beforeCursor = input.slice(0, cursorPosition ?? input.length);
    const afterCursor = input.slice(cursorPosition ?? input.length);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) return;

    const newValue = beforeCursor.slice(0, lastAtIndex) + `@${tool} ` + afterCursor;
    const newEvent = {
      target: {
        value: newValue
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(newEvent);
    setShowTools(false);
    inputRef.current.focus();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const position = e.currentTarget.selectionStart ?? 0;
    setCursorPosition(position);

    const beforeCursor = value.slice(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    // Hide suggestions if:
    // 1. No @ found
    // 2. @ is not at the start and doesn't have a space before it
    // 3. There is a space after @ before the cursor
    if (lastAtIndex === -1 || 
        (lastAtIndex > 0 && value[lastAtIndex - 1] !== ' ') ||
        beforeCursor.slice(lastAtIndex).includes(' ')) {
      setShowTools(false);
      return;
    }

    setShowTools(true);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyUp={handleKeyUp}
        placeholder="Type your message... (Use @ to access tools)"
        className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border bg-background"
      />
      <button
        type="submit"
        disabled={!input.trim()}
        className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
      >
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline">Send</span>
      </button>

      <ToolSuggestions
        isVisible={showTools}
        tools={tools}
        onSelect={handleToolSelect}
      />
    </form>
  );
}; 