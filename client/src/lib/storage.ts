import { SavedScenario, SavedAgentVersion } from "../types.js";

const STORAGE_KEY = "sdlc_agent_lab_scenarios_v1";
const VERSIONS_STORAGE_KEY = "sdlc_agent_lab_versions_v1";

export function loadSavedScenarios(agentId?: string): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SavedScenario[] = JSON.parse(raw);
    if (agentId) {
      return parsed.filter((s) => s.agentId === agentId);
    }
    return parsed;
  } catch (err) {
    console.error("Falha ao carregar cenários do localStorage:", err);
    return [];
  }
}

export function saveScenario(scenario: Omit<SavedScenario, "id" | "createdAt">): SavedScenario {
  const existing = loadSavedScenarios();
  const newScenario: SavedScenario = {
    ...scenario,
    id: `scn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newScenario, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Falha ao salvar cenário no localStorage:", err);
  }
  return newScenario;
}

export function deleteScenario(id: string): void {
  const existing = loadSavedScenarios();
  const updated = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Falha ao remover cenário do localStorage:", err);
  }
}

export function loadSavedAgentVersions(agentId?: string): SavedAgentVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: SavedAgentVersion[] = JSON.parse(raw);
    if (agentId) {
      return parsed.filter((v) => v.agentId === agentId);
    }
    return parsed;
  } catch (err) {
    console.error("Falha ao carregar versões do agente do localStorage:", err);
    return [];
  }
}

export function saveAgentVersion(
  version: Omit<SavedAgentVersion, "id" | "createdAt">
): SavedAgentVersion {
  const existing = loadSavedAgentVersions();
  const newVersion: SavedAgentVersion = {
    ...version,
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newVersion, ...existing];
  try {
    localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Falha ao salvar versão do agente no localStorage:", err);
  }
  return newVersion;
}

export function updateScenario(id: string, updates: Partial<SavedScenario>): SavedScenario | null {
  const existing = loadSavedScenarios();
  const index = existing.findIndex((s) => s.id === id);
  if (index === -1) return null;
  existing[index] = {
    ...existing[index],
    ...updates,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Falha ao atualizar cenário no localStorage:", err);
  }
  return existing[index];
}

export function deleteAgentVersion(id: string): void {
  const existing = loadSavedAgentVersions();
  const updated = existing.filter((v) => v.id !== id);
  try {
    localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Falha ao remover versão do agente no localStorage:", err);
  }
}

export function updateAgentVersion(
  id: string,
  updates: Partial<SavedAgentVersion>
): SavedAgentVersion | null {
  const existing = loadSavedAgentVersions();
  const index = existing.findIndex((v) => v.id === id);
  if (index === -1) return null;
  existing[index] = {
    ...existing[index],
    ...updates,
  };
  try {
    localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Falha ao atualizar versão do agente no localStorage:", err);
  }
  return existing[index];
}


