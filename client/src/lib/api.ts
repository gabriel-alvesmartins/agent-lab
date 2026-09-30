import {
  AgentCharacteristicsConfig,
  AgentDetail,
  AgentExecutionResult,
  AgentSummary,
  ModelProvidersResponse,
  ABExecutionResult,
  ExperimentRecord,
} from "../types.js";

const BASE_URL = "http://localhost:3333/api";

export async function fetchAgents(): Promise<AgentSummary[]> {
  const res = await fetch(`${BASE_URL}/agents`);
  if (!res.ok) throw new Error("Falha ao buscar lista de agentes");
  const data = await res.json();
  return data.agents;
}

export async function fetchAgentDetails(agentId: string): Promise<AgentDetail> {
  const res = await fetch(`${BASE_URL}/agents/${agentId}`);
  if (!res.ok) throw new Error(`Falha ao buscar dados do agente ${agentId}`);
  const data = await res.json();
  return data.agent;
}

export async function fetchAgentSchemas(
  agentId: string
): Promise<{ inputSchemaJson: any; outputSchemaJson: any }> {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/schemas`);
  if (!res.ok) throw new Error(`Falha ao buscar schemas do agente ${agentId}`);
  return res.json();
}

export async function validateAgentInput(
  agentId: string,
  input: unknown
): Promise<{ valid: boolean; errors?: Array<{ path: string; message: string }> }> {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export interface RunAgentABOptions {
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

export async function runAgent(
  agentId: string,
  input: unknown,
  mode: "fallback" | "llm" = "fallback",
  modelOverride?: string,
  agentConfig?: AgentCharacteristicsConfig,
  customOutputSchemaJson?: unknown,
  customInputSchemaJson?: unknown
): Promise<AgentExecutionResult> {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input,
      mode,
      modelOverride,
      agentConfig,
      customOutputSchemaJson,
      customInputSchemaJson,
    }),
  });
  return res.json();
}

export async function runAgentAB(
  agentId: string,
  optionsOrInput: RunAgentABOptions | unknown,
  mode: "fallback" | "llm" = "llm",
  modelOverride?: string,
  customConfig?: AgentCharacteristicsConfig,
  customOutputSchemaJson?: unknown
): Promise<ABExecutionResult> {
  const isOptionsObject =
    optionsOrInput &&
    typeof optionsOrInput === "object" &&
    "input" in optionsOrInput &&
    ("versionAName" in optionsOrInput ||
      "configA" in optionsOrInput ||
      "configB" in optionsOrInput ||
      "versionBName" in optionsOrInput);

  const body = isOptionsObject
    ? optionsOrInput
    : {
        input: optionsOrInput,
        mode,
        modelOverride,
        customConfig,
        customOutputSchemaJson,
      };

  const res = await fetch(`${BASE_URL}/agents/${agentId}/run-ab`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha na execução comparativa A/B");
  }
  return res.json();
}

export async function fetchExperiments(agentId?: string): Promise<ExperimentRecord[]> {
  const url = agentId
    ? `${BASE_URL}/experiments?agentId=${encodeURIComponent(agentId)}`
    : `${BASE_URL}/experiments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao buscar histórico de experimentos");
  const data = await res.json();
  return data.experiments || [];
}

export async function deleteExperiment(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/experiments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data.success);
}

export async function updateExperiment(
  id: string,
  patch: { title?: string; notes?: string }
): Promise<ExperimentRecord> {
  const res = await fetch(`${BASE_URL}/experiments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  return data.experiment;
}

export async function fetchModelProviders(): Promise<ModelProvidersResponse> {
  const res = await fetch(`${BASE_URL}/models`);
  if (!res.ok) throw new Error("Falha ao buscar provedores de modelos");
  return res.json();
}
