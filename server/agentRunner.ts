import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { z } from "zod";
import { saveExperiment } from "./db.js";
import { enrichFallbackOutput } from "./agentEnricher.js";
import { resolveDynamicModelId } from "./modelDiscovery.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para os pacotes do monorepo ai-4sdlc-platform
const PLATFORM_ROOT = path.resolve(__dirname, "../../ai-4sdlc-platform");
const AGENTS_DIST_PATH = pathToFileURL(path.resolve(PLATFORM_ROOT, "packages/agents/dist/index.js")).href;
const CORE_DIST_PATH = pathToFileURL(path.resolve(PLATFORM_ROOT, "packages/core/dist/index.js")).href;
const CORE_FACTORY_PATH = pathToFileURL(path.resolve(PLATFORM_ROOT, "packages/core/dist/factory.js")).href;

const platformRequire = createRequire(path.resolve(PLATFORM_ROOT, "packages/core/package.json"));

let _agentsModule: Record<string, any> | null = null;
let _coreModule: Record<string, any> | null = null;
let _factoryModule: Record<string, any> | null = null;

async function getAgentsModule() {
  if (!_agentsModule) {
    _agentsModule = await import(AGENTS_DIST_PATH);
  }
  return _agentsModule;
}

async function getCoreModule() {
  if (!_coreModule) {
    try {
      _coreModule = await import(CORE_DIST_PATH);
    } catch {
      _coreModule = null;
    }
  }
  return _coreModule;
}

async function getFactoryModule() {
  if (!_factoryModule) {
    try {
      _factoryModule = await import(CORE_FACTORY_PATH);
    } catch {
      _factoryModule = null;
    }
  }
  return _factoryModule;
}

/**
 * Resolve e instancia um LanguageModel compatível com o Vercel AI SDK 7,
 * injetando credenciais e o cabeçalho 'anthropic-workspace-id' para chaves Anthropic sk-ant-usr-.
 */
export async function resolveLanguageModel(modelId: string) {
  const colon = modelId.indexOf(":");
  const provider = colon >= 0 ? modelId.slice(0, colon) : "anthropic";
  const rawModelName = colon >= 0 ? modelId.slice(colon + 1) : modelId;
  const modelName = await resolveDynamicModelId(provider, rawModelName);

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();

    if (apiKey?.startsWith("sk-ant-usr-") && !workspaceId) {
      throw new Error(
        "A chave ANTHROPIC_API_KEY no arquivo .env é uma chave de usuário pessoal (iniciada com 'sk-ant-usr-'). A API da Anthropic exige a especificação do Workspace ID.\n\n" +
        "👉 Como resolver:\n" +
        "1. Abra seu Console Anthropic (console.anthropic.com) > Workspaces > Settings;\n" +
        "2. Copie o Workspace ID (ex: wrkspc_01...);\n" +
        "3. No arquivo .env do agent-lab, preencha: ANTHROPIC_WORKSPACE_ID=wrkspc_...\n\n" +
        "Alternativas:\n" +
        "• Gerar uma chave scoped diretamente ao Workspace (sk-ant-api03-...);\n" +
        "• Selecionar Google Gemini ou outro modelo no seletor de modelos do cabeçalho;\n" +
        "• Alternar para o Modo Offline (Mock) para validação sintética imediata."
      );
    }

    try {
      const anthropicPkg = platformRequire("@ai-sdk/anthropic");
      const factoryOpts: Record<string, any> = {};
      if (apiKey) factoryOpts.apiKey = apiKey;
      if (process.env.ANTHROPIC_BASE_URL) factoryOpts.baseURL = process.env.ANTHROPIC_BASE_URL;

      const headers: Record<string, string> = {};
      if (workspaceId) {
        headers["anthropic-workspace-id"] = workspaceId;
      }
      if (Object.keys(headers).length > 0) {
        factoryOpts.headers = headers;
      }

      const customAnthropic = anthropicPkg.createAnthropic(factoryOpts);
      return customAnthropic(modelName);
    } catch (e: any) {
      if (e.message?.includes("sk-ant-usr-")) throw e;
      console.warn(`[agent-lab] Falha ao criar Anthropic via @ai-sdk/anthropic:`, e.message);
    }
  }

  if (provider === "google") {
    try {
      const googlePkg = platformRequire("@ai-sdk/google");
      const factoryOpts: Record<string, any> = {};
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        factoryOpts.apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      }
      if (process.env.GOOGLE_BASE_URL) factoryOpts.baseURL = process.env.GOOGLE_BASE_URL;

      const customGoogle = googlePkg.createGoogleGenerativeAI(factoryOpts);
      return customGoogle(modelName);
    } catch (e: any) {
      console.warn(`[agent-lab] Falha ao criar Google via @ai-sdk/google:`, e.message);
    }
  }

  if (provider === "openai") {
    try {
      const openaiPkg = platformRequire("@ai-sdk/openai");
      const factoryOpts: Record<string, any> = {};
      if (process.env.OPENAI_API_KEY) factoryOpts.apiKey = process.env.OPENAI_API_KEY;
      if (process.env.OPENAI_BASE_URL) factoryOpts.baseURL = process.env.OPENAI_BASE_URL;

      const customOpenAI = openaiPkg.createOpenAI(factoryOpts);
      return customOpenAI(modelName);
    } catch (e: any) {
      console.warn(`[agent-lab] Falha ao criar OpenAI via @ai-sdk/openai:`, e.message);
    }
  }

  if (provider === "ollama") {
    try {
      const ollamaPkg = platformRequire("ollama-ai-provider-v2");
      const customOllama = ollamaPkg.createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/api",
      });
      return customOllama(modelName);
    } catch (e: any) {
      console.warn(`[agent-lab] Falha ao criar Ollama via ollama-ai-provider-v2:`, e.message);
    }
  }

  return undefined;
}

// Mapeamento dos nomes para os objetos de agente exportados
const AGENT_EXPORT_MAP: Record<string, string> = {
  Discovery: "discoveryAgent",
  RiskElicitor: "riskElicitorAgent",
  TierClassifier: "tierClassifierAgent",
  PM: "pmAgent",
  SolutionArchitect: "solutionArchitectAgent",
  UX: "uxAgent",
  UI: "uiAgent",
  SoftwareArchitect: "softwareArchitectAgent",
  DataArchitect: "dataArchitectAgent",
  DevOps: "devOpsAgent",
  Security: "securityAgent",
  Compliance: "complianceAgent",
  QA: "qaAgent",
  TechLead: "techLeadAgent",
  Auditor: "auditorSemanticAgent",
};

export async function getAgentInstance(agentName: string) {
  const mod = await getAgentsModule();
  const exportName = AGENT_EXPORT_MAP[agentName];
  if (!mod || !exportName || !mod[exportName]) {
    throw new Error(`Agente "${agentName}" não encontrado no pacote @sdlc/agents.`);
  }
  return mod[exportName];
}

export async function getAgentCanonicalPrompt(
  agentName: string,
  mode: string = "standard",
  riskTier: string = "limited"
): Promise<string> {
  const agent = await getAgentInstance(agentName);
  if (typeof agent.systemPrompt === "function") {
    try {
      return agent.systemPrompt({
        mode,
        riskTier,
        cwd: PLATFORM_ROOT,
      }) || "";
    } catch (err: any) {
      return `[Erro ao gerar prompt canônico: ${err.message}]`;
    }
  }
  return String(agent.systemPrompt || "");
}

/**
 * Campos do input que o inputSchema do agente não declara. O Zod (modo padrão,
 * não-strict) os descarta em silêncio — então um nome digitado errado some sem
 * erro e o agente roda sem aquela informação. Aqui eles viram aviso.
 */
function findUnknownFields(schema: any, input: unknown): string[] {
  const shape = schema?.shape;
  if (!shape || typeof input !== "object" || input === null || Array.isArray(input)) return [];
  return Object.keys(input).filter((key) => !Object.prototype.hasOwnProperty.call(shape, key));
}

export async function validateAgentInput(agentName: string, input: unknown) {
  const agent = await getAgentInstance(agentName);
  const unknownFields = findUnknownFields(agent.inputSchema, input);
  const result = agent.inputSchema.safeParse(input);
  if (!result.success) {
    return {
      valid: false,
      unknownFields,
      errors: result.error.issues.map((issue: any) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    valid: true,
    unknownFields,
    data: result.data,
  };
}

export async function getAgentSchemas(agentName: string) {
  const agent = await getAgentInstance(agentName);
  let inputSchemaJson: any = null;
  try {
    inputSchemaJson =
      typeof agent.inputSchema?.toJSONSchema === "function"
        ? agent.inputSchema.toJSONSchema()
        : null;
  } catch {
    if (agent.inputSchema?.shape) {
      inputSchemaJson = {
        type: "object",
        properties: Object.fromEntries(
          Object.keys(agent.inputSchema.shape).map((k) => [k, { type: "string" }])
        ),
      };
    }
  }

  let outputSchemaJson: any = null;
  try {
    outputSchemaJson =
      typeof agent.outputSchema?.toJSONSchema === "function"
        ? agent.outputSchema.toJSONSchema()
        : null;
  } catch {
    if (agent.outputSchema?.shape) {
      outputSchemaJson = {
        type: "object",
        properties: Object.fromEntries(
          Object.keys(agent.outputSchema.shape).map((k) => [k, { type: "string" }])
        ),
      };
    }
  }

  return {
    agentName,
    inputSchemaJson,
    outputSchemaJson,
  };
}

export function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  if (!schema || typeof schema !== "object") {
    return z.any();
  }

  let zodType: z.ZodTypeAny;

  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    zodType = z.enum(schema.enum as [string, ...string[]]);
  } else {
    switch (schema.type) {
      case "string": {
        let str = z.string();
        if (typeof schema.minLength === "number") str = str.min(schema.minLength);
        if (typeof schema.maxLength === "number") str = str.max(schema.maxLength);
        zodType = str;
        break;
      }
      case "number":
      case "integer": {
        let num = z.number();
        if (typeof schema.minimum === "number") num = num.min(schema.minimum);
        if (typeof schema.maximum === "number") num = num.max(schema.maximum);
        zodType = num;
        break;
      }
      case "boolean":
        zodType = z.boolean();
        break;
      case "array": {
        const itemType = schema.items ? jsonSchemaToZod(schema.items) : z.any();
        let arr = z.array(itemType);
        if (typeof schema.minItems === "number") arr = arr.min(schema.minItems);
        zodType = arr;
        break;
      }
      case "object": {
        const properties = schema.properties || {};
        const required = new Set(schema.required || []);
        const shape: Record<string, z.ZodTypeAny> = {};

        for (const [key, propSchema] of Object.entries(properties)) {
          let propZod = jsonSchemaToZod(propSchema);
          if (!required.has(key)) {
            propZod = propZod.optional();
          }
          shape[key] = propZod;
        }

        zodType = z.object(shape);
        if (schema.additionalProperties !== false) {
          zodType = (zodType as z.ZodObject<any>).passthrough();
        }
        break;
      }
      default:
        zodType = z.any();
    }
  }

  if (schema.description && typeof schema.description === "string") {
    zodType = zodType.describe(schema.description);
  }

  return zodType;
}

export interface AgentCharacteristicsConfig {
  promptMode?: "canonical" | "append" | "override";
  promptAppend?: string;
  promptOverride?: string;
  mode?: "standard" | "thorough" | "fast";
  riskTier?: "minimal" | "limited" | "high" | "high_risk";
  temperature?: number;
  effort?: "low" | "medium" | "high";
  modelId?: string;
  enabledTools?: string[];
  outputSchemaJson?: unknown;
  inputSchemaJson?: unknown;
}

export interface RunAgentOptions {
  agentName: string;
  input: unknown;
  mode?: "fallback" | "llm";
  modelOverride?: string;
  agentConfig?: AgentCharacteristicsConfig;
  customOutputSchemaJson?: unknown;
  customInputSchemaJson?: unknown;
}

export async function runAgentIsolated(opts: RunAgentOptions) {
  const { agentName, input, mode = "fallback", modelOverride, agentConfig } = opts;
  const agent = await getAgentInstance(agentName);

  // 1. Validação de Entrada
  const rawInputSchema = opts.customInputSchemaJson || agentConfig?.inputSchemaJson;
  let validation: { valid: boolean; data?: any; errors?: any[] };

  if (rawInputSchema) {
    try {
      const parsedInputSchema =
        typeof rawInputSchema === "string"
          ? JSON.parse(rawInputSchema)
          : rawInputSchema;
      const customInputZod = jsonSchemaToZod(parsedInputSchema);
      const res = customInputZod.safeParse(input);
      if (!res.success) {
        validation = {
          valid: false,
          errors: res.error.issues.map((issue: any) => ({
            path: issue.path.join(".") || "(root)",
            message: issue.message,
            code: issue.code,
          })),
        };
      } else {
        validation = { valid: true, data: res.data };
      }
    } catch {
      validation = await validateAgentInput(agentName, input);
    }
  } else {
    validation = await validateAgentInput(agentName, input);
  }

  if (!validation.valid) {
    return {
      success: false,
      error: "Validação do inputSchema falhou",
      validationErrors: validation.errors,
      elapsedMs: 0,
    };
  }

  // 2. Preparação das Características e Contexto Customizado
  const auditEvents: Array<{ type: string; payload?: unknown; timestamp: string }> = [];
  const startedAt = Date.now();
  const originalFallbackEnv = process.env.SDLC_AGENT_FALLBACK;

  const effectiveExecutionMode = agentConfig?.mode || "standard";
  const effectiveRiskTier = agentConfig?.riskTier || (input as any)?.riskTier || "limited";

  // Determina o prompt de sistema efetivo
  const canonicalPrompt = await getAgentCanonicalPrompt(agentName, effectiveExecutionMode, effectiveRiskTier);
  let effectivePrompt = canonicalPrompt;

  if (agentConfig?.promptMode === "override" && agentConfig.promptOverride?.trim()) {
    effectivePrompt = agentConfig.promptOverride.trim();
  } else if (agentConfig?.promptMode === "append" && agentConfig.promptAppend?.trim()) {
    effectivePrompt = `${canonicalPrompt}\n\n${agentConfig.promptAppend.trim()}`;
  }

  const effectiveTools = agentConfig?.enabledTools ?? agent.toolNames ?? [];

  try {
    let resolvedModel: any = undefined;

    if (mode === "llm") {
      process.env.SDLC_AGENT_FALLBACK = "0";
      const modelId = agentConfig?.modelId || modelOverride || "anthropic:claude-sonnet-5-5";
      try {
        resolvedModel = await resolveLanguageModel(modelId);
      } catch (rErr: any) {
        throw rErr;
      }
      if (!resolvedModel) {
        const core = await getCoreModule();
        if (core && core.modelById) {
          try {
            resolvedModel = core.modelById(modelId);
          } catch (mErr: any) {
            console.warn(`Não foi possível inicializar modelo ${modelId}:`, mErr.message);
          }
        }
      }
    } else {
      // Modo offline / fallback determinístico
      process.env.SDLC_AGENT_FALLBACK = "1";
    }

    const mockCtx = {
      runId: `lab-run-${Date.now()}`,
      nodeId: agentName.toLowerCase(),
      agent: agentName,
      mode: effectiveExecutionMode,
      riskTier: effectiveRiskTier,
      cwd: PLATFORM_ROOT,
      state: { runId: `lab-run-${Date.now()}` },
      tools: effectiveTools.map((t: string) => ({ name: t })),
      emitAudit: (e: any) => {
        auditEvents.push({
          type: e.type,
          payload: e.payload,
          timestamp: new Date().toISOString(),
        });
      },
      invokeTool: async () => ({}),
      ...(resolvedModel ? { model: resolvedModel } : {}),
      samplingParams: {
        temperature: agentConfig?.temperature ?? 0.2,
      },
      effort: agentConfig?.effort ?? "medium",
    };

    const rawSchemaJson =
      opts.customOutputSchemaJson || agentConfig?.outputSchemaJson;
    let customOutputZod: z.ZodTypeAny | null = null;
    if (rawSchemaJson) {
      try {
        const parsedObj =
          typeof rawSchemaJson === "string"
            ? JSON.parse(rawSchemaJson)
            : rawSchemaJson;
        customOutputZod = jsonSchemaToZod(parsedObj);
      } catch (err: any) {
        console.warn("Falha ao converter customOutputSchemaJson para Zod:", err.message);
      }
    }

    let output: any;
    const originalSysPrompt = agent.systemPrompt;
    const originalOutputSchema = agent.outputSchema;

    try {
      if (effectivePrompt) {
        agent.systemPrompt = () => effectivePrompt;
      }
      if (customOutputZod) {
        agent.outputSchema = customOutputZod;
      }
      output = await agent.run(validation.data, mockCtx);
    } finally {
      agent.systemPrompt = originalSysPrompt;
      agent.outputSchema = originalOutputSchema;
    }

    // Enriquecimento determinístico de alta fidelidade para os 15 agentes em modo fallback/offline
    if (mode === "fallback") {
      const isCustomV2 =
        agentConfig?.promptMode === "override" ||
        Boolean(agentConfig?.promptAppend?.trim()) ||
        Boolean(customOutputZod);

      output = enrichFallbackOutput(agentName, output, validation.data, isCustomV2);
    }

    const elapsedMs = Date.now() - startedAt;

    // 4. Validação de Saída
    let outputValid = true;
    let outputValidationErrors: any[] | undefined = undefined;
    const schemaToValidate = customOutputZod || agent.outputSchema;
    if (schemaToValidate) {
      const outCheck = schemaToValidate.safeParse(output);
      if (!outCheck.success) {
        outputValid = false;
        outputValidationErrors = outCheck.error.issues;
      }
    }

    // 5. Geração de Representação Markdown do Artefato
    const markdownRepresentation = formatMarkdownFromOutput(agentName, output);

    return {
      success: true,
      agentName,
      modeUsed: mode,
      elapsedMs,
      output,
      outputValid,
      outputValidationErrors,
      auditEvents,
      markdownRepresentation,
      appliedConfig: {
        promptMode: agentConfig?.promptMode || "canonical",
        mode: effectiveExecutionMode,
        riskTier: effectiveRiskTier,
        temperature: agentConfig?.temperature ?? 0.2,
        effort: agentConfig?.effort ?? "medium",
        toolsCount: effectiveTools.length,
        promptLength: effectivePrompt.length,
        promptPreview:
          effectivePrompt.slice(0, 300) +
          (effectivePrompt.length > 300 ? "..." : ""),
        customOutputSchemaActive: Boolean(customOutputZod),
        customInputSchemaActive: Boolean(rawInputSchema),
      },
    };
  } catch (err: any) {
    const elapsedMs = Date.now() - startedAt;
    let errorMessage = err.message || "Erro desconhecido durante execução do agente";
    const llmErrorEvent = auditEvents.find(e => e.type === "llm.error" || e.type === "llm.fallback");
    const fullErrorContext = `${errorMessage} ${JSON.stringify(llmErrorEvent?.payload || {})}`;

    if (
      fullErrorContext.includes("anthropic-workspace-id") ||
      fullErrorContext.includes("not scoped to a workspace")
    ) {
      errorMessage =
        "A chave ANTHROPIC_API_KEY no arquivo .env é uma chave de usuário pessoal (iniciada com 'sk-ant-usr-'). A API da Anthropic exige a especificação de um Workspace ID válido para autorizar a requisição.\n\n" +
        "👉 Como resolver:\n" +
        "1. Acesse o Console da Anthropic (https://console.anthropic.com) > Workspaces > Escolha seu Workspace > Settings (ou Configurações);\n" +
        "2. Copie o identificador do Workspace (inicia com 'wrkspc_...');\n" +
        "3. Abra o arquivo agent-lab/.env e defina: ANTHROPIC_WORKSPACE_ID=wrkspc_...\n\n" +
        "Alternativas imediatas:\n" +
        "• Gerar uma chave criada diretamente dentro de um Workspace (iniciada com 'sk-ant-api03-...');\n" +
        "• Selecionar Google Gemini ou outro modelo no seletor de modelos do topo;\n" +
        "• Alternar para o Modo Offline (Mock) para validação sintética instantânea sem chaves.";
    }
    return {
      success: false,
      agentName,
      error: errorMessage,
      stack: err.stack,
      elapsedMs,
      auditEvents,
      appliedConfig: {
        promptMode: agentConfig?.promptMode || "canonical",
        mode: effectiveExecutionMode,
        riskTier: effectiveRiskTier,
      },
    };
  } finally {
    // Restaura o ambiente
    if (originalFallbackEnv !== undefined) {
      process.env.SDLC_AGENT_FALLBACK = originalFallbackEnv;
    } else {
      delete process.env.SDLC_AGENT_FALLBACK;
    }
  }
}

export interface RunAgentABOptions {
  agentName: string;
  input: unknown;
  mode?: "fallback" | "llm";
  modelOverride?: string;
  versionAName?: string;
  configA?: AgentCharacteristicsConfig;
  customInputSchemaJsonA?: unknown;
  customOutputSchemaJsonA?: unknown;
  versionBName?: string;
  configB?: AgentCharacteristicsConfig;
  customInputSchemaJsonB?: unknown;
  customOutputSchemaJsonB?: unknown;
  customConfig?: AgentCharacteristicsConfig;
  customOutputSchemaJson?: unknown;
}

export async function runAgentAB(opts: RunAgentABOptions) {
  const {
    agentName,
    input,
    mode = "llm",
    modelOverride,
    versionAName = "Oficial SDLC",
    configA,
    customInputSchemaJsonA,
    customOutputSchemaJsonA,
    versionBName = "v2 Custom",
    configB,
    customInputSchemaJsonB,
    customOutputSchemaJsonB,
    customConfig,
    customOutputSchemaJson,
  } = opts;
  const agent = await getAgentInstance(agentName);
  const canonicalPrompt = await getAgentCanonicalPrompt(
    agentName,
    "standard",
    "limited",
  );
  const schemas = await getAgentSchemas(agentName);

  const effectiveConfigA: AgentCharacteristicsConfig = configA || {
    promptMode: "canonical",
    mode: "standard",
    riskTier: "limited",
    temperature: 0.2,
    effort: "medium",
    enabledTools: agent.toolNames || [],
  };

  const effectiveConfigB = configB || customConfig;

  // 1. Execução A (Base / Config A)
  const runAPromise = runAgentIsolated({
    agentName,
    input,
    mode,
    modelOverride,
    agentConfig: effectiveConfigA,
    customInputSchemaJson: customInputSchemaJsonA || effectiveConfigA?.inputSchemaJson,
    customOutputSchemaJson: customOutputSchemaJsonA || effectiveConfigA?.outputSchemaJson,
  });

  // 2. Execução B (Candidato / Config B)
  const runBPromise = runAgentIsolated({
    agentName,
    input,
    mode,
    modelOverride,
    agentConfig: effectiveConfigB,
    customInputSchemaJson: customInputSchemaJsonB || effectiveConfigB?.inputSchemaJson,
    customOutputSchemaJson:
      customOutputSchemaJsonB || customOutputSchemaJson || effectiveConfigB?.outputSchemaJson,
  });

  // Executa simultaneamente
  const [canonicalResult, customResult] = await Promise.all([
    runAPromise,
    runBPromise,
  ]);

  // 3. Análise de diff estrutural e de linhas
  const strA = JSON.stringify(canonicalResult.output || {}, null, 2);
  const strB = JSON.stringify(customResult.output || {}, null, 2);
  const linesA = strA.split("\n");
  const linesB = strB.split("\n");

  const keysA = Object.keys(
    canonicalResult.output && typeof canonicalResult.output === "object"
      ? canonicalResult.output
      : {},
  );
  const keysB = Object.keys(
    customResult.output && typeof customResult.output === "object"
      ? customResult.output
      : {},
  );
  const addedKeys = keysB.filter((k) => !keysA.includes(k));
  const removedKeys = keysA.filter((k) => !keysB.includes(k));
  const commonKeys = keysA.filter((k) => keysB.includes(k));

  let diffLinesCount = 0;
  const maxLines = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLines; i++) {
    if (linesA[i] !== linesB[i]) diffLinesCount++;
  }

  const diffSummary = {
    totalLinesA: linesA.length,
    totalLinesB: linesB.length,
    diffLinesCount,
    structuralDiff: {
      addedKeys,
      removedKeys,
      commonKeys,
    },
  };

  // 4. Salva no banco de dados local de experimentos
  const savedExp = saveExperiment({
    agentId: agentName,
    title: `Experimento A/B — ${agentName} (${versionAName} vs ${versionBName})`,
    modelId: modelOverride || "anthropic:claude-sonnet-5-5",
    mode,
    input,
    versionAName,
    versionBName,
    canonicalConfig: {
      prompt: effectiveConfigA?.promptOverride || canonicalPrompt,
      outputSchemaJson: customOutputSchemaJsonA || effectiveConfigA?.outputSchemaJson || schemas.outputSchemaJson,
    },
    customConfig: {
      promptMode: effectiveConfigB?.promptMode || "canonical",
      promptAppend: effectiveConfigB?.promptAppend,
      promptOverride: effectiveConfigB?.promptOverride,
      outputSchemaJson: customOutputSchemaJsonB || customOutputSchemaJson || effectiveConfigB?.outputSchemaJson,
      mode: effectiveConfigB?.mode || "standard",
      riskTier: effectiveConfigB?.riskTier || "limited",
      temperature: effectiveConfigB?.temperature ?? 0.2,
      effort: effectiveConfigB?.effort ?? "medium",
    },
    canonicalResult: {
      success: canonicalResult.success,
      output: canonicalResult.output,
      elapsedMs: canonicalResult.elapsedMs || 0,
      outputValid: canonicalResult.outputValid,
      outputValidationErrors: canonicalResult.outputValidationErrors,
      markdown: canonicalResult.markdownRepresentation,
      error: canonicalResult.error,
    },
    customResult: {
      success: customResult.success,
      output: customResult.output,
      elapsedMs: customResult.elapsedMs || 0,
      outputValid: customResult.outputValid,
      outputValidationErrors: customResult.outputValidationErrors,
      markdown: customResult.markdownRepresentation,
      error: customResult.error,
    },
    diffSummary,
  });

  return {
    success: canonicalResult.success && customResult.success,
    agentName,
    experimentId: savedExp.id,
    versionAName,
    versionBName,
    canonicalResult,
    customResult,
    diffSummary,
  };
}

function formatMarkdownFromOutput(agentName: string, output: any): string {
  if (!output || typeof output !== "object") {
    return String(output ?? "");
  }

  const sections: string[] = [];
  sections.push(`# Artefato Gerado: ${agentName}\n`);

  if (output.summary) {
    sections.push(`## Sumário Executivo\n\n${output.summary}\n`);
  }

  // PM
  if (output.body) {
    sections.push(`## Especificação Canônica (PRD)\n\n${output.body}\n`);
  } else if (output.spec && typeof output.spec === "object") {
    sections.push(`## Especificação Canônica (PRD)\n\n\`\`\`json\n${JSON.stringify(output.spec, null, 2)}\n\`\`\`\n`);
  }

  // Discovery & Problem
  if (output.problemStatement) {
    sections.push(`## Declaração do Problema\n\n${output.problemStatement}\n`);
  }

  if (Array.isArray(output.personas) && output.personas.length > 0) {
    sections.push(`## Personas\n\n${output.personas.map((p: string) => `- ${p}`).join("\n")}\n`);
  }

  if (Array.isArray(output.jobsToBeDone) && output.jobsToBeDone.length > 0) {
    sections.push(`## Jobs-To-Be-Done (JTBD)\n\n${output.jobsToBeDone.map((j: string) => `- ${j}`).join("\n")}\n`);
  }

  if (Array.isArray(output.assumptions) && output.assumptions.length > 0) {
    sections.push(`## Premissas & Suposições\n\n${output.assumptions.map((a: string) => `- ${a}`).join("\n")}\n`);
  }

  if (Array.isArray(output.successSignals) && output.successSignals.length > 0) {
    sections.push(`## Sinais de Sucesso\n\n${output.successSignals.map((s: string) => `- 🎯 ${s}`).join("\n")}\n`);
  }

  // TierClassifier & RiskElicitor
  if (output.tier) {
    sections.push(`## Classificação de Risco (Tier)\n\n- **Tier Atribuído**: \`${String(output.tier).toUpperCase()}\`\n- **Método**: \`${output.method || "ISO 27005"}\`\n- **Score Máximo L×I**: \`${output.score_max_li ?? output.scoring?.score_max ?? "N/A"}\`\n\n**Justificativa**:\n${output.justification || "Sem justificativa formal."}\n`);
  }

  if (Array.isArray(output.controls_required) && output.controls_required.length > 0) {
    sections.push(`## Controles Mandatórios Exigidos\n\n${output.controls_required.map((c: string) => `- [x] ${c}`).join("\n")}\n`);
  }

  if (output.scoring) {
    sections.push(`## Score de Risco Quantitativo (ISO 27005)\n\n- **Probabilidade Máxima (L)**: ${output.scoring.likelihood_max ?? "N/A"}\n- **Impacto Máximo (I)**: ${output.scoring.impact_max ?? "N/A"}\n- **Score Global L×I**: **${output.scoring.score_max ?? "N/A"}**\n`);
  }

  // Architects C4 Diagrams & ADRs
  if (output.c4Context) {
    sections.push(`## Diagrama C4 Nível 1 (System Context)\n\n\`\`\`mermaid\n${output.c4Context}\n\`\`\`\n`);
  }

  if (output.c4Container) {
    sections.push(`## Diagrama C4 Nível 2 (Container)\n\n\`\`\`mermaid\n${output.c4Container}\n\`\`\`\n`);
  }

  if (Array.isArray(output.decisions) && output.decisions.length > 0) {
    sections.push(`## Decisões Arquiteturais (ADRs)\n\n${output.decisions.map((d: string) => `- **${d}**`).join("\n")}\n`);
  }

  if (Array.isArray(output.components) && output.components.length > 0) {
    sections.push(`## Componentes de Software\n\n${output.components.map((c: string) => `- \`${c}\``).join("\n")}\n`);
  }

  if (Array.isArray(output.risks) && output.risks.length > 0) {
    sections.push(`## Matriz de Riscos & Mitigações\n\n${output.risks.map((r: string) => `- ${r}`).join("\n")}\n`);
  }

  // UX
  if (Array.isArray(output.userFlows) && output.userFlows.length > 0) {
    sections.push(`## Fluxos de Usuário & Interação (UX)\n\n${output.userFlows.map((f: string) => `- **${f}**`).join("\n\n")}\n`);
  }

  if (Array.isArray(output.wireframes) && output.wireframes.length > 0) {
    sections.push(`## Wireframes Operacionais\n\n${output.wireframes.map((w: string) => `\`\`\`text\n${w}\n\`\`\``).join("\n\n")}\n`);
  }

  if (output.designSystemNotes) {
    sections.push(`## Diretrizes do Design System\n\n${output.designSystemNotes}\n`);
  }

  if (Array.isArray(output.accessibilityConsiderations) && output.accessibilityConsiderations.length > 0) {
    sections.push(`## Acessibilidade & Ergonomia (WCAG)\n\n${output.accessibilityConsiderations.map((a: string) => `- ♿ ${a}`).join("\n")}\n`);
  }

  // UI
  if (Array.isArray(output.frames) && output.frames.length > 0) {
    sections.push(`## Telas & Frames de Interface (UI)\n\n${output.frames.map((f: string) => `- 🖥️ ${f}`).join("\n")}\n`);
  }

  if (Array.isArray(output.designTokens) && output.designTokens.length > 0) {
    sections.push(`## Design Tokens (Tailwind CSS)\n\n${output.designTokens.map((t: string) => `- \`${t}\``).join("\n")}\n`);
  }

  if (output.fallbackHtml) {
    sections.push(`## Código de Protótipo (HTML + Tailwind)\n\n\`\`\`html\n${output.fallbackHtml}\n\`\`\`\n`);
  }

  // DataArchitect
  if (Array.isArray(output.entities) && output.entities.length > 0) {
    sections.push(`## Entidades de Dados (DER)\n\n${output.entities.map((e: string) => `- \`${e}\``).join("\n")}\n`);
  }

  if (Array.isArray(output.relationships) && output.relationships.length > 0) {
    sections.push(`## Relacionamentos de Dados\n\n${output.relationships.map((r: string) => `- ${r}`).join("\n")}\n`);
  }

  if (output.ddl) {
    sections.push(`## Scripts DDL (PostgreSQL & TimescaleDB)\n\n\`\`\`sql\n${output.ddl}\n\`\`\`\n`);
  }

  if (Array.isArray(output.retentionPolicy) && output.retentionPolicy.length > 0) {
    sections.push(`## Políticas de Retenção & Expurgo (LGPD)\n\n${output.retentionPolicy.map((rp: string) => `- ⏱️ ${rp}`).join("\n")}\n`);
  }

  // DevOps
  if (output.deploymentTopology) {
    sections.push(`## Topologia de Deployment (Kubernetes / Nuvem)\n\n${output.deploymentTopology}\n`);
  }

  if (Array.isArray(output.slos) && output.slos.length > 0) {
    sections.push(`## Objetivos de Nível de Serviço (SLOs)\n\n${output.slos.map((s: string) => `- 📈 **${s}**`).join("\n")}\n`);
  }

  if (Array.isArray(output.slis) && output.slis.length > 0) {
    sections.push(`## Indicadores de Nível de Serviço (SLIs / Prometheus)\n\n${output.slis.map((s: string) => `- \`${s}\``).join("\n")}\n`);
  }

  if (output.observabilitySpec) {
    sections.push(`## Especificação de Observabilidade (OpenTelemetry)\n\n${output.observabilitySpec}\n`);
  }

  if (Array.isArray(output.runbookHints) && output.runbookHints.length > 0) {
    sections.push(`## Guias Operacionais (Runbooks)\n\n${output.runbookHints.map((r: string) => `- 🛠️ ${r}`).join("\n")}\n`);
  }

  // Security
  if (Array.isArray(output.threats) && output.threats.length > 0) {
    sections.push(`## Modelagem de Ameaças (STRIDE)\n\n| ID | Categoria | Título | Severidade | Mitigação |\n|---|---|---|---|---|\n${output.threats.map((t: any) => `| ${t.id || "-"} | **${t.strideCategory || "-"}** | ${t.title || "-"} | \`${t.severity || "-"}\` | ${t.mitigation || "-"} |`).join("\n")}\n`);
  }

  if (output.sbom_hash) {
    sections.push(`## Integridade de Supply Chain\n\n- **SBOM Hash**: \`${output.sbom_hash}\`\n- **Open Secrets Check**: \`${output.open_secrets_check || "passed"}\`\n- **Decisão**: **${output.decision || "approved"}**\n`);
  }

  // Compliance
  if (Array.isArray(output.applicableFrameworks) && output.applicableFrameworks.length > 0) {
    sections.push(`## Marcos Regulatórios Aplicáveis\n\n${output.applicableFrameworks.map((f: string) => `- ⚖️ **${f}**`).join("\n")}\n`);
  }

  if (Array.isArray(output.legalBases) && output.legalBases.length > 0) {
    sections.push(`## Enquadramento de Bases Legais (LGPD)\n\n${output.legalBases.map((b: any) => `- **${b.purpose || "Finalidade"}**: ${b.basis || ""} (${b.lgpdArticle || ""})\n  *Justificativa*: ${b.rationale || ""}`).join("\n\n")}\n`);
  }

  if (Array.isArray(output.dataSubjectRights) && output.dataSubjectRights.length > 0) {
    sections.push(`## Direitos dos Titulares (DSR)\n\n| Direito | Como Atendido | SLA Legal |\n|---|---|---|\n${output.dataSubjectRights.map((d: any) => `| **${d.right}** | ${d.howSupportedInProduct} | \`${d.sla}\` |`).join("\n")}\n`);
  }

  if (output.dpiaSummary) {
    sections.push(`## Relatório de Impacto à Proteção de Dados (DPIA)\n\n${output.dpiaSummary}\n`);
  }

  // QA
  if (Array.isArray(output.test_cases) && output.test_cases.length > 0) {
    sections.push(`## Casos de Teste BDD (Given / When / Then)\n\n${output.test_cases.map((tc: any) => `### [${tc.id}] ${tc.title} (${tc.ac_ref || "AC"})\n- **Given**: ${tc.given}\n- **When**: ${tc.when}\n- **Then**: ${tc.then}\n- *Arquivo de Teste*: \`${tc.test_path || "tests/spec.test.ts"}\``).join("\n\n")}\n`);
  }

  if (output.coverage_by_ac && typeof output.coverage_by_ac === "object") {
    sections.push(`## Cobertura de Critérios de Aceitação\n\n${Object.entries(output.coverage_by_ac).map(([ac, count]) => `- **${ac}**: ${count} caso(s) de teste vinculado(s)`).join("\n")}\n`);
  }

  // TechLead
  if (Array.isArray(output.tasks) && output.tasks.length > 0) {
    sections.push(`## Decomposição de Tarefas (DAG)\n\n| ID | Tarefa | Responsável | Estimativa | Grupo Paralelo | Dependências |\n|---|---|---|---|---|---|\n${output.tasks.map((t: any) => `| \`${t.id || "TASK"}\` | **${t.title || "-"}** | ${t.role || "-"} | ${t.estimate_hours ? t.estimate_hours + "h" : "-"} | \`${t.parallel_group || "-"}\` | ${Array.isArray(t.deps) && t.deps.length > 0 ? t.deps.join(", ") : "Nenhuma"} |`).join("\n")}\n`);
  }

  if (Array.isArray(output.critical_path) && output.critical_path.length > 0) {
    sections.push(`## Caminho Crítico (Critical Path)\n\n\`${output.critical_path.join(" ➔ ")}\`\n\n- **Estimativa Total**: **${output.total_estimate_hours || 0} horas** de engenharia.\n`);
  }

  // Auditor
  if (output.gateTarget) {
    sections.push(`## Auditoria de Gate HITL\n\n- **Gate Avaliado**: \`${output.gateTarget}\`\n- **Status de Prontidão**: **${output.readyForGate ? "✅ APROVADO PARA AVANÇO" : "❌ BLOQUEADO POR INCONSISTÊNCIAS"}**\n- **Resumo de Controles**: ${output.controlsAuditSummary || "N/A"}\n`);
  }

  if (output.consistencyMatrix && typeof output.consistencyMatrix === "object") {
    sections.push(`## Matriz de Coerência Inter-Artefatos\n\n${Object.entries(output.consistencyMatrix).map(([check, status]) => `- **${check}**: ${typeof status === "object" ? JSON.stringify(status) : status}`).join("\n")}\n`);
  }

  if (Array.isArray(output.open_questions) && output.open_questions.length > 0) {
    sections.push(`## Questões em Aberto\n\n${output.open_questions.map((q: string) => `- ❓ ${q}`).join("\n")}\n`);
  }

  return sections.join("\n");
}
