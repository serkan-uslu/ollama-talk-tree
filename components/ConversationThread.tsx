import React, { useEffect, useRef } from 'react';
import type { MessageNode, Agent } from '../types';
import MessageBubble from './MessageBubble';

interface ConversationThreadProps {
  messages: MessageNode[];
  isLoading: boolean;
  onStartBranch: (messageId: string, selectedText: string) => void;
  isCompactMode: boolean;
  agents: Record<string, Agent>;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({
  messages,
  isLoading,
  onStartBranch,
  isCompactMode,
  agents,
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col">
        {messages.map((msg) => {
          const agent = msg.agentId ? agents[msg.agentId] : null;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              onStartBranch={onStartBranch}
              isCompactMode={isCompactMode}
              modelName={msg.model}
              agentName={agent?.name}
            />
          );
        })}
        {isLoading && (
          <div className="flex flex-col w-full my-2 px-4 items-start">
            <div className="bg-gray-200 rounded-2xl px-4 py-3 shadow-md">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ConversationThread;
