import { Ollama } from 'ollama';

const ollama = new Ollama();

export interface OllamaModel {
  name: string;
  modified_at: Date;
  size: number;
}

export interface ChatResult {
  content: string;
  prompt_eval_count?: number;
  eval_count?: number;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

// List available local Ollama models
export async function getAvailableModels(): Promise<OllamaModel[]> {
  try {
    const response = await ollama.list();
    return response.models || [];
  } catch (error) {
    console.error('Failed to get Ollama models:', error);
    return [];
  }
}

// Chat with Ollama (returns content and metrics)
export async function getOllamaResponse(
  messages: Array<{ role: string; content: string }>,
  model: string,
  systemPrompt?: string,
): Promise<ChatResult> {
  try {
    const requestBody: any = {
      model,
      messages: systemPrompt ? [{ role: 'system', content: systemPrompt }, ...messages] : messages,
      stream: false,
    };

    const response = (await ollama.chat(requestBody)) as any;
    // response shape from REST: { message:{content}, total_duration, load_duration, prompt_eval_count, ... }
    return {
      content: response?.message?.content ?? response?.content ?? '',
      prompt_eval_count: response?.prompt_eval_count,
      eval_count: response?.eval_count,
      total_duration: response?.total_duration,
      load_duration: response?.load_duration,
      prompt_eval_duration: response?.prompt_eval_duration,
      eval_duration: response?.eval_duration,
    };
  } catch (error) {
    console.error('Failed to get Ollama response:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

// Get model information
export async function getModelInfo(modelName: string) {
  try {
    const response = await ollama.show({ model: modelName });
    return response;
  } catch (error) {
    console.error('Failed to get model info:', error);
    return null;
  }
}
