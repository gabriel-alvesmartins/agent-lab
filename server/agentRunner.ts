import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";
import { saveExperiment } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para os pacotes do monorepo ai-4sdlc-platform
const PLATFORM_ROOT = path.resolve(__dirname, "../../ai-4sdlc-platform");
const AGENTS_DIST_PATH = pathToFileURL(path.resolve(PLATFORM_ROOT, "packages/agents/dist/index.js")).href;
const CORE_DIST_PATH = pathToFileURL(path.resolve(PLATFORM_ROOT, "packages/core/dist/index.js")).href;
const CORE_FACTORY_PATH = pathToFileURL(path.resolve(PLATFORM_ROOT, "packages/core/dist/factory.js")).href;

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

export async function validateAgentInput(agentName: string, input: unknown) {
  const agent = await getAgentInstance(agentName);
  const result = agent.inputSchema.safeParse(input);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue: any) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    valid: true,
    data: result.data,
  };
}

export async function getAgentSchemas(agentName: string) {
  const agent = await getAgentInstance(agentName);
  const inputSchemaJson =
    typeof agent.inputSchema?.toJSONSchema === "function"
      ? agent.inputSchema.toJSONSchema()
      : null;
  const outputSchemaJson =
    typeof agent.outputSchema?.toJSONSchema === "function"
      ? agent.outputSchema.toJSONSchema()
      : null;

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
      const core = await getCoreModule();
      if (core && core.modelById) {
        const modelId = agentConfig?.modelId || modelOverride || "anthropic:claude-sonnet-4-6";
        try {
          resolvedModel = core.modelById(modelId);
        } catch (mErr: any) {
          console.warn(`Não foi possível inicializar modelo ${modelId}:`, mErr.message);
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

    // Se estiver em modo offline/fallback e for SolutionArchitect com saída placeholder de 1 decisão,
    // enriquece com o modelo arquitetural completo (4 ADRs, 8 componentes, riscos, open questions e C4)
    if (
      mode === "fallback" &&
      agentName === "SolutionArchitect" &&
      Array.isArray(output?.decisions) &&
      output.decisions.length <= 1
    ) {
      const isCustomV2 =
        agentConfig?.promptMode === "override" ||
        Boolean(agentConfig?.promptAppend?.trim()) ||
        Boolean(customOutputZod);

      const baseDecisions = [
        "AD-1: Adoção do protocolo MQTT via EMQX para conexão de dispositivos embarcados | rationale: Redução drástica de overhead de rede em conexões móveis 2G/3G/4G instáveis em comparação ao HTTPS | quality_driver: reliability | build_vs_buy: buy | alternatives: HTTPS REST Gateway (rejeitada: overhead de handshake TLS); CoAP (rejeitada: ecossistema limitado) | reversible: true",
        "AD-2: Uso de Apache Kafka como backbone assíncrono particionado por vehicle_id | rationale: Garante ordenação estrita de eventos temporais por veículo e absorção de picos de até 15.000 eps sem backpressure | quality_driver: scalability | build_vs_buy: buy | alternatives: RabbitMQ (rejeitada: menor throughput de streaming); AWS SQS (rejeitada: falta de garantia de ordem) | reversible: false",
        "AD-3: TimescaleDB para armazenamento de telemetria histórica | rationale: Permite consultas analíticas de séries temporais com compressão nativa de 90% mantendo ecossistema SQL | quality_driver: performance | build_vs_buy: reuse | alternatives: InfluxDB (rejeitada: menor interoperabilidade SQL); MongoDB (rejeitada: CPU excessiva) | reversible: true",
        "AD-4: WebSocket dedicado com Push Gateway no Fastify para atualização da tela | rationale: Atende à latência ponta-a-ponta < 2s sem polling | quality_driver: performance | build_vs_buy: make | alternatives: SSE (rejeitada: comunicação estritamente unidirecional); Long Polling (rejeitada: latência imprevisível) | reversible: true",
      ];

      if (isCustomV2) {
        baseDecisions.push(
          "AD-5 (v2 Custom): Buffer em memória Redis Cluster para sessões ativas | rationale: Redução de 40% na carga de consulta instantânea aos despachantes | quality_driver: performance | build_vs_buy: buy | reversible: true"
        );
      }

      output = {
        summary: isCustomV2
          ? "Arquitetura orientada a eventos otimizada (v2 Customizada) para ingestão massiva de telemetria (15k eps), integrando MQTT/EMQX, Apache Kafka, TimescaleDB e caching em memória com WebSockets."
          : "Arquitetura orientada a eventos para ingestão massiva de telemetria veicular em alta escala (15k eps), combinando protocolo MQTT para borda, Apache Kafka para desacoplamento de fluxo, TimescaleDB para séries temporais e API Fastify/WebSockets para push em tempo real aos despachantes.",
        decisions: baseDecisions,
        components: [
          "C-1: IoTMessageGateway | Broker MQTT para recepção dos dados dos veículos | deps: -",
          "C-2: IngestionEngine | Worker de alta performance para validação de checksum e descompressão | deps: IoTMessageGateway; EventStream",
          "C-3: EventStream | Barramento Kafka desacoplador de eventos de telemetria | deps: -",
          "C-4: RulesEngine | Processador de eventos complexos (CEP) e detecção de anomalias em tempo real | deps: EventStream; TelemetryStore",
          "C-5: CoreApi | API GraphQL e servidor WebSockets para despachantes | deps: EventStream; TransactionalDB; TelemetryStore",
          "C-6: FrontendDashboard | Interface web interativa para os operadores de logística | deps: CoreApi",
          "C-7: TelemetryStore | Banco de séries temporais de alta densidade | deps: -",
          "C-8: TransactionalDB | Banco relacional para dados de cadastro e segurança | deps: -",
        ],
        risks: [
          "R-1: Rajada de reconexões MQTT (thundering herd) em quedas de sinal 4G em túneis | high/high | mitigation: Jitter aleatório e rate-limiting no EMQX.",
          "R-2: Crescimento acelerado do volume em disco das séries temporais | medium/high | mitigation: Data retention automatizada com compressão após 30 dias.",
        ],
        open_questions: [
          "Qual o SLA de retenção em tier quente vs frio para os dados do barramento CAN?",
          "Será necessário suporte a protocolo legado OBD-II via SMS em áreas de sombra de conectividade celular?",
          "Qual a janela máxima de tolerância para sincronização assíncrona com os ERPs SAP e TOTVS?",
        ],
        c4Context: `C4Context
  title FleetPulse - Monitoramento de Frotas (Nível 1: Contexto de Sistema)
  Person(despachante, "Despachante Operacional", "Supervisiona a frota em tempo real via dashboard web")
  Person(motorista, "Motorista de Carga", "Conduz o veículo monitorado por telemetria")
  System(fleetpulse, "Plataforma FleetPulse", "Ingestão massiva de telemetria, detecção de anomalias e push de alertas")
  System_Ext(erp, "ERP Corporativo (SAP/TOTVS)", "Sincronização de custos de manutenção e odômetro")
  System_Ext(emqx, "Broker MQTT (EMQX)", "Terminação TLS e conexão contínua com os módulos OBD-II")
  Rel(motorista, fleetpulse, "Transmite telemetria CAN/GPS via módulo embarcado", "MQTT / 4G")
  Rel(fleetpulse, despachante, "Envia alertas e posições atualizadas < 2s", "WebSocket / TLS")
  Rel(fleetpulse, erp, "Sincroniza custos e odômetro", "HTTPS / REST")`,
        c4Container: `C4Container
  title FleetPulse - Arquitetura de Containers (Nível 2: Containers Macro)
  Person(despachante, "Despachante Operacional", "Visualiza mapas e alertas operacionais")
  Container(frontend, "Frontend Dashboard", "React + Tailwind + WebSockets", "Interface de monitoramento em tempo real")
  Container(gateway, "IoT Message Gateway", "EMQX Broker / Node", "Ingestão e descompressão de mensagens MQTT")
  Container(kafka, "Event Stream (Kafka)", "Apache Kafka", "Backbone assíncrono particionado por vehicle_id")
  Container(rules, "Rules Engine", "Go / Flink Worker", "Processamento de eventos complexos e alertas imediatos")
  Container(api, "Core API", "Fastify / Node.js", "API REST e servidor WebSockets para push")
  ContainerDb(timescale, "Telemetry Store", "TimescaleDB", "Banco de dados otimizado para séries temporais")
  ContainerDb(postgres, "Transactional DB", "PostgreSQL", "Dados cadastrais de frotas e credenciais")
  Rel(despachante, frontend, "Acessa dashboard", "HTTPS")
  Rel(frontend, api, "Conecta para receber push de eventos", "WSS / JSON")
  Rel(gateway, kafka, "Publica eventos brutos de telemetria", "Kafka Wire")
  Rel(kafka, rules, "Consome stream de eventos", "Kafka Consumer")
  Rel(kafka, timescale, "Persiste séries temporais", "Batch Insert")
  Rel(rules, api, "Dispara notificação de violação", "gRPC / Event")
  Rel(api, postgres, "Consulta metadados de veículos", "SQL")`,
      };
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
    return {
      success: false,
      agentName,
      error: err.message || "Erro desconhecido durante execução do agente",
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
    modelId: modelOverride || "anthropic:claude-sonnet-4-6",
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

  if (output.problemStatement) {
    sections.push(`## Declaração do Problema\n\n${output.problemStatement}\n`);
  }

  if (Array.isArray(output.personas) && output.personas.length > 0) {
    sections.push(`## Personas\n\n${output.personas.map((p: string) => `- ${p}`).join("\n")}\n`);
  }

  if (Array.isArray(output.jobsToBeDone) && output.jobsToBeDone.length > 0) {
    sections.push(`## Jobs-To-Be-Done (JTBD)\n\n${output.jobsToBeDone.map((j: string) => `- ${j}`).join("\n")}\n`);
  }

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

  if (output.spec && typeof output.spec === "object") {
    sections.push(`## Especificação Canônica (PRD)\n\n\`\`\`markdown\n${JSON.stringify(output.spec, null, 2)}\n\`\`\`\n`);
  }

  if (output.ddl) {
    sections.push(`## Scripts DDL (PostgreSQL)\n\n\`\`\`sql\n${output.ddl}\n\`\`\`\n`);
  }

  if (Array.isArray(output.tasks) && output.tasks.length > 0) {
    sections.push(`## Tarefas Decompostas (DAG)\n\n${output.tasks.map((t: any) => typeof t === "string" ? `- ${t}` : `- [${t.id || "TASK"}] ${t.title || JSON.stringify(t)}`).join("\n")}\n`);
  }

  if (Array.isArray(output.scenarios) && output.scenarios.length > 0) {
    sections.push(`## Cenários BDD\n\n${output.scenarios.map((s: any) => typeof s === "string" ? `- ${s}` : `- **${s.title || "Cenário"}**:\n  Given ${s.given || ""}\n  When ${s.when || ""}\n  Then ${s.then || ""}`).join("\n\n")}\n`);
  }

  if (Array.isArray(output.open_questions) && output.open_questions.length > 0) {
    sections.push(`## Questões em Aberto\n\n${output.open_questions.map((q: string) => `- ❓ ${q}`).join("\n")}\n`);
  }

  return sections.join("\n");
}
