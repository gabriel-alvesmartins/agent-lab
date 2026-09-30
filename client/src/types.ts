export interface AgentSummary {
  id: string;
  name: string;
  phase: number;
  phaseName: string;
  category: string;
  description: string;
  role: string;
  icon: string;
  badgeColor: string;
  readsFromCount: number;
  producesArtifact: string;
  presetsCount: number;
  version?: string;
}

export interface AgentDetail {
  id: string;
  name: string;
  version?: string;
  phase: number;
  phaseName: string;
  category: string;
  description: string;
  role: string;
  icon: string;
  badgeColor: string;
  canonicalPrompt?: string;
  inputSchemaJson?: any;
  outputSchemaJson?: any;
  toolNames?: string[];
  modes?: string[];
  readsFrom: Array<{
    source: string;
    agent: string;
    description: string;
    required: boolean;
  }>;
  produces: {
    artifact: string;
    title: string;
    description: string;
    consumers: string[];
  };
  inputSchemaFields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  presets: Array<{
    id: string;
    title: string;
    description: string;
    input: Record<string, unknown>;
    expectedOutput?: Record<string, unknown>;
  }>;
}

export interface AgentCharacteristicsConfig {
  promptMode: "canonical" | "append" | "override";
  promptAppend?: string;
  promptOverride: string;
  outputSchemaMode?: "canonical" | "override";
  outputSchemaOverride?: string;
  inputSchemaMode?: "canonical" | "override";
  inputSchemaOverride?: string;
  mode: "standard" | "thorough" | "fast";
  riskTier: "minimal" | "limited" | "high" | "high_risk";
  temperature: number;
  effort: "low" | "medium" | "high";
  enabledTools: string[];
}

export interface SavedAgentVersion {
  id: string;
  agentId: string;
  name: string;
  description?: string;
  createdAt: string;
  config: AgentCharacteristicsConfig;
}

export interface AgentExecutionResult {
  success: boolean;
  agentName: string;
  modeUsed?: "fallback" | "llm";
  elapsedMs?: number;
  output?: any;
  outputValid?: boolean;
  outputValidationErrors?: any[];
  auditEvents?: Array<{
    type: string;
    payload?: any;
    timestamp: string;
  }>;
  markdownRepresentation?: string;
  error?: string;
  validationErrors?: Array<{
    path: string;
    message: string;
  }>;
  appliedConfig?: {
    promptMode: string;
    mode: string;
    riskTier: string;
    temperature?: number;
    effort?: string;
    toolsCount?: number;
    promptLength?: number;
    promptPreview?: string;
    customOutputSchemaActive?: boolean;
    customInputSchemaActive?: boolean;
  };
}

export interface ABExecutionResult {
  success: boolean;
  agentName: string;
  experimentId?: string;
  versionAName?: string;
  versionBName?: string;
  canonicalResult: AgentExecutionResult;
  customResult: AgentExecutionResult;
  diffSummary?: {
    totalLinesA: number;
    totalLinesB: number;
    diffLinesCount: number;
    structuralDiff?: {
      addedKeys: string[];
      removedKeys: string[];
      commonKeys: string[];
    };
  };
}

export interface ExperimentRecord {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  modelId: string;
  mode: "llm" | "fallback";
  input: unknown;
  versionAName?: string;
  versionBName?: string;
  canonicalConfig: {
    prompt: string;
    outputSchemaJson?: unknown;
    inputSchemaJson?: unknown;
  };
  customConfig: {
    promptMode: "canonical" | "append" | "override";
    promptAppend?: string;
    promptOverride?: string;
    outputSchemaJson?: unknown;
    inputSchemaJson?: unknown;
    mode?: string;
    riskTier?: string;
    temperature?: number;
    effort?: "low" | "medium" | "high";
  };
  canonicalResult: {
    success: boolean;
    output: unknown;
    elapsedMs: number;
    outputValid?: boolean;
    outputValidationErrors?: unknown[];
    markdown?: string;
    error?: string;
  };
  customResult: {
    success: boolean;
    output: unknown;
    elapsedMs: number;
    outputValid?: boolean;
    outputValidationErrors?: unknown[];
    markdown?: string;
    error?: string;
  };
  diffSummary?: {
    totalLinesA: number;
    totalLinesB: number;
    diffLinesCount: number;
    structuralDiff?: {
      addedKeys: string[];
      removedKeys: string[];
      commonKeys: string[];
    };
  };
  notes?: string;
}

export interface SavedScenario {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  agentConfig?: AgentCharacteristicsConfig;
}

export interface ModelProvidersResponse {
  providers: Record<
    string,
    {
      name: string;
      available: boolean;
      models: string[];
      default: string;
    }
  >;
}
