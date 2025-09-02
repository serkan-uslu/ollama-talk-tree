export type Sender = 'user' | 'ai';

export interface MessageNode {
  id: string;
  sender: Sender;
  text: string;
  parentId: string | null;
  childIds: string[];
  branchSourceText?: string;
  timestamp: string;
  agentId?: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  totalDurationMs?: number;
  loadDurationMs?: number;
  promptEvalDurationMs?: number;
  evalDurationMs?: number;
}

export type Nodes = Record<string, MessageNode>;

export interface OllamaModel {
  name: string;
  modified_at: Date;
  size: number;
}

export const AVAILABLE_MODELS: string[] = [];

export interface Settings {
  isCompactMode: boolean;
  availableModels: OllamaModel[];
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  systemInstruction: string;
}

export const DEFAULT_AGENT: Agent = {
  id: 'default-ollama',
  name: 'Ollama Assistant',
  model: '',
  systemInstruction: '',
};

export interface ConversationState {
  id: string;
  name: string;
  nodes: Nodes;
  rootId: string | null;
  activeNodeId: string | null;
  createdAt: string;
  agentId: string;
}

export interface BranchNavigatorProps {
  nodes: Nodes;
  rootId: string | null;
  activeNodeId: string | null;
  previewNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export interface BranchNodeProps {
  nodeId: string;
  nodes: Nodes;
  activeNodeId: string | null;
  previewNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  level: number;
  activePath: Set<string>;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  isLast: boolean;
  parentTreeState: boolean[];
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  branchSourceText?: string;
  onCancelBranch?: () => void;
  disabled?: boolean;
}

export interface ConversationListProps {
  conversations: Record<string, ConversationState>;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newName: string) => void;
  onDeleteConversation: (id: string) => void;
}

export interface ConversationThreadProps {
  messages: MessageNode[];
  isLoading: boolean;
  onStartBranch: (messageId: string, selectedText: string) => void;
  isCompactMode: boolean;
  agents: Record<string, Agent>;
  hideActions?: boolean;
}

export interface MessageBubbleProps {
  message: MessageNode;
  onStartBranch: (messageId: string, selectedText: string) => void;
  isCompactMode: boolean;
  modelName?: string;
  agentName?: string;
  hideActions?: boolean;
}

export interface WelcomeScreenProps {
  onNewConversation: () => void;
  showNewChatButton?: boolean;
}

export interface SearchFilters {
  query: string;
  agentId: string | 'any';
  model: string | 'any';
  dateFrom: string | '';
  dateTo: string | '';
}

export interface SearchHit {
  conversationId: string;
  conversationName: string;
  nodeId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  agentName?: string;
  model?: string;
}
