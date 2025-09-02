import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, CloseIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  branchSourceText?: string;
  onCancelBranch?: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  branchSourceText,
  onCancelBranch,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Cast the event to satisfy the handler, as preventDefault is all we need
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const isInputDisabled = disabled || isLoading;

  return (
    <div className="bg-white p-4 border-t border-gray-200">
      {branchSourceText && (
        <div className="relative bg-blue-100 text-blue-800 p-2 rounded-t-md text-sm mb-2">
          <p>
            Branching from:{' '}
            <span className="font-semibold italic">&quot;{branchSourceText}&quot;</span>
          </p>
          <button
            onClick={onCancelBranch}
            className="absolute top-1 right-1 p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-200"
            aria-label="Cancel branching"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 w-full px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-48 overflow-y-auto"
          disabled={isInputDisabled}
        />
        <button
          type="submit"
          disabled={isInputDisabled || !message.trim()}
          className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          ) : (
            <SendIcon className="w-6 h-6" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
