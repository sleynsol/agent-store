import { Message } from '@/types/chat';
import { WebSearchTool } from './WebSearchTool';
import { DataPodsAccessTool } from './DataPodsAccessTool';

interface ToolMessageProps {
  message: Message;
  toolCall: {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  };
  isComplete: boolean;
  output?: string;
}

export function ToolMessage({ message, toolCall, isComplete, output }: ToolMessageProps) {
  const toolInvocation = {
    toolName: toolCall.function.name,
    toolCallId: toolCall.id,
    state: isComplete ? 'result' as const : 'partial-call' as const,
    args: JSON.parse(toolCall.function.arguments)
  };

  switch (toolCall.function.name) {
    case 'web_search':
      return <WebSearchTool part={toolInvocation} />;
    case 'data_pods_access':
      return <DataPodsAccessTool part={toolInvocation} />;
    default:
      return null;
  }
} 