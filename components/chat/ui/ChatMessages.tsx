import { Message } from '@/types/chat';
import { ToolMessage } from '../tools/ToolMessage';
import { useEffect, useRef } from 'react';

interface ChatMessagesProps {
  messages: Array<Message>;
  connected: boolean;
  appTitle: string;
  formatChatMessage: (text: string) => string;
  showLoadingIndicator: boolean;
}

export const ChatMessages = ({
  messages,
  connected,
  appTitle,
  formatChatMessage,
  showLoadingIndicator
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showLoadingIndicator]);

  return (
    <div className="h-[calc(100vh-400px)] overflow-y-auto border rounded-lg p-2 sm:p-4 mb-2 sm:mb-4 space-y-2 sm:space-y-4">
      {!connected ? (
        <div className="text-center text-sm sm:text-base text-muted-foreground">
          Connect your wallet to start chatting
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center text-sm sm:text-base text-muted-foreground">
          Send a message to start chatting with {appTitle}
        </div>
      ) : (
        <>
          {messages.map((message) => {
            return (
              <div
                key={message.id}
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
                  {/* Regular message content */}
                  <div
                    className="text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: formatChatMessage(message.content) }}
                  />

                  {/* Tool calls */}
                  {message.tool_calls?.map((toolCall) => {
                    // Find the corresponding tool result message
                    const resultMessage = messages.find(
                      (m) => m.tool_call_id === toolCall.id
                    );
                    
                    return (
                      <ToolMessage
                        key={toolCall.id}
                        message={message}
                        toolCall={toolCall}
                        isComplete={!!resultMessage}
                        output={resultMessage?.content}
                      />
                    );
                  })}

                  <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
          {showLoadingIndicator && messages[messages.length - 1]?.role === 'user' && (
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
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}; 