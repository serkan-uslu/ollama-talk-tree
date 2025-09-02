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
