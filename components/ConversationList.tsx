import React, { useState, useRef, useEffect } from 'react';
import type { ConversationState } from '../types';
import { PlusIcon, ChatBubbleLeftIcon, PencilIcon, TrashIcon } from './icons';

interface ConversationListProps {
  conversations: Record<string, ConversationState>;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newName: string) => void;
  onDeleteConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedConversations = Object.values(conversations).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEditing = (convo: ConversationState) => {
    setEditingId(convo.id);
    setEditText(convo.name);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEditing = () => {
    if (editingId && editText.trim()) {
      onRenameConversation(editingId, editText.trim());
    }
    handleCancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEditing();
    } else if (e.key === 'Escape') {
      handleCancelEditing();
    }
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) onDeleteConversation(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const cancelDelete = () => setPendingDeleteId(null);

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <h2 className="text-lg font-semibold text-black">Chats</h2>
        <button
          onClick={onNewConversation}
          className="p-2 rounded-md hover:bg-gray-200"
          aria-label="New Chat"
          title="New Chat"
        >
          <PlusIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length > 0 ? (
          <ul>
            {sortedConversations.map((convo) => (
              <li key={convo.id} className="group relative">
                <button
                  onClick={() => onSelectConversation(convo.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-colors duration-150 ${
                    activeConversationId === convo.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChatBubbleLeftIcon
                    className={`w-5 h-5 flex-shrink-0 ${
                      activeConversationId === convo.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  />
                  {editingId === convo.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveEditing}
                      className="flex-1 text-sm bg-white border border-blue-500 rounded px-1 py-0.5 focus:outline-none -my-0.5 -mx-1 z-10 relative"
                      onClick={(e) => e.stopPropagation()} // Prevent select on click
                    />
                  ) : (
                    <span
                      className={`flex-1 text-sm truncate ${
                        activeConversationId === convo.id
                          ? 'font-semibold text-blue-800'
                          : 'text-black font-medium'
                      }`}
                    >
                      {convo.name}
                    </span>
                  )}
                </button>
                {editingId !== convo.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditing(convo);
                      }}
                      className="p-1 rounded-md hover:bg-gray-200"
                      aria-label="Rename conversation"
                      title="Rename"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(convo.id);
                      }}
                      className="p-1 rounded-md hover:bg-gray-200"
                      aria-label="Delete conversation"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Click the &quot;+&quot; button to start a new chat.
          </div>
        )}
      </div>

      {pendingDeleteId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-black">
              <h3 className="text-lg font-semibold text-black">Delete Chat</h3>
            </div>
            <div className="p-6 text-sm text-black">
              Are you sure you want to delete this chat? This action cannot be undone.
            </div>
            <div className="p-4 border-t border-black flex justify-end items-center gap-3 bg-white">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-black bg-white border border-black rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
