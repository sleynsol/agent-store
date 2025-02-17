import { Message as AIMessage, ToolCall as SDKToolCall } from 'ai';
import { TextUIPart, ReasoningUIPart, ToolInvocationUIPart, ToolInvocation as SDKToolInvocation } from '@ai-sdk/ui-utils';

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallResult {
  id: string;
  type: 'function';
  output?: string;
}

export type MessagePart = TextUIPart | ReasoningUIPart | ToolInvocationUIPart;

export interface Message extends AIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
  parts?: MessagePart[];
  createdAt?: Date;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export interface Tool {
  type: 'tool';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required: string[];
  };
}

export interface ToolResult {
  role: 'data';
  content: string;
  tool_call_id: string;
  name: string;
}

export interface ToolInvocation {
  state: 'partial-call' | 'call' | 'result';
  toolName: string;
  toolCallId: string;
  args?: Record<string, any>;
  result?: any;
  step?: number;
} 