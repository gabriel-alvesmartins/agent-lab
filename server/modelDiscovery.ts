/**
 * Dynamic Model Discovery & Resolution Service
 * 
 * Permite que o Agent Lab descubra automaticamente modelos ativos e suportados
 * diretamente das APIs de cada provedor (Google, Anthropic, OpenAI, Ollama),
 * evitando strings fixas e desatualizações quando modelos são lançados ou descontinuados.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos de cache em memória
const memoryCache: Record<string, CacheEntry<any>> = {};

function getCached<T>(key: string): T | null {
  const entry = memoryCache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  memoryCache[key] = { data, timestamp: Date.now() };
}

/**
 * Consulta a API do Google Generative Language para obter todos os modelos ativos com suporte a generateContent.
 */
export async function discoverGoogleModels(apiKey?: string): Promise<string[]> {
  const key = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return [];

  const cacheKey = `google_models_${key.slice(-6)}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];

    const json = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
    if (!json.models || !Array.isArray(json.models)) return [];

    const available = json.models
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""))
      .filter((name) => !name.includes("tts") && !name.includes("image-preview")); // Foco em modelos textuais/agênticos

    setCache(cacheKey, available);
    return available;
  } catch (err: any) {
    console.warn("[modelDiscovery] Erro ao consultar modelos do Google:", err.message);
    return [];
  }
}

/**
 * Consulta a API da Anthropic para obter os modelos ativos disponíveis na organização/workspace.
 */
export async function discoverAnthropicModels(apiKey?: string, workspaceId?: string): Promise<string[]> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return [];

  const ws = workspaceId || process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  const cacheKey = `anthropic_models_${key.slice(-6)}_${ws || "none"}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    };
    if (ws) {
      headers["anthropic-workspace-id"] = ws;
    }

    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];

    const json = await res.json() as { data?: Array<{ id: string }> };
    if (!json.data || !Array.isArray(json.data)) return [];

    const available = json.data.map((m) => m.id);
    setCache(cacheKey, available);
    return available;
  } catch (err: any) {
    console.warn("[modelDiscovery] Erro ao consultar modelos da Anthropic:", err.message);
    return [];
  }
}

/**
 * Consulta a API da OpenAI para listar os modelos disponíveis na conta.
 */
export async function discoverOpenAIModels(apiKey?: string): Promise<string[]> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) return [];

  const cacheKey = `openai_models_${key.slice(-6)}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];

    const json = await res.json() as { data?: Array<{ id: string }> };
    if (!json.data || !Array.isArray(json.data)) return [];

    const available = json.data
      .map((m) => m.id)
      .filter((id) => id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3"));

    setCache(cacheKey, available);
    return available;
  } catch (err: any) {
    console.warn("[modelDiscovery] Erro ao consultar modelos da OpenAI:", err.message);
    return [];
  }
}

/**
 * Consulta a API local do Ollama para listar os modelos atualmente baixados.
 */
export async function discoverOllamaModels(baseUrl?: string): Promise<string[]> {
  const url = (baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/api$/, "");
  const cacheKey = `ollama_models_${url}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];

    const json = await res.json() as { models?: Array<{ name: string }> };
    if (!json.models || !Array.isArray(json.models)) return [];

    const available = json.models.map((m) => m.name);
    setCache(cacheKey, available);
    return available;
  } catch {
    return [];
  }
}

/**
 * Resolve o modelId concreto a ser invocado na API do provedor de forma dinâmica:
 * 1. Se o modelo solicitado estiver ativo na API do provedor, usa diretamente.
 * 2. Se for um alias de família (flash, pro, sonnet, etc.), seleciona o mais recente disponível.
 * 3. Se a API estiver offline ou sem credenciais, usa o nome original.
 */
export async function resolveDynamicModelId(provider: string, requestedModelName: string): Promise<string> {
  if (provider === "google") {
    const liveGoogleModels = await discoverGoogleModels();
    if (liveGoogleModels.length > 0) {
      // 1. Se o modelo exato existir na API do Google, utiliza-o
      if (liveGoogleModels.includes(requestedModelName)) {
        return requestedModelName;
      }

      // 2. Se pediu modelo da família Flash
      if (requestedModelName.includes("flash")) {
        // Prefere o alias 'gemini-flash-latest' ou a versão mais alta
        if (liveGoogleModels.includes("gemini-flash-latest")) {
          return "gemini-flash-latest";
        }
        const flashModels = liveGoogleModels.filter((m) => m.includes("flash") && !m.includes("lite") && !m.includes("tts"));
        if (flashModels.length > 0) {
          return flashModels[flashModels.length - 1];
        }
      }

      // 3. Se pediu modelo da família Pro
      if (requestedModelName.includes("pro") || requestedModelName.includes("argon")) {
        if (liveGoogleModels.includes("gemini-pro-latest")) {
          return "gemini-pro-latest";
        }
        const proModels = liveGoogleModels.filter((m) => m.includes("pro") && !m.includes("tts"));
        if (proModels.length > 0) {
          return proModels[proModels.length - 1];
        }
      }
    }

    // Fallback inteligente caso a listagem não esteja disponível
    return requestedModelName.includes("flash") ? "gemini-flash-latest" : requestedModelName;
  }

  if (provider === "anthropic") {
    const liveAnthropicModels = await discoverAnthropicModels();
    if (liveAnthropicModels.length > 0) {
      if (liveAnthropicModels.includes(requestedModelName)) {
        return requestedModelName;
      }
      // Busca pelo prefixo mais próximo (ex: sonnet, haiku, opus)
      const family = requestedModelName.includes("haiku")
        ? "haiku"
        : requestedModelName.includes("opus")
        ? "opus"
        : "sonnet";
      const matches = liveAnthropicModels.filter((m) => m.includes(family));
      if (matches.length > 0) {
        return matches[0];
      }
    }
  }

  if (provider === "openai") {
    const liveOpenAiModels = await discoverOpenAIModels();
    if (liveOpenAiModels.length > 0 && liveOpenAiModels.includes(requestedModelName)) {
      return requestedModelName;
    }
  }

  return requestedModelName;
}
