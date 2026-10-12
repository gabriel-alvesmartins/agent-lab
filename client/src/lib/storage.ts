import { SavedScenario, SavedAgentVersion } from "../types.js";

const STORAGE_KEY = "sdlc_agent_lab_scenarios_v1";
const VERSIONS_STORAGE_KEY = "sdlc_agent_lab_versions_v1";

/**
 * Dedução heurística do agente a partir da forma dos campos de entrada (input),
 * útil caso um cenário tenha sido gravado sob SolutionArchitect indevidamente.
 */
export function inferAgentFromInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return null;

  if (keys.includes("personas") || keys.includes("jobsToBeDone")) return "RiskElicitor";
  if (keys.includes("riskInventory")) return "TierClassifier";
  if (keys.includes("owners")) return "PM";
  if (keys.includes("figmaEnabled") || keys.includes("uxFlowsSummary")) return "UI";
  if (keys.includes("focusAreas")) return "UX";
  if (keys.includes("persistenceType")) return "DataArchitect";
  if (keys.includes("targetEnvs")) return "DevOps";
  if (keys.includes("applicableFrameworks") || keys.includes("threatModelSummary")) return "Compliance";
  if (keys.includes("acListFromSpec")) return "QA";
  if (keys.includes("gateTarget") || keys.includes("artifactPaths")) return "Auditor";
  if (keys.includes("softwareArchSummary") || keys.includes("architecturePlan")) return "TechLead";
  if (keys.includes("brief") && !keys.includes("specBody") && !keys.includes("discoveryReport")) return "Discovery";
  if (keys.includes("archMode") || keys.includes("qualityDrivers")) return "SolutionArchitect";
  return null;
}

export function loadSavedScenarios(agentId?: string): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    let parsed: SavedScenario[] = JSON.parse(raw);
    let hasChanges = false;

    parsed = parsed.map((s) => {
      let targetAgentId = s.agentId;

      // Se o agente registrado é SolutionArchitect, mas a entrada claramente pertence a outro agente
      if (s.agentId === "SolutionArchitect" && s.input) {
        const inferred = inferAgentFromInput(s.input);
        if (inferred && inferred !== "SolutionArchitect") {
          targetAgentId = inferred;
          hasChanges = true;
        }
      }

      let updatedTitle = s.title;

      // Se o título contiver o padrão mockado "SolutionArchitect - Cenário Customizado"
      // ou se o título contiver "SolutionArchitect" mas pertencer a outro agente:
      if (
        updatedTitle === "SolutionArchitect - Cenário Customizado" ||
        updatedTitle.includes("SolutionArchitect - Cenário Customizado")
      ) {
        updatedTitle = updatedTitle.replace(
          "SolutionArchitect - Cenário Customizado",
          `${targetAgentId} - Cenário Customizado`
        );
      } else if (
        targetAgentId !== "SolutionArchitect" &&
        updatedTitle.startsWith("SolutionArchitect")
      ) {
        updatedTitle = updatedTitle.replace(/^SolutionArchitect/, targetAgentId);
      }

      if (updatedTitle !== s.title || targetAgentId !== s.agentId) {
        hasChanges = true;
        return {
          ...s,
          agentId: targetAgentId,
          title: updatedTitle,
        };
      }

      return s;
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

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
  const title = scenario.title?.trim() || `${scenario.agentId} - Cenário Customizado`;
  const newScenario: SavedScenario = {
    ...scenario,
    title,
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


