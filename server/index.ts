import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AGENTS_CATALOG } from "./catalog.js";
import {
  runAgentIsolated,
  runAgentAB,
  validateAgentInput,
  getAgentInstance,
  getAgentCanonicalPrompt,
  getAgentSchemas,
} from "./agentRunner.js";
import {
  listExperiments,
  getExperiment,
  saveExperiment,
  updateExperiment,
  deleteExperiment,
} from "./db.js";
import {
  discoverGoogleModels,
  discoverAnthropicModels,
  discoverOpenAIModels,
  discoverOllamaModels,
} from "./modelDiscovery.js";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env prioritariamente do agent-lab e depois do ai-4sdlc-platform
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", "ai-4sdlc-platform", ".env") });

export const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "agent-lab",
    timestamp: new Date().toISOString(),
  });
});

// 2. Lista todos os 15 agentes com metadados e contagem de presets
app.get("/api/agents", (_req, res) => {
  const list = Object.values(AGENTS_CATALOG).map((agent) => ({
    id: agent.id,
    name: agent.name,
    phase: agent.phase,
    phaseName: agent.phaseName,
    category: agent.category,
    description: agent.description,
    role: agent.role,
    icon: agent.icon,
    badgeColor: agent.badgeColor,
    readsFromCount: agent.readsFrom.length,
    producesArtifact: agent.produces.artifact,
    presetsCount: agent.presets.length,
    version: agent.version || "1.0.0",
  }));
  res.json({ agents: list });
});

// 3. Detalhes completos de um agente específico + prompt canônico + schemas + tools
app.get("/api/agents/:id", async (req, res) => {
  const agentMeta = AGENTS_CATALOG[req.params.id];
  if (!agentMeta) {
    return res.status(404).json({ error: `Agente "${req.params.id}" não encontrado.` });
  }

  try {
    const instance = await getAgentInstance(req.params.id);
    const canonicalPrompt = await getAgentCanonicalPrompt(req.params.id, "standard", "limited");
    const schemas = await getAgentSchemas(req.params.id);

    res.json({
      agent: {
        ...agentMeta,
        version: agentMeta.version || "1.0.0",
        canonicalPrompt,
        inputSchemaJson: schemas.inputSchemaJson,
        outputSchemaJson: schemas.outputSchemaJson,
        toolNames: instance.toolNames || [],
        modes: instance.modes || ["standard", "thorough", "fast"],
      },
    });
  } catch (err: any) {
    res.json({
      agent: {
        ...agentMeta,
        version: agentMeta.version || "1.0.0",
        canonicalPrompt: `[Prompt canônico temporariamente indisponível: ${err.message}]`,
        inputSchemaJson: null,
        outputSchemaJson: null,
        toolNames: [],
        modes: ["standard", "thorough", "fast"],
      },
    });
  }
});

// 3.1. Schemas específicos de um agente
app.get("/api/agents/:id/schemas", async (req, res) => {
  try {
    const schemas = await getAgentSchemas(req.params.id);
    res.json(schemas);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Validação do input JSON contra o schema Zod
app.post("/api/agents/:id/validate", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await validateAgentInput(id, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ valid: false, error: err.message });
  }
});

// 5. Execução isolada do agente com características customizadas
app.post("/api/agents/:id/run", async (req, res) => {
  const { id } = req.params;
  const {
    input,
    mode = "fallback",
    modelOverride,
    agentConfig,
    customOutputSchemaJson,
    customInputSchemaJson,
  } = req.body;

  try {
    const result = await runAgentIsolated({
      agentName: id,
      input,
      mode,
      modelOverride,
      agentConfig,
      customOutputSchemaJson,
      customInputSchemaJson,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 5.1. Execução comparativa A/B (Entre quaisquer versões ou agentes)
app.post("/api/agents/:id/run-ab", async (req, res) => {
  const { id } = req.params;
  const {
    input,
    mode = "llm",
    modelOverride,
    versionAName,
    configA,
    customInputSchemaJsonA,
    customOutputSchemaJsonA,
    versionBName,
    configB,
    customInputSchemaJsonB,
    customOutputSchemaJsonB,
    customConfig,
    customOutputSchemaJson,
  } = req.body;

  try {
    const result = await runAgentAB({
      agentName: id,
      input,
      mode,
      modelOverride,
      versionAName,
      configA,
      customInputSchemaJsonA,
      customOutputSchemaJsonA,
      versionBName,
      configB,
      customInputSchemaJsonB,
      customOutputSchemaJsonB,
      customConfig,
      customOutputSchemaJson,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ── ROTAS DE EXPERIMENTOS (BANCO LOCAL) ───────────────────────────
app.get("/api/experiments", (req, res) => {
  try {
    const agentId = req.query.agentId as string | undefined;
    const list = listExperiments(agentId);
    res.json({ experiments: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/experiments/:id", (req, res) => {
  const exp = getExperiment(req.params.id);
  if (!exp) {
    return res.status(404).json({ error: "Experimento não encontrado." });
  }
  res.json({ experiment: exp });
});

app.post("/api/experiments", (req, res) => {
  try {
    const saved = saveExperiment(req.body);
    res.json({ experiment: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/experiments/:id", (req, res) => {
  try {
    const updated = updateExperiment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Experimento não encontrado." });
    }
    res.json({ experiment: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/experiments/:id", (req, res) => {
  const success = deleteExperiment(req.params.id);
  res.json({ success });
});

// 6. Provedores e status de chaves de API (com descoberta dinâmica em tempo real)
app.get("/api/models", async (_req, res) => {
  const [googleLive, anthropicLive, openAiLive, ollamaLive] = await Promise.all([
    discoverGoogleModels(),
    discoverAnthropicModels(),
    discoverOpenAIModels(),
    discoverOllamaModels(),
  ]);

  // Só modelos que a API de cada provedor devolve para a chave configurada
  // (sem nomes fixos no código). Se a chave existe mas a descoberta falhou
  // (timeout, rede), o provedor continua visível com o modelo preferido e o
  // nome avisa que a lista não foi verificada — em vez de sumir sem explicação.
  const buildProvider = (
    name: string,
    available: boolean,
    prefix: string,
    live: string[],
    preferred: string[],
  ) => {
    if (available && live.length === 0 && preferred.length > 0) {
      const fallbackId = `${prefix}:${preferred[0]}`;
      return {
        name: `${name} (não foi possível listar os modelos)`,
        available,
        models: [fallbackId],
        default: fallbackId,
      };
    }
    const models = Array.from(new Set(live.map((m) => `${prefix}:${m}`)));
    const preferredId = preferred.map((p) => `${prefix}:${p}`).find((p) => models.includes(p));
    return { name, available, models, default: preferredId ?? models[0] };
  };

  const allProviders = {
    anthropic: buildProvider(
      "Anthropic Claude",
      Boolean(process.env.ANTHROPIC_API_KEY),
      "anthropic",
      anthropicLive,
      ["claude-sonnet-5-5"],
    ),
    openai: buildProvider(
      "OpenAI",
      Boolean(process.env.OPENAI_API_KEY),
      "openai",
      // Fora: modelos de imagem, áudio, voz, transcrição, embeddings e busca,
      // que não geram a saída de texto estruturada dos agentes.
      openAiLive.filter((m) => !/image|audio|realtime|tts|transcribe|embedding|search|dall-e/.test(m)),
      [],
    ),
    google: buildProvider(
      "Google Gemini",
      Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY),
      "google",
      // A API do Google também lista modelos de imagem, música, robótica e
      // agentes prontos (que não geram a saída de texto estruturada dos agentes),
      // além de previews, versões lite, Gemma e variantes especiais — fora da lista.
      googleLive.filter(
        (m) =>
          !/image|lyria|banana|robotics|transcribe|computer-use|deep-research|antigravity|preview|lite|gemma|omni|customtools/.test(
            m,
          ),
      ),
      ["gemini-flash-latest"],
    ),
    ollama: buildProvider(
      "Ollama (Local)",
      Boolean(process.env.OLLAMA_BASE_URL || ollamaLive.length > 0),
      "ollama",
      ollamaLive,
      [],
    ),
  };

  // Provedores sem chave (ou sem nenhum modelo) não aparecem na interface.
  const providers = Object.fromEntries(
    Object.entries(allProviders).filter(([, p]) => p.available && p.models.length > 0),
  );
  res.json({ providers });
});

app.listen(PORT, () => {
  console.log(`[Agent Lab Server] Rodando na porta http://localhost:${PORT}`);
});
