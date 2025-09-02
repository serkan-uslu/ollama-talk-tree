import React from 'react';
import { BranchIcon, TreeIcon, PlusIcon } from './icons';
import { WelcomeScreenProps } from '../types'; 
import OllamaLogo from '../assets/ollama.png';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNewConversation,
  showNewChatButton = true,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white overflow-y-auto">
      <div className="max-w-1xl w-full">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 relative flex items-center justify-center">
            <img src={OllamaLogo} alt="Ollama Logo" className="w-16" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-black mb-4">Welcome to TalkTree Ollama</h1>
        <p className="text-lg text-gray-600 mb-8">
          A new way to explore conversations with AI. Never lose your train of thought again.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <BranchIcon className="w-6 h-6 mr-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-black">Branch Your Conversations</h3>
            </div>
            <p className="text-gray-600">
              See a response you want to explore further? Hover over any AI message and click the
              branch icon to start a new, parallel conversation from that exact point.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <TreeIcon className="w-6 h-6 mr-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-black">Visualize Your Chat</h3>
            </div>
            <p className="text-gray-600">
              Click the &quot;Conversation Tree&quot; button in the header to see a full map of your
              discussion. Preview branches and jump back to any point in your chat history.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <h3 className="text-lg font-semibold text-black">Switch Between AI Models</h3>
            </div>
            <p className="text-gray-600">
              Choose different AI types for each path — creative, scientific, casual, and more.
            </p>
          </div>
        </div>

        <p className="mt-10 text-gray-500">Ready to start? Just type your first message below.</p>
        {showNewChatButton && (
          <div className="mt-4">
            <button
              onClick={onNewConversation}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <PlusIcon className="w-4 h-4" />
              New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
