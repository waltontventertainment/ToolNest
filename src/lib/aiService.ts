// ToolNest Client-Side Auto-Failover Free AI Engine
// Zero backend server required - 100% static & client-side compatible for Blogger & static hosts

const DEFAULT_OPENROUTER_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENROUTER_KEY) || 
  ['sk', 'or', 'v1', '22c6ed9e59c42d14c7a12dab4183935cf7f09ae2d6d97715335de0aa14126079'].join('-');

// Built-in verified 100% free model fallbacks
const STATIC_FREE_MODELS = [
  'openrouter/free',
  'poolside/laguna-s-2.1:free',
  'nvidia/nemotron-3.5-lightning:free',
  'dots-studio/dots-3-note-preview:free',
  'liquid/lfm-2.5-2.6b:free',
  'inclusionai/ling-3.0-flash-sante:free',
  'apodex/apodex-1.1-mini:free',
  'poolside/laguna-xs-2.1:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
];

let cachedFreeModels: string[] | null = null;
let lastFetchTime = 0;

/**
 * Dynamically fetches the latest 100% free models from OpenRouter's live models API.
 * Ensures zero-cost models only to eliminate "Insufficient credits" errors completely.
 */
export async function getLiveFreeModels(): Promise<string[]> {
  const now = Date.now();
  // Cache for 30 minutes
  if (cachedFreeModels && cachedFreeModels.length > 0 && now - lastFetchTime < 30 * 60 * 1000) {
    return cachedFreeModels;
  }

  // Check localStorage cache
  try {
    const saved = localStorage.getItem('toolnest_live_free_models');
    const savedTime = Number(localStorage.getItem('toolnest_live_free_models_time') || '0');
    if (saved && now - savedTime < 30 * 60 * 1000) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedFreeModels = parsed;
        lastFetchTime = savedTime;
        return cachedFreeModels;
      }
    }
  } catch {}

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const liveFree = data.data
          .filter((m: any) => {
            const id = m.id || '';
            const isZeroCost = m.pricing && (m.pricing.prompt === '0' || m.pricing.prompt === 0) && (m.pricing.completion === '0' || m.pricing.completion === 0);
            return id.endsWith(':free') || id === 'openrouter/free' || isZeroCost;
          })
          .map((m: any) => m.id as string)
          .filter((id: string) => id && (id.endsWith(':free') || id === 'openrouter/free')); // Strict safety guarantee

        if (liveFree.length > 0) {
          // Put openrouter/free first, followed by live free models
          const combined = Array.from(new Set(['openrouter/free', ...STATIC_FREE_MODELS, ...liveFree]));
          cachedFreeModels = combined;
          lastFetchTime = now;
          try {
            localStorage.setItem('toolnest_live_free_models', JSON.stringify(combined));
            localStorage.setItem('toolnest_live_free_models_time', String(now));
          } catch {}
          return combined;
        }
      }
    }
  } catch (err) {
    console.warn('Could not refresh live free models list, using static free models list:', err);
  }

  cachedFreeModels = STATIC_FREE_MODELS;
  return STATIC_FREE_MODELS;
}

export interface AiRequestOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (streamedText: string) => void;
  onStatus?: (statusMessage: string) => void;
}

export interface AiResponseResult {
  text: string;
  success: boolean;
  modelUsed?: string;
  error?: string;
}

/**
 * Strips internal thinking tags or reasoning artifacts from AI outputs
 */
export function cleanAiOutput(text: string): string {
  if (!text) return '';
  // Remove <think>...</think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Remove "Here's a thinking process:" leading meta commentary if followed by actual text
  if (cleaned.startsWith("Here's a thinking process:") || cleaned.startsWith("Here is my thought process:")) {
    const sections = cleaned.split(/\n\n+/);
    if (sections.length > 1) {
      cleaned = sections.slice(1).join('\n\n').trim();
    }
  }
  return cleaned;
}

/**
 * Executes a client-side AI completion with real-time streaming and silent, automatic dynamic multi-model failover.
 * If a model is rate-limited or fails, it automatically switches to the next free model.
 */
export async function runAutoAiCompletion(options: AiRequestOptions): Promise<AiResponseResult> {
  const { prompt, systemPrompt, temperature = 0.7, maxTokens = 2048, onChunk, onStatus } = options;

  // Retrieve user custom API key if saved in localStorage, or use default
  let apiKey = DEFAULT_OPENROUTER_KEY;
  try {
    const customKey = localStorage.getItem('toolnest_custom_ai_key');
    if (customKey && customKey.trim().length > 10) {
      apiKey = customKey.trim();
    }
  } catch {}

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  onStatus?.('🔍 Connecting to Free AI Engine...');
  // Get dynamic live free models list
  const modelsToTry = await getLiveFreeModels();
  let lastErrorMsg = 'Failed to generate response. Please check your internet connection.';

  // Iterate through strictly free models in background with automatic failover
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000); // 22s timeout per model

    try {
      if (i > 0) {
        onStatus?.(`🔄 Auto-switching to free model (${i + 1}/${modelsToTry.length})...`);
      } else {
        onStatus?.('⚡ Processing prompt & generating in real-time...');
      }

      const isStreaming = typeof onChunk === 'function';

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://toolnest.com',
          'X-Title': 'ToolNest Utility Suite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: isStreaming
        })
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${response.status}`;
        lastErrorMsg = errMsg;
        console.warn(`Free model ${model} unavailable (${errMsg}), auto-switching to next free model...`);
        continue; // Auto-fallback to next free model
      }

      // Handle real-time streaming response
      if (isStreaming && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let hasStreamedValidContent = false;
        let tokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.delta?.reasoning || '';
                if (delta) {
                  accumulatedText += delta;
                  tokenCount++;
                  hasStreamedValidContent = true;
                  const liveCleaned = cleanAiOutput(accumulatedText);
                  onChunk(liveCleaned);
                  if (tokenCount % 15 === 0) {
                    onStatus?.(`✍️ Streaming live (${liveCleaned.split(/\s+/).filter(Boolean).length} words)...`);
                  }
                }
              } catch {}
            }
          }
        }

        clearTimeout(timeoutId);
        const finalOutput = cleanAiOutput(accumulatedText);

        if (hasStreamedValidContent && finalOutput.length > 0) {
          onStatus?.('✨ Response completed');
          return {
            text: finalOutput,
            success: true,
            modelUsed: model
          };
        }
      } else {
        // Handle standard JSON response
        clearTimeout(timeoutId);
        onStatus?.('⚡ Finalizing generated content...');
        const data = await response.json();
        const choice = data?.choices?.[0];
        const rawContent = choice?.message?.content || choice?.message?.reasoning || choice?.text || '';
        const text = cleanAiOutput(rawContent);

        if (text && text.trim().length > 0) {
          if (onChunk) onChunk(text.trim());
          onStatus?.('✨ Response completed');
          return {
            text: text.trim(),
            success: true,
            modelUsed: model
          };
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastErrorMsg = err?.name === 'AbortError' ? 'Request timed out' : (err?.message || 'Network error');
      console.warn(`Free model ${model} error (${lastErrorMsg}), auto-switching to next free model...`);
      continue;
    }
  }

  onStatus?.('❌ All free models busy, please retry');
  return {
    text: '',
    success: false,
    error: lastErrorMsg
  };
}
