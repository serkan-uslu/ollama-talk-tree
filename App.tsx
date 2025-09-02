/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import BranchNavigator from './components/BranchNavigator';
import ChatInput from './components/ChatInput';
import ConversationList from './components/ConversationList';
import ConversationThread from './components/ConversationThread';
import {
  Bars3Icon,
  CloseIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  TreeIcon,
  UserGroupIcon,
} from './components/icons';
import WelcomeScreen from './components/WelcomeScreen';
import { getAvailableModels, getOllamaResponse } from './services/ollamaService';
import type { Agent, ConversationState, MessageNode, Nodes, Settings } from './types';
import { DEFAULT_AGENT } from './types';

const STORAGE_KEY = 'ollama-branching-chat-state-v3-agents';

const defaultSettings: Settings = {
  isCompactMode: false,
  availableModels: [],
};

interface TreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Nodes;
  rootId: string | null;
  activeNodeId: string | null;
  onNavigate: (nodeId: string) => void;
  settings: Settings;
  agents: Record<string, Agent>;
}

const TreeModal: React.FC<TreeModalProps> = ({
  isOpen,
  onClose,
  nodes,
  rootId,
  activeNodeId,
  onNavigate,
  settings,
  agents,
}) => {
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(activeNodeId);

  useEffect(() => {
    if (isOpen) {
      setPreviewNodeId(activeNodeId);
    }
  }, [isOpen, activeNodeId]);

  const previewedConversation = useMemo(() => {
    if (!previewNodeId) return [];
    const conversation: MessageNode[] = [];
    let currentNode = nodes[previewNodeId];
    while (currentNode) {
      conversation.unshift(currentNode);
      currentNode = currentNode.parentId ? nodes[currentNode.parentId] : null;
    }
    return conversation;
  }, [previewNodeId, nodes]);

  const handleContinue = () => {
    if (previewNodeId) {
      onNavigate(previewNodeId);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-black">
          <h2 className="text-xl font-semibold text-black">Conversation Tree</h2>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 h-full border-r border-black">
            <BranchNavigator
              nodes={nodes}
              rootId={rootId}
              activeNodeId={activeNodeId}
              previewNodeId={previewNodeId}
              onNodeSelect={setPreviewNodeId}
            />
          </div>
          <div className="w-1/2 h-full flex flex-col bg-white">
            <ConversationThread
              messages={previewedConversation}
              isLoading={false}
              onStartBranch={() => {}} // Disable branching in preview
              isCompactMode={settings.isCompactMode}
              agents={agents}
            />
          </div>
        </div>
        <div className="p-4 border-t border-black flex justify-end items-center gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black bg-white border border-black rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!previewNodeId || previewNodeId === activeNodeId}
            className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Continue from this point
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [tempSettings, setTempSettings] = useState<Settings>(currentSettings);

  useEffect(() => {
    if (isOpen) {
      setTempSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  const handleToggleCompactMode = () => {
    setTempSettings((prev) => ({ ...prev, isCompactMode: !prev.isCompactMode }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="compact-mode" className="font-medium text-black">
                Compact Mode
              </label>
              <p className="text-sm text-gray-500">Reduces spacing between messages.</p>
            </div>
            <button
              id="compact-mode"
              role="switch"
              aria-checked={tempSettings.isCompactMode}
              onClick={handleToggleCompactMode}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${tempSettings.isCompactMode ? 'bg-black' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${tempSettings.isCompactMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          <div>
            <label className="block font-medium text-black mb-2">Available Ollama Models</label>
            <p className="text-sm text-gray-500 mb-2">Local Ollama models</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tempSettings.availableModels.length > 0 ? (
                tempSettings.availableModels.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="font-medium text-sm">{model.name}</span>
                    <span className="text-xs text-gray-500">
                      {(model.size / 1024 / 1024 / 1024).toFixed(1)} GB
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Loading models...</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-black flex justify-end items-center gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black bg-white border border-black rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

interface AgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Record<string, Agent>;
  onSaveAgents: (newAgents: Record<string, Agent>) => void;
  settings: Settings;
}

const AgentsModal: React.FC<AgentsModalProps> = ({
  isOpen,
  onClose,
  agents,
  onSaveAgents,
  settings,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<Agent, 'id'>>({
    name: '',
    model: settings.availableModels.length > 0 ? settings.availableModels[0].name : '',
    systemInstruction: '',
  });

  useEffect(() => {
    if (selectedAgentId && agents[selectedAgentId]) {
      const { name, model, systemInstruction } = agents[selectedAgentId];
      setFormState({ name, model, systemInstruction });
    } else {
      setFormState({
        name: '',
        model: settings.availableModels.length > 0 ? settings.availableModels[0].name : '',
        systemInstruction: '',
      });
    }
  }, [selectedAgentId, agents, isOpen, settings.availableModels]);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleCreateNew = () => {
    setSelectedAgentId(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formState.name.trim()) return;

    const newAgents = { ...agents };
    if (selectedAgentId) {
      // Update existing
      newAgents[selectedAgentId] = { ...agents[selectedAgentId], ...formState };
    } else {
      // Create new
      const newId = crypto.randomUUID();
      newAgents[newId] = { id: newId, ...formState };
      setSelectedAgentId(newId);
    }
    onSaveAgents(newAgents);
  };

  const handleDelete = () => {
    if (selectedAgentId && selectedAgentId !== DEFAULT_AGENT.id) {
      const newAgents = { ...agents };
      delete newAgents[selectedAgentId];
      onSaveAgents(newAgents);
      setSelectedAgentId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-black flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">Agent Management</h2>
          <button onClick={onClose}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-black flex flex-col">
            <div className="p-2">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                <PlusIcon className="w-5 h-5" /> Create New Agent
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {Object.values(agents).map((agent) => (
                <li key={agent.id}>
                  <button
                    onClick={() => handleSelectAgent(agent.id)}
                    className={`w-full text-left px-3 py-2 rounded-md ${selectedAgentId === agent.id ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    {agent.name}
                    {agent.id === DEFAULT_AGENT.id && (
                      <span className="text-xs text-gray-500 ml-2">(Default)</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-2/3 flex flex-col p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAgentId ? 'Edit Agent' : 'Create New Agent'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formState.name}
                  onChange={handleFormChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Base Model
                </label>
                <select
                  id="model"
                  name="model"
                  value={formState.model}
                  onChange={handleFormChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                  {settings.availableModels.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)} GB)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="systemInstruction"
                  className="block text-sm font-medium text-gray-700"
                >
                  System Prompt
                </label>
                <p className="text-xs text-gray-500 mb-1">
                  Define the agent&apos;s persona and instructions.
                </p>
                <textarea
                  id="systemInstruction"
                  name="systemInstruction"
                  rows={10}
                  value={formState.systemInstruction}
                  onChange={handleFormChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-black"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div>
                {selectedAgentId && selectedAgentId !== DEFAULT_AGENT.id && (
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete Agent
                  </button>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={!formState.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
              >
                Save Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SearchFilters {
  query: string;
  agentId: string | 'any';
  model: string | 'any';
  dateFrom: string | '';
  dateTo: string | '';
}

interface SearchHit {
  conversationId: string;
  conversationName: string;
  nodeId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  agentName?: string;
  model?: string;
}

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Record<string, ConversationState>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [branchingFrom, setBranchingFrom] = useState<{ nodeId: string; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Global search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  // Compare modal state
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [rightCompareNodeId, setRightCompareNodeId] = useState<string | ''>('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    agentId: 'any',
    model: 'any',
    dateFrom: '',
    dateTo: '',
  });
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Ollama models after hydration
  useEffect(() => {
    if (!isHydrated) return;
    const loadOllamaModels = async () => {
      try {
        const models = await getAvailableModels();
        if (models.length > 0) {
          setSettings((prev) => ({ ...prev, availableModels: models }));
          if (Object.keys(agents).length === 0) {
            const firstModel = models[0];
            const defaultAgent = {
              ...DEFAULT_AGENT,
              model: firstModel.name,
              name: `${firstModel.name} Assistant`,
            };
            setAgents({ [defaultAgent.id]: defaultAgent });
          }
        }
      } catch (error) {
        console.error('Failed to load Ollama models:', error);
      }
    };

    loadOllamaModels();
  }, [isHydrated]);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const {
          conversations,
          activeConversationId,
          settings: savedSettings,
          agents: savedAgents,
        } = JSON.parse(savedState);
        setConversations(conversations || {});
        setActiveConversationId(activeConversationId || null);
        setSettings((prev) => ({ ...prev, ...savedSettings }));
        setAgents((prev) => ({ ...prev, ...(savedAgents || {}) }));
      }
    } catch (error) {
      console.error('Failed to load state from localStorage', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = JSON.stringify({ conversations, activeConversationId, settings, agents });
      localStorage.setItem(STORAGE_KEY, stateToSave);
    } catch (error) {
      console.error('Failed to save state to localStorage', error);
    }
  }, [conversations, activeConversationId, settings, agents, isHydrated]);

  const currentConversation = useMemo(() => {
    return activeConversationId ? conversations[activeConversationId] : null;
  }, [activeConversationId, conversations]);

  const hasAnyConversation = useMemo(() => Object.keys(conversations).length > 0, [conversations]);

  const currentAgent = useMemo(() => {
    if (currentConversation?.agentId && agents[currentConversation.agentId]) {
      return agents[currentConversation.agentId];
    }
    return DEFAULT_AGENT;
  }, [currentConversation, agents]);

  const handleNewConversation = () => {
    const newId = crypto.randomUUID();
    const newConversation: ConversationState = {
      id: newId,
      name: 'New Chat',
      nodes: {},
      rootId: null,
      activeNodeId: null,
      createdAt: new Date().toISOString(),
      agentId: DEFAULT_AGENT.id,
    };
    setConversations((prev) => ({ ...prev, [newId]: newConversation }));
    setActiveConversationId(newId);
    setIsSidebarOpen(true);
  };

  const updateCurrentConversation = (updater: (convo: ConversationState) => ConversationState) => {
    if (!activeConversationId) return;
    setConversations((prev) => {
      const current = prev[activeConversationId];
      if (!current) return prev;
      const updated = updater(current);
      return { ...prev, [activeConversationId]: updated };
    });
  };

  const handleRenameConversation = (conversationId: string, newName: string) => {
    if (!newName.trim()) return;
    setConversations((prev) => {
      const convoToUpdate = prev[conversationId];
      if (!convoToUpdate) return prev;
      const updatedConvo = { ...convoToUpdate, name: newName.trim() };
      return { ...prev, [conversationId]: updatedConvo };
    });
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setActiveConversationId((prev) => (prev === conversationId ? null : prev));
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const buildHistory = useCallback(
    (leafNodeId: string, nodes: Nodes): Array<{ role: string; content: string }> => {
      const history: Array<{ role: string; content: string }> = [];
      let currentNode = nodes[leafNodeId];
      while (currentNode) {
        // Include all messages up to leaf
        history.unshift({
          role: currentNode.sender === 'ai' ? 'assistant' : 'user',
          content: currentNode.text,
        });
        currentNode = currentNode.parentId ? nodes[currentNode.parentId] : null;
      }
      return history;
    },
    [],
  );

  const handleSendMessage = async (text: string) => {
    if (!activeConversationId || !currentConversation) return;

    setIsLoading(true);

    const parentId = branchingFrom ? branchingFrom.nodeId : currentConversation.activeNodeId;
    const branchSourceText = branchingFrom ? branchingFrom.text : undefined;
    setBranchingFrom(null);

    const userMessageId = crypto.randomUUID();
    const userMessage: MessageNode = {
      id: userMessageId,
      sender: 'user',
      text,
      parentId,
      childIds: [],
      branchSourceText,
      timestamp: new Date().toISOString(),
    };

    const isFirstMessage = !currentConversation.rootId;
    const newRootId = isFirstMessage ? userMessageId : currentConversation.rootId;
    const newName = isFirstMessage
      ? text.length > 50
        ? text.substring(0, 47) + '...'
        : text
      : currentConversation.name;

    const newNodes = { ...currentConversation.nodes, [userMessageId]: userMessage };
    if (parentId && newNodes[parentId]) {
      const parent = newNodes[parentId];
      newNodes[parentId] = { ...parent, childIds: [...parent.childIds, userMessageId] };
    }

    updateCurrentConversation((c) => ({
      ...c,
      nodes: newNodes,
      activeNodeId: userMessageId,
      rootId: newRootId,
      name: newName,
    }));

    const history = buildHistory(userMessageId, newNodes);
    const aiResult = await getOllamaResponse(
      history,
      currentAgent.model,
      currentAgent.systemInstruction,
    );

    const aiMessageId = crypto.randomUUID();
    const aiMessage: MessageNode = {
      id: aiMessageId,
      sender: 'ai',
      text: aiResult.content,
      parentId: userMessageId,
      childIds: [],
      timestamp: new Date().toISOString(),
      agentId: currentAgent.id,
      model: currentAgent.model,
      promptTokens: aiResult.prompt_eval_count,
      completionTokens: aiResult.eval_count,
      totalTokens: (aiResult.prompt_eval_count || 0) + (aiResult.eval_count || 0),
      totalDurationMs: aiResult.total_duration
        ? Math.round(aiResult.total_duration / 1e6)
        : undefined,
      loadDurationMs: aiResult.load_duration ? Math.round(aiResult.load_duration / 1e6) : undefined,
      promptEvalDurationMs: aiResult.prompt_eval_duration
        ? Math.round(aiResult.prompt_eval_duration / 1e6)
        : undefined,
      evalDurationMs: aiResult.eval_duration ? Math.round(aiResult.eval_duration / 1e6) : undefined,
    };

    const finalNodes = { ...newNodes, [aiMessageId]: aiMessage };
    const userNode = finalNodes[userMessageId];
    finalNodes[userMessageId] = { ...userNode, childIds: [...userNode.childIds, aiMessageId] };

    updateCurrentConversation((c) => ({
      ...c,
      nodes: finalNodes,
      activeNodeId: aiMessageId,
    }));

    setIsLoading(false);
  };

  const handleStartBranch = (nodeId: string) => {
    if (!currentConversation) return;
    updateCurrentConversation((c) => ({ ...c, activeNodeId: nodeId }));
    setBranchingFrom({ nodeId, text: currentConversation.nodes[nodeId]?.text ?? '' });
  };

  const handleNavigate = (conversationId: string, nodeId: string) => {
    setActiveConversationId(conversationId);
    setIsTreeModalOpen(false);
    setBranchingFrom(null);
    setConversations((prev) => {
      const convo = prev[conversationId];
      if (!convo) return prev;
      return { ...prev, [conversationId]: { ...convo, activeNodeId: nodeId } };
    });
  };

  const runSearch = useCallback(() => {
    const q = searchFilters.query.trim().toLowerCase();
    const from = searchFilters.dateFrom
      ? new Date(searchFilters.dateFrom).getTime()
      : Number.NEGATIVE_INFINITY;
    const to = searchFilters.dateTo
      ? new Date(searchFilters.dateTo).getTime()
      : Number.POSITIVE_INFINITY;
    const results: SearchHit[] = [];

    Object.values(conversations).forEach((convo) => {
      Object.values(convo.nodes).forEach((node) => {
        const t = new Date(node.timestamp).getTime();
        if (t < from || t > to) return;
        if (searchFilters.agentId !== 'any' && node.agentId !== searchFilters.agentId) return;
        if (searchFilters.model !== 'any' && node.model !== searchFilters.model) return;
        const text = node.text || '';
        const hay = text.toLowerCase();
        const matches = q === '' ? false : hay.includes(q);
        if (q && !matches) return;
        results.push({
          conversationId: convo.id,
          conversationName: convo.name,
          nodeId: node.id,
          sender: node.sender,
          text,
          timestamp: node.timestamp,
          agentName: node.agentId ? agents[node.agentId]?.name : undefined,
          model: node.model,
        });
      });
    });

    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setSearchResults(results);
  }, [searchFilters, conversations, agents]);

  // Helpers for compare view
  const buildPathText = (nodes: Nodes, leafId: string): string => {
    const path: MessageNode[] = [] as any;
    let cn = nodes[leafId];
    while (cn) {
      path.unshift(cn);
      cn = cn.parentId ? nodes[cn.parentId] : (null as any);
    }
    return path.map((m) => (m.sender === 'user' ? 'User: ' : 'AI: ') + (m.text || '')).join('\n');
  };
  const sumPathTokens = (nodes: Nodes, leafId: string): number => {
    const path: MessageNode[] = [] as any;
    let cn = nodes[leafId];
    while (cn) {
      path.unshift(cn);
      cn = cn.parentId ? nodes[cn.parentId] : (null as any);
    }
    return path.reduce((s, m) => s + (m.totalTokens || 0), 0);
  };
  const sumPathDuration = (nodes: Nodes, leafId: string): number => {
    const path: MessageNode[] = [] as any;
    let cn = nodes[leafId];
    while (cn) {
      path.unshift(cn);
      cn = cn.parentId ? nodes[cn.parentId] : (null as any);
    }
    return path.reduce((s, m) => s + (m.totalDurationMs || 0), 0);
  };

  const renderDiffBlock = (left: string, right: string) => {
    // Simple sentence-level diff: split by sentence boundary and mark differences
    const split = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean);
    const A = split(left);
    const B = split(right);
    const max = Math.max(A.length, B.length);
    const rows = [] as JSX.Element[];
    for (let i = 0; i < max; i++) {
      const a = A[i] || '';
      const b = B[i] || '';
      const same = a === b && a !== '';
      rows.push(
        <div
          key={i}
          className={`grid grid-cols-2 gap-3 py-1 px-2 rounded ${same ? 'bg-gray-50' : 'bg-white'}`}
        >
          <div className={`text-sm ${same ? 'text-gray-700' : 'text-black'}`}>{a}</div>
          <div className={`text-sm ${same ? 'text-gray-700' : 'text-black'}`}>{b}</div>
        </div>,
      );
    }
    return <div className="space-y-1">{rows}</div>;
  };

  const modelsList = useMemo(
    () => settings.availableModels.map((m) => m.name),
    [settings.availableModels],
  );

  const displayedConversation = useMemo(() => {
    if (!currentConversation || !currentConversation.activeNodeId) return [];
    const { nodes, activeNodeId } = currentConversation;
    const conversation: MessageNode[] = [];
    let currentNode = nodes[activeNodeId];
    while (currentNode) {
      conversation.unshift(currentNode);
      currentNode = currentNode.parentId ? nodes[currentNode.parentId] : null;
    }
    return conversation;
  }, [currentConversation]);

  return (
    <>
      <div className="flex h-screen font-sans bg-white">
        <div
          className={`flex-shrink-0 bg-white transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-72' : 'w-0'
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onNewConversation={handleNewConversation}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        <div className="flex-1 flex flex-col h-screen min-w-0">
          <header className="bg-white p-4 border-b border-black shadow-sm flex justify-between items-center z-10">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-700 flex-shrink-0"
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-xl font-bold text-black truncate">
                  {currentConversation ? currentConversation.name : 'ollama Branching Chat'}
                </h1>
                <span className="text-gray-400 font-light">/</span>
                <div className="flex items-center gap-2">
                  <select
                    value={currentAgent.id}
                    onChange={(e) => {
                      const newAgentId = e.target.value;
                      setConversations((prev) => {
                        if (!activeConversationId) return prev;
                        const cur = prev[activeConversationId];
                        if (!cur) return prev;
                        return { ...prev, [activeConversationId]: { ...cur, agentId: newAgentId } };
                      });
                    }}
                    className="text-xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-black rounded-md -ml-1 p-1"
                    disabled={!currentConversation}
                  >
                    {Object.values(agents).map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                  <span
                    className="text-sm text-gray-500 truncate max-w-[16rem]"
                    title={currentAgent.model}
                  >
                    {currentAgent.model}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-3 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200"
                aria-label="Open search (Cmd/Ctrl+K)"
              >
                Search
              </button>
              {/* <button
                      onClick={() => setIsCompareOpen(true)}
                      disabled={!currentConversation || !currentConversation.activeNodeId}
                      className="px-3 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Compare branches"
                    >
                      Compare
                    </button> */}
              <button
                onClick={() => setIsAgentsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                aria-label="Manage agents"
                title="Manage Agents"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Agents</span>
              </button>
              <button
                onClick={() => setIsTreeModalOpen(true)}
                disabled={!currentConversation || !currentConversation.rootId}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Open conversation tree"
              >
                <TreeIcon className="w-5 h-5" />
                <span>Conversation Tree</span>
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                aria-label="Open settings"
                title="Settings"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            {!currentConversation || !currentConversation.rootId ? (
              <WelcomeScreen
                onNewConversation={handleNewConversation}
                showNewChatButton={!hasAnyConversation}
              />
            ) : (
              <ConversationThread
                messages={displayedConversation}
                isLoading={isLoading}
                onStartBranch={handleStartBranch}
                isCompactMode={settings.isCompactMode}
                agents={agents}
              />
            )}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading && !!activeConversationId}
              branchSourceText={branchingFrom?.text}
              onCancelBranch={() => setBranchingFrom(null)}
              disabled={!activeConversationId}
            />
          </main>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-black flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Search</h2>
              <button onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Search in all chats..."
                value={searchFilters.query}
                onChange={(e) => setSearchFilters((prev) => ({ ...prev, query: e.target.value }))}
                className="md:col-span-2 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <select
                value={searchFilters.agentId}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, agentId: e.target.value as any }))
                }
                className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="any">Any agent</option>
                {Object.values(agents).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                value={searchFilters.model}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, model: e.target.value as any }))
                }
                className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="any">Any model</option>
                {modelsList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={searchFilters.dateFrom}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="date"
                value={searchFilters.dateTo}
                onChange={(e) => setSearchFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={runSearch}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="p-2 border-t border-black max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No results</div>
              ) : (
                <ul>
                  {searchResults.map((hit) => (
                    <li
                      key={`${hit.conversationId}-${hit.nodeId}`}
                      className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => {
                          handleNavigate(hit.conversationId, hit.nodeId);
                          setIsSearchOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate">
                            <span className="font-semibold text-black mr-2">
                              {hit.conversationName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(hit.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[12rem]">
                            {hit.agentName || '—'} {hit.model ? `· ${hit.model}` : ''}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-black line-clamp-2">{hit.text}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareOpen && currentConversation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsCompareOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-black flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Compare Branches</h2>
              <button onClick={() => setIsCompareOpen(false)} aria-label="Close compare">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center gap-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Right branch:</span>
              <select
                value={rightCompareNodeId}
                onChange={(e) => setRightCompareNodeId(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select a node…</option>
                {Object.values(currentConversation.nodes)
                  .filter((n) => n.id !== currentConversation.activeNodeId)
                  .map((n) => (
                    <option
                      key={n.id}
                      value={n.id}
                    >{`${n.sender === 'ai' ? 'AI' : 'User'} · ${n.text.slice(0, 40)}${n.text.length > 40 ? '…' : ''}`}</option>
                  ))}
              </select>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
              {/* Left (active path) */}
              <div className="h-full overflow-y-auto p-4 border-r border-gray-200">
                {(() => {
                  // Build left path text and metrics
                  const { nodes, activeNodeId } = currentConversation;
                  if (!activeNodeId) return null;
                  const path: MessageNode[] = [] as any;
                  let cn = nodes[activeNodeId];
                  while (cn) {
                    path.unshift(cn);
                    cn = cn.parentId ? nodes[cn.parentId] : (null as any);
                  }
                  const text = path
                    .map((m) => (m.sender === 'user' ? 'User: ' : 'AI: ') + (m.text || ''))
                    .join('\n');
                  const tok = path.reduce((s, m) => s + (m.totalTokens || 0), 0);
                  const dur = path.reduce((s, m) => s + (m.totalDurationMs || 0), 0);
                  return (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">
                        Active branch · {tok ? `${tok} tok` : ''}
                        {dur ? ` · ${dur} ms` : ''}
                      </div>
                      {renderDiffBlock(
                        text,
                        rightCompareNodeId
                          ? buildPathText(currentConversation.nodes, rightCompareNodeId)
                          : '',
                      )}
                    </div>
                  );
                })()}
              </div>
              {/* Right (selected path) */}
              <div className="h-full overflow-y-auto p-4">
                {rightCompareNodeId ? (
                  (() => {
                    // const text = buildPathText(currentConversation.nodes, rightCompareNodeId);
                    const tok = sumPathTokens(currentConversation.nodes, rightCompareNodeId);
                    const dur = sumPathDuration(currentConversation.nodes, rightCompareNodeId);
                    return (
                      <div>
                        <div className="text-xs text-gray-500 mb-2">
                          Selected branch · {tok ? `${tok} tok` : ''}
                          {dur ? ` · ${dur} ms` : ''}
                        </div>
                        {renderDiffBlock(
                          rightCompareNodeId
                            ? buildPathText(currentConversation.nodes, rightCompareNodeId)
                            : '',
                          '',
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-sm text-gray-500">Choose a node to compare.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentConversation && (
        <TreeModal
          isOpen={isTreeModalOpen}
          onClose={() => setIsTreeModalOpen(false)}
          nodes={currentConversation.nodes}
          rootId={currentConversation.rootId}
          activeNodeId={currentConversation.activeNodeId}
          onNavigate={(nodeId) => handleNavigate(currentConversation.id, nodeId)}
          settings={settings}
          agents={agents}
        />
      )}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
      />
      <AgentsModal
        isOpen={isAgentsModalOpen}
        onClose={() => setIsAgentsModalOpen(false)}
        agents={agents}
        onSaveAgents={setAgents}
        settings={settings}
      />
    </>
  );
};

export default App;
