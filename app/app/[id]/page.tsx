'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import { App } from '@/types/app';
import { getAppById } from '@/data/apps';
import { Drawer } from '@/components/Drawer';
import { ThemeLogo } from '@/components/ThemeLogo';
import { useChat, Message } from 'ai/react';
import { useTheme } from 'next-themes';
import { ChatHeader } from '@/components/chat/ui/ChatHeader';
import { ChatInput } from '@/components/chat/ui/ChatInput';
import { AppInfo } from '@/components/chat/ui/AppInfo';
import { formatText, formatChatMessage } from '@/utils/text-formatting';
import { ToolMessage } from '@/components/chat/tools/ToolMessage';
import { Message as ChatMessageType } from '@/types/chat';

// Create a separate component for message rendering
const MessageItem = memo(({ message }: { message: ChatMessageType }) => {
  const elements = [];

  // Handle tool invocations
  const toolInvocations = message.toolInvocations || [];
  if (toolInvocations.length > 0) {
    toolInvocations.forEach((invocation) => {
      elements.push(
        <div
          key={`tool-${invocation.toolCallId}`}
          className="flex justify-start"
        >
          <div className="max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-secondary">
            <ToolMessage
              message={message}
              toolCall={{
                id: invocation.toolCallId,
                type: 'function',
                function: {
                  name: invocation.toolName,
                  arguments: JSON.stringify(invocation.args || {})
                }
              }}
              isComplete={invocation.state === 'result'}
              output={invocation.state === 'result' ? invocation.result : undefined}
            />
            <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      );
    });
  }

  // Handle message content
  if (message.content) {
    elements.push(
      <div
        key={`content-${message.id}`}
        className={`flex ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          <div
            className="text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: formatChatMessage(message.content) }}
          />
          <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  }

  return <>{elements}</>;
});

MessageItem.displayName = 'MessageItem';

// Create a separate component for chat container
const ChatContainer = memo(({ app, connected, hasPermission, allConversationsContext, params, setAllConversationsContext, setPermittedDataPodsContent, permittedDataPodsContent, setHasPermission }: {
  app: App;
  connected: boolean;
  hasPermission: boolean;
  allConversationsContext: string | null;
  params: any;
  setAllConversationsContext: (context: string | null) => void;
  setPermittedDataPodsContent: (content: string | null) => void;
  permittedDataPodsContent: string | null;
  setHasPermission: (hasPermission: boolean) => void;
}) => {
  // Load initial messages
  const initialMessages = useMemo(() => {
    try {
      const savedData = localStorage.getItem(`appChat_${params.id}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.messages || [];
      }
      return [];
    } catch {
      return [];
    }
  }, [params.id]);

  // Load all conversations and imported history for context
  useEffect(() => {
    // Load imported conversation history
    const importedHistory = localStorage.getItem('conversationHistory');
    
    interface ConversationData {
      title: string;
      messages: string;
    }

    // Load all app conversations for context
    const allAppConversations = Object.entries(localStorage)
      .filter(([key]) => key.startsWith('appChat_'))
      .map(([_, value]) => {
        try {
          const data = JSON.parse(value);
          if (data && data.title && data.messages) {
            return {
              title: data.title,
              messages: data.messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
            };
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter((data): data is ConversationData => Boolean(data))
      .map(data => `Conversation with ${data.title}:\n${data.messages}`)
      .join('\n\n');

    // Load permitted data pods content if the tool is enabled
    let hasDataPodAccess = false;
    const permittedDataPodsContent = app?.tools?.includes('data_pods') 
      ? Object.entries(localStorage)
        .filter(([key]) => key.startsWith('dataPod_'))
        .map(([_, value]) => {
          try {
            const pod = JSON.parse(value);
            // Convert the param id to match the stored permission id format
            const currentAppId = typeof params.id === 'string' ? params.id : '';
            // Only include pods that have granted permission to this app
            if (currentAppId && pod.permissions?.some((p: any) => p.appId.toString() === currentAppId)) {
              hasDataPodAccess = true;
              return `Data Pod: ${pod.name}\nContent:\n${pod.content}\n---\n`;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .join('\n')
      : '';

    // Combine all context
    const fullContext = [
      importedHistory,
      allAppConversations
    ].filter(Boolean).join('\n\n---\n\n');

    setAllConversationsContext(fullContext);
    // Store permitted data pods content separately
    setPermittedDataPodsContent(permittedDataPodsContent);
    setHasPermission(hasDataPodAccess);
  }, [app?.tools, params.id]);

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { 
      appId: params.id,
      conversationHistory: hasPermission ? allConversationsContext : undefined,
      dataPodsContent: hasPermission ? permittedDataPodsContent : undefined
    },
    initialMessages,
  });

  // Separate useEffect for saving messages
  useEffect(() => {
    if (app && messages.length > 0) {
      const conversationData = {
        title: app.title,
        messages: messages
      };
      try {
        localStorage.setItem(`appChat_${params.id}`, JSON.stringify(conversationData));
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    }
  }, [messages, app, params.id]);

  // Calculate if we should show the loading indicator
  const showLoadingIndicator = useMemo(() => 
    messages.length > 0 && messages[messages.length - 1].role === 'user' && isLoading
  , [messages, isLoading]);

  // Simplified message rendering using the new component
  const messageElements = useMemo(() => 
    messages.map((message) => (
      <MessageItem key={message.id} message={message as ChatMessageType} />
    ))
  , [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    await originalHandleSubmit(e);
  }, [input, originalHandleSubmit]);

  if (!connected) {
    return (
      <div className="h-[calc(100vh-400px)] overflow-y-auto border rounded-lg p-2 sm:p-4 mb-2 sm:mb-4 space-y-2 sm:space-y-4">
        <div className="text-center text-sm sm:text-base text-muted-foreground">
          Connect your wallet to start chatting
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-400px)] overflow-y-auto border rounded-lg p-2 sm:p-4 mb-2 sm:mb-4 space-y-2 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm sm:text-base text-muted-foreground">
            Send a message to start chatting with {app.title}
          </div>
        ) : (
          <>
            {messageElements}
            {showLoadingIndicator && (
              <div className="flex justify-start">
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-secondary`}>
                  <p className="text-sm sm:text-base flex gap-1">
                    <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }}>.</span>
                    <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }}>.</span>
                  </p>
                  <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        tools={app.tools || []}
      />
    </>
  );
});

ChatContainer.displayName = 'ChatContainer';

export default function AppPage() {
  const params = useParams();
  const { theme } = useTheme();
  const [app, setApp] = useState<App | null>(null);
  const [allConversationsContext, setAllConversationsContext] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isAppInfoExpanded, setIsAppInfoExpanded] = useState(false);
  const [permittedDataPodsContent, setPermittedDataPodsContent] = useState<string | null>(null);
  
  // Load all conversations and imported history for context
  useEffect(() => {
    // Load imported conversation history
    const importedHistory = localStorage.getItem('conversationHistory');
    
    interface ConversationData {
      title: string;
      messages: string;
    }

    // Load all app conversations for context
    const allAppConversations = Object.entries(localStorage)
      .filter(([key]) => key.startsWith('appChat_'))
      .map(([_, value]) => {
        try {
          const data = JSON.parse(value);
          if (data && data.title && data.messages) {
            return {
              title: data.title,
              messages: data.messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
            };
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter((data): data is ConversationData => Boolean(data))
      .map(data => `Conversation with ${data.title}:\n${data.messages}`)
      .join('\n\n');

    // Load permitted data pods content if the tool is enabled
    let hasDataPodAccess = false;
    const permittedDataPodsContent = app?.tools?.includes('data_pods') 
      ? Object.entries(localStorage)
        .filter(([key]) => key.startsWith('dataPod_'))
        .map(([_, value]) => {
          try {
            const pod = JSON.parse(value);
            // Convert the param id to match the stored permission id format
            const currentAppId = typeof params.id === 'string' ? params.id : '';
            // Only include pods that have granted permission to this app
            if (currentAppId && pod.permissions?.some((p: any) => p.appId.toString() === currentAppId)) {
              hasDataPodAccess = true;
              return `Data Pod: ${pod.name}\nContent:\n${pod.content}\n---\n`;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .join('\n')
      : '';

    // Combine all context
    const fullContext = [
      importedHistory,
      allAppConversations
    ].filter(Boolean).join('\n\n---\n\n');

    setAllConversationsContext(fullContext);
    // Store permitted data pods content separately
    setPermittedDataPodsContent(permittedDataPodsContent);
    setHasPermission(hasDataPodAccess);
  }, [app?.tools, params.id]);
  
  const handlePermissionGranted = () => {
    setHasPermission(true);
  };

  const handlePermissionRevoked = () => {
    setHasPermission(false);
  };

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const foundApp = await getAppById(params.id as string);
        if (foundApp) {
          setApp(foundApp);
        }
      } catch (error) {
        console.error('Failed to fetch app:', error);
      }
    };
    fetchApp();
  }, [params.id]);

  if (!app) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto p-4">
        <div className="flex justify-center items-center h-[60vh]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Drawer />
        </div>
        <ThemeLogo />
      </header>

      {/* Chat Interface */}
      <div className="sm:mt-8 border rounded-lg p-2 sm:p-4">
        <ChatHeader
          app={app}
          isAppInfoExpanded={isAppInfoExpanded}
          setIsAppInfoExpanded={setIsAppInfoExpanded}
          onPermissionGranted={handlePermissionGranted}
          onPermissionRevoked={handlePermissionRevoked}
          appId={params.id as string}
        />

        {isAppInfoExpanded && (
          <AppInfo app={app} formatText={formatText} />
        )}
        
        <ChatContainer
          app={app}
          connected={true}
          hasPermission={hasPermission}
          allConversationsContext={allConversationsContext}
          params={params}
          setAllConversationsContext={setAllConversationsContext}
          setPermittedDataPodsContent={setPermittedDataPodsContent}
          permittedDataPodsContent={permittedDataPodsContent}
          setHasPermission={setHasPermission}
        />
      </div>
    </div>
  );
} 