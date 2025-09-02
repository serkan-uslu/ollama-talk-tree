import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MessageBubbleProps } from '../types';
import { BranchIcon, CopyIcon } from './icons';

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onStartBranch,
  isCompactMode,
  modelName,
  agentName,
}) => {
  const [popover, setPopover] = useState<{ x: number; y: number; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (bubbleRef.current) {
        const bubbleRect = bubbleRef.current.getBoundingClientRect();
        setPopover({
          x: rect.left + rect.width / 2 - bubbleRect.left,
          y: rect.top - bubbleRef.current.getBoundingClientRect().top,
          text: selectedText,
        });
      }
    } else {
      setPopover(null);
    }
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (popover && bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
        setPopover(null);
      }
    },
    [popover],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const isUser = message.sender === 'user';
  const bubbleClasses = isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black';
  const alignmentClass = isUser ? 'items-end' : 'items-start';

  const handleBranchClick = () => {
    if (popover) {
      onStartBranch(message.id, popover.text);
      setPopover(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const copyPositionClass = isUser
    ? 'left-0 -translate-x-[calc(100%+0.5rem)]'
    : 'right-0 translate-x-[calc(100%+0.5rem)]';

  return (
    <div
      className={`flex flex-col w-full px-4 ${alignmentClass} ${isCompactMode ? 'my-1' : 'my-2'}`}
    >
      <div
        ref={bubbleRef}
        onMouseUp={isUser ? undefined : handleMouseUp}
        className={`group relative rounded-2xl px-4 py-2 shadow-md max-w-3xl ${bubbleClasses}`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ol:my-2 prose-ul:my-2 prose-code:bg-black prose-code:bg-opacity-10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
          </div>
        )}
        {popover && (
          <div
            className="absolute z-10 p-1"
            style={{
              left: `${popover.x}px`,
              top: `${popover.y}px`,
              transform: 'translate(-50%, -110%)',
            }}
          >
            <button
              onClick={handleBranchClick}
              className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200 text-sm"
            >
              <BranchIcon className="w-4 h-4" />
              <span>Branch</span>
            </button>
          </div>
        )}
        {/* Hover actions: copy outside bubble */}
        <button
          onClick={handleCopy}
          className={`absolute top-1/2 -translate-y-1/2 ${copyPositionClass} opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50`}
          aria-label="Copy message"
          title={copied ? 'Copied!' : 'Copy'}
        >
          <CopyIcon className="w-4 h-4 text-gray-700" />
        </button>
        {!isUser && (
          <button
            onClick={() => onStartBranch(message.id, message.text)}
            className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[calc(100%+3.25rem)] opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Create new branch from this message"
            title="Create new branch"
          >
            <BranchIcon className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>
      <div
        className={`flex w/full max-w-3xl ${isUser ? 'justify-end' : 'justify-between'} items-center`}
      >
        {!isUser && modelName && (
          <span className="text-xs text-gray-400 mt-1 px-1 italic">
            {agentName ? `${agentName} | ` : ''}
            {modelName}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          {!isUser &&
            (message.totalTokens || message.evalDurationMs || message.promptEvalDurationMs) && (
              <span className="text-[10px] text-gray-400 px-1">
                {message.totalTokens ? `${message.totalTokens} tok` : ''}
                {message.totalDurationMs ? ` · ${message.totalDurationMs} ms` : ''}
              </span>
            )}
          <span className="text-xs text-gray-500 px-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
