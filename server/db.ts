import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "data");
const EXPERIMENTS_FILE = path.resolve(DATA_DIR, "experiments.json");

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
  };
  customConfig: {
    promptMode: "canonical" | "append" | "override";
    promptAppend?: string;
    promptOverride?: string;
    outputSchemaJson?: unknown;
    mode?: string;
    riskTier?: string;
    temperature?: number;
    effort?: string;
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

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXPERIMENTS_FILE)) {
    fs.writeFileSync(EXPERIMENTS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export function listExperiments(agentId?: string): ExperimentRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(EXPERIMENTS_FILE, "utf8");
    const list: ExperimentRecord[] = JSON.parse(raw);
    if (agentId) {
      return list.filter((exp) => exp.agentId === agentId);
    }
    return list;
  } catch (err) {
    console.error("Erro ao ler experimentos de experiments.json:", err);
    return [];
  }
}

export function getExperiment(id: string): ExperimentRecord | null {
  const all = listExperiments();
  return all.find((exp) => exp.id === id) || null;
}

export function saveExperiment(
  data: Omit<ExperimentRecord, "id" | "createdAt">,
): ExperimentRecord {
  ensureStorage();
  const all = listExperiments();
  const newRecord: ExperimentRecord = {
    ...data,
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newRecord); // Mais recentes primeiro

  // Salva no arquivo com escrita atômica
  const tmpFile = `${EXPERIMENTS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(all, null, 2), "utf8");
  fs.renameSync(tmpFile, EXPERIMENTS_FILE);

  return newRecord;
}

export function updateExperiment(
  id: string,
  patch: Partial<Pick<ExperimentRecord, "title" | "notes">>,
): ExperimentRecord | null {
  ensureStorage();
  const all = listExperiments();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  all[idx] = {
    ...all[idx],
    ...patch,
  };

  const tmpFile = `${EXPERIMENTS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(all, null, 2), "utf8");
  fs.renameSync(tmpFile, EXPERIMENTS_FILE);

  return all[idx];
}

export function deleteExperiment(id: string): boolean {
  ensureStorage();
  const all = listExperiments();
  const filtered = all.filter((exp) => exp.id !== id);
  if (filtered.length === all.length) return false;

  const tmpFile = `${EXPERIMENTS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(filtered, null, 2), "utf8");
  fs.renameSync(tmpFile, EXPERIMENTS_FILE);

  return true;
}
