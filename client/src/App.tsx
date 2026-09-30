import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header.js";
import { AgentSidebar } from "./components/AgentSidebar.js";
import { AgentSpecBanner } from "./components/AgentSpecBanner.js";
import { InputEditor } from "./components/InputEditor.js";
import { OutputViewer } from "./components/OutputViewer.js";
import { ScenarioModal } from "./components/ScenarioModal.js";
import {
  AgentSummary,
  AgentDetail,
  AgentExecutionResult,
  AgentCharacteristicsConfig,
  SavedScenario,
  ModelProvidersResponse,
  ABExecutionResult,
  ExperimentRecord,
  SavedAgentVersion,
} from "./types.js";
import {
  fetchAgents,
  fetchAgentDetails,
  validateAgentInput,
  runAgent,
  runAgentAB,
  fetchModelProviders,
} from "./lib/api.js";
import {
  loadSavedScenarios,
  saveScenario,
  deleteScenario,
  loadSavedAgentVersions,
} from "./lib/storage.js";
import { ExperimentsHistoryDrawer } from "./components/ExperimentsHistoryDrawer.js";
import { AgentConfigSheet } from "./components/AgentConfigSheet.js";
import { SavedAssetsDrawer } from "./components/SavedAssetsDrawer.js";

const DEFAULT_CONFIG: AgentCharacteristicsConfig = {
  promptMode: "canonical",
  promptAppend: "",
  promptOverride: "",
  mode: "standard",
  riskTier: "limited",
  temperature: 0.2,
  effort: "medium",
  enabledTools: [],
};

export function App() {
  const pendingCustomConfigRef = useRef<AgentCharacteristicsConfig | null>(null);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("SolutionArchitect");
  const [currentAgent, setCurrentAgent] = useState<AgentDetail | null>(null);

  // Estados de entrada, configuração de características e saída
  const [inputJson, setInputJson] = useState<string>("");
  const [expectedJson, setExpectedJson] = useState<string>("");
  const [agentConfig, setAgentConfig] = useState<AgentCharacteristicsConfig>(DEFAULT_CONFIG);
  const [executionResult, setExecutionResult] = useState<AgentExecutionResult | null>(null);
  const [abResult, setAbResult] = useState<ABExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isRunningAB, setIsRunningAB] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [configInitialTab, setConfigInitialTab] = useState<"prompt" | "output_schema" | "input_schema" | "inference">("prompt");
  const [configInitialSaveVersion, setConfigInitialSaveVersion] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [libraryInitialTab, setLibraryInitialTab] = useState<"agents" | "presets">("agents");
  const [isCreateAgentModalOpen, setIsCreateAgentModalOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    errors?: Array<{ path: string; message: string }>;
  } | null>(null);

  // Estados de configuração de modelo e modo
  const [mode, setMode] = useState<"fallback" | "llm">("fallback");
  const [selectedModel, setSelectedModel] = useState<string>("anthropic:claude-sonnet-4-6");
  const [modelProviders, setModelProviders] = useState<ModelProvidersResponse | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Cenários salvos locais e versões salvas de agentes
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [savedAgentVersions, setSavedAgentVersions] = useState<SavedAgentVersion[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // 1. Carrega lista inicial de agentes e provedores
  useEffect(() => {
    fetchAgents()
      .then((data) => {
        setAgents(data);
        setServerOnline(true);
      })
      .catch((err) => {
        console.error("Erro ao conectar no servidor:", err);
        setServerOnline(false);
      });

    fetchModelProviders()
      .then((data) => setModelProviders(data))
      .catch((err) => console.warn("Model providers indisponíveis:", err));
  }, []);

  // 2. Carrega detalhes do agente selecionado
  useEffect(() => {
    if (!selectedAgentId) return;

    fetchAgentDetails(selectedAgentId)
      .then((agent) => {
        setCurrentAgent(agent);
        // Carrega o primeiro preset por padrão
        if (agent.presets && agent.presets.length > 0) {
          const first = agent.presets[0];
          setInputJson(JSON.stringify(first.input, null, 2));
          setExpectedJson(first.expectedOutput ? JSON.stringify(first.expectedOutput, null, 2) : "");
        } else {
          setInputJson("{\n  \n}");
          setExpectedJson("");
        }

        // Configuração do agente (aplica customização pendente se houver, ou valores de fábrica)
        if (pendingCustomConfigRef.current) {
          setAgentConfig(pendingCustomConfigRef.current);
          pendingCustomConfigRef.current = null;
        } else {
          setAgentConfig({
            ...DEFAULT_CONFIG,
            enabledTools: agent.toolNames || [],
            promptOverride: agent.canonicalPrompt || "",
          });
        }

        // Reseta estados de resultado e validação
        setExecutionResult(null);
        setAbResult(null);
        setValidationStatus(null);

        // Carrega cenários salvos locais e versões do agente
        setSavedScenarios(loadSavedScenarios(selectedAgentId));
        setSavedAgentVersions(loadSavedAgentVersions(selectedAgentId));
      })
      .catch((err) => console.error("Erro ao carregar detalhes do agente:", err));
  }, [selectedAgentId]);

  // 3. Execução Isolada do Agente
  const handleRun = async () => {
    if (!selectedAgentId) return;
    setIsRunning(true);
    setExecutionResult(null);
    setAbResult(null);

    try {
      let parsedInput: unknown;
      try {
        parsedInput = JSON.parse(inputJson);
      } catch (err: any) {
        setIsRunning(false);
        setExecutionResult({
          success: false,
          agentName: selectedAgentId,
          error: `JSON malformado no editor de entrada: ${err.message}`,
        });
        return;
      }

      const res = await runAgent(
        selectedAgentId,
        parsedInput,
        mode,
        selectedModel,
        agentConfig,
        agentConfig.outputSchemaMode === "override" ? agentConfig.outputSchemaOverride : undefined,
        agentConfig.inputSchemaMode === "override" ? agentConfig.inputSchemaOverride : undefined
      );
      setExecutionResult(res);
      setServerOnline(true);
    } catch (err: any) {
      setExecutionResult({
        success: false,
        agentName: selectedAgentId,
        error: `Falha de conexão com o runner: ${err.message}`,
      });
      setServerOnline(false);
    } finally {
      setIsRunning(false);
    }
  };

  // 4. Execução do Teste A/B Flexível (Entre quaisquer duas versões)
  const handleRunAB = async (
    sideA?: { name: string; config?: AgentCharacteristicsConfig },
    sideB?: { name: string; config?: AgentCharacteristicsConfig }
  ) => {
    if (!selectedAgentId) return;
    setIsRunningAB(true);
    setAbResult(null);

    try {
      let parsedInput: unknown;
      try {
        parsedInput = JSON.parse(inputJson);
      } catch (err: any) {
        setIsRunningAB(false);
        setExecutionResult({
          success: false,
          agentName: selectedAgentId,
          error: `JSON malformado no editor de entrada: ${err.message}`,
        });
        return;
      }

      const versionAName = sideA?.name || "Original (Oficial SDLC)";
      const configA = sideA?.config;
      const versionBName = sideB?.name || "Configuração Atual (Personalizada)";
      const configB = sideB?.config || agentConfig;

      const res = await runAgentAB(selectedAgentId, {
        input: parsedInput,
        mode,
        modelOverride: selectedModel,
        versionAName,
        configA,
        customInputSchemaJsonA:
          configA?.inputSchemaMode === "override"
            ? configA.inputSchemaOverride
            : undefined,
        customOutputSchemaJsonA:
          configA?.outputSchemaMode === "override"
            ? configA.outputSchemaOverride
            : undefined,
        versionBName,
        configB,
        customInputSchemaJsonB:
          configB?.inputSchemaMode === "override"
            ? configB.inputSchemaOverride
            : undefined,
        customOutputSchemaJsonB:
          configB?.outputSchemaMode === "override"
            ? configB.outputSchemaOverride
            : undefined,
      });

      setAbResult(res);
      setExecutionResult(res.customResult);
      setServerOnline(true);
    } catch (err: any) {
      setExecutionResult({
        success: false,
        agentName: selectedAgentId,
        error: `Falha ao executar teste A/B: ${err.message}`,
      });
      setServerOnline(false);
    } finally {
      setIsRunningAB(false);
    }
  };

  // 5. Validação de Schema
  const handleValidate = async () => {
    if (!selectedAgentId) return;
    try {
      const parsedInput = JSON.parse(inputJson);
      const res = await validateAgentInput(selectedAgentId, parsedInput);
      setValidationStatus(res);
    } catch (err: any) {
      setValidationStatus({
        valid: false,
        errors: [{ path: "JSON", message: `Sintaxe inválida: ${err.message}` }],
      });
    }
  };

  // 5. Reset das Características
  const handleResetAgentConfig = () => {
    if (currentAgent) {
      setAgentConfig({
        ...DEFAULT_CONFIG,
        enabledTools: currentAgent.toolNames || [],
        promptOverride: currentAgent.canonicalPrompt || "",
      });
    }
  };

  const handleSelectAgentForWorkbench = (agentId: string, targetConfig: AgentCharacteristicsConfig) => {
    if (agentId !== selectedAgentId) {
      pendingCustomConfigRef.current = targetConfig;
      setSelectedAgentId(agentId);
    } else {
      setAgentConfig(targetConfig);
    }
    setIsConfigOpen(false);
  };

  // 6. Gestão de Cenários
  const handleSaveScenario = (title: string) => {
    try {
      const parsed = JSON.parse(inputJson);
      let parsedExpected = undefined;
      if (expectedJson.trim()) {
        try {
          parsedExpected = JSON.parse(expectedJson);
        } catch {
          // ignora
        }
      }

      saveScenario({
        agentId: selectedAgentId,
        title,
        input: parsed,
        expectedOutput: parsedExpected,
        agentConfig,
      });

      // Recarrega lista
      setSavedScenarios(loadSavedScenarios(selectedAgentId));
    } catch (err: any) {
      alert(`Não foi possível salvar o cenário: ${err.message}`);
    }
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setInputJson(JSON.stringify(scenario.input, null, 2));
    if (scenario.expectedOutput) {
      setExpectedJson(JSON.stringify(scenario.expectedOutput, null, 2));
    }
    if (scenario.agentConfig) {
      setAgentConfig(scenario.agentConfig);
    }
  };

  const handleDeleteScenario = (id: string) => {
    deleteScenario(id);
    setSavedScenarios(loadSavedScenarios(selectedAgentId));
  };

  // 7. Seleção de Experimento do Histórico
  const handleSelectExperiment = (exp: ExperimentRecord) => {
    if (exp.agentId !== selectedAgentId) {
      setSelectedAgentId(exp.agentId);
    }
    setInputJson(JSON.stringify(exp.input, null, 2));
    if (exp.customConfig) {
      const hasSchemaOverride = Boolean(exp.customConfig.outputSchemaJson);
      setAgentConfig({
        ...DEFAULT_CONFIG,
        promptMode: exp.customConfig.promptMode || "canonical",
        promptAppend: exp.customConfig.promptAppend || "",
        promptOverride: exp.customConfig.promptOverride || "",
        mode: (exp.customConfig.mode as any) || "standard",
        riskTier: (exp.customConfig.riskTier as any) || "limited",
        temperature: exp.customConfig.temperature ?? 0.2,
        effort: (exp.customConfig.effort as any) || "medium",
        outputSchemaOverride: hasSchemaOverride
          ? JSON.stringify(exp.customConfig.outputSchemaJson, null, 2)
          : undefined,
        outputSchemaMode: hasSchemaOverride ? "override" : "canonical",
      });
    }

    const canonicalResult: AgentExecutionResult = {
      agentName: exp.agentId,
      success: exp.canonicalResult.success,
      output: exp.canonicalResult.output,
      elapsedMs: exp.canonicalResult.elapsedMs,
      outputValid: exp.canonicalResult.outputValid,
      outputValidationErrors: exp.canonicalResult.outputValidationErrors as any,
      markdownRepresentation: exp.canonicalResult.markdown,
      error: exp.canonicalResult.error,
    };

    const customResult: AgentExecutionResult = {
      agentName: exp.agentId,
      success: exp.customResult.success,
      output: exp.customResult.output,
      elapsedMs: exp.customResult.elapsedMs,
      outputValid: exp.customResult.outputValid,
      outputValidationErrors: exp.customResult.outputValidationErrors as any,
      markdownRepresentation: exp.customResult.markdown,
      error: exp.customResult.error,
    };

    setAbResult({
      success: exp.canonicalResult.success && exp.customResult.success,
      agentName: exp.agentId,
      versionAName: exp.versionAName || "Oficial SDLC",
      versionBName: exp.versionBName || "Personalizado",
      canonicalResult,
      customResult,
      diffSummary: exp.diffSummary,
      experimentId: exp.id,
    });
    setExecutionResult(customResult);
    setIsHistoryOpen(false);
  };

  // 8. Adoção da Versão Customizada como Nova Referência
  const handlePromoteV2 = (output: unknown) => {
    if (!output) return;
    setExpectedJson(JSON.stringify(output, null, 2));
    alert("✅ Saída da versão customizada promovida com sucesso para a 'Saída Esperada (Referência)'!");
  };

  // 9. Ações da Biblioteca de Agentes & Presets
  const handleOpenLibrary = (tab: "agents" | "presets" = "agents") => {
    setLibraryInitialTab(tab);
    setIsCreateAgentModalOpen(false);
    setIsLibraryOpen(true);
  };

  const handleOpenCreateAgent = () => {
    setLibraryInitialTab("agents");
    setIsCreateAgentModalOpen(true);
    setIsLibraryOpen(true);
  };

  const handleApplyPresetFromLibrary = (preset: {
    agentId: string;
    input: Record<string, unknown>;
    title: string;
    expectedOutput?: Record<string, unknown>;
  }) => {
    if (preset.agentId !== selectedAgentId) {
      setSelectedAgentId(preset.agentId);
    }
    setInputJson(JSON.stringify(preset.input, null, 2));
    if (preset.expectedOutput) {
      setExpectedJson(JSON.stringify(preset.expectedOutput, null, 2));
    }
    setIsLibraryOpen(false);
  };

  const handleApplyVersionFromLibrary = (agentId: string, version: SavedAgentVersion) => {
    if (agentId !== selectedAgentId) {
      setSelectedAgentId(agentId);
    }
    setAgentConfig(version.config);
    setIsLibraryOpen(false);
  };

  // 10. Atalhos de Teclado Globais (Ctrl+Enter, Ctrl+Shift+Enter, Ctrl+H, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+Enter -> Executar A/B
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && !isRunningAB) handleRunAB();
        return;
      }
      // Ctrl+Enter -> Executar
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && !isRunningAB) handleRun();
        return;
      }
      // Ctrl+H -> Alternar Histórico
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
        return;
      }
      // Escape -> Fechar drawers e modais abertos
      if (e.key === "Escape") {
        setIsHistoryOpen(false);
        setIsConfigOpen(false);
        setIsSaveModalOpen(false);
        setIsLibraryOpen(false);
        setIsCreateAgentModalOpen(false);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputJson, selectedAgentId, mode, selectedModel, agentConfig, isRunning, isRunningAB]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        modelProviders={modelProviders}
        serverOnline={serverOnline}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLibrary={handleOpenLibrary}
        onOpenCreateAgent={handleOpenCreateAgent}
      />

      {/* Main Container */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar: 15 Agents Catalog */}
        <AgentSidebar
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
        />

        {/* Right Area: Workspace */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: "16px 20px",
            background: "var(--bg-main)",
          }}
        >
          {currentAgent ? (
            <>
              {/* Agent Spec & Upstream/Downstream Banner */}
              <AgentSpecBanner
                agent={currentAgent}
                onOpenConfig={() => setIsConfigOpen(true)}
                isConfigModified={
                  agentConfig.promptMode !== "canonical" ||
                  agentConfig.outputSchemaMode === "override" ||
                  agentConfig.inputSchemaMode === "override" ||
                  agentConfig.temperature !== 0.2 ||
                  agentConfig.effort !== "medium" ||
                  agentConfig.mode !== "standard" ||
                  (Boolean(currentAgent.toolNames) && Boolean(agentConfig.enabledTools) && agentConfig.enabledTools.length !== currentAgent.toolNames.length)
                }
              />

              {/* Workbench Grid: Left = Input & Expected Editor, Right = Output Viewer */}
              <div
                style={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "1fr 1.15fr",
                  gap: "16px",
                  minHeight: 0,
                }}
              >
                {/* Left: Input & Expected Output Editor */}
                <InputEditor
                  agent={currentAgent}
                  inputJson={inputJson}
                  onInputChange={setInputJson}
                  expectedJson={expectedJson}
                  onExpectedChange={setExpectedJson}
                  agentConfig={agentConfig}
                  onAgentConfigChange={setAgentConfig}
                  onOpenConfig={() => setIsConfigOpen(true)}
                  onRun={handleRun}
                  isRunning={isRunning}
                  onRunAB={handleRunAB}
                  isRunningAB={isRunningAB}
                  validationStatus={validationStatus}
                  onValidate={handleValidate}
                  savedScenarios={savedScenarios}
                  onLoadScenario={handleLoadScenario}
                  onDeleteScenario={handleDeleteScenario}
                  onOpenSaveModal={() => setIsSaveModalOpen(true)}
                  savedAgentVersions={savedAgentVersions}
                  onSelectAgentVersion={(verId) => {
                    if (verId === "canonical") handleResetAgentConfig();
                  }}
                  onOpenLibrary={handleOpenLibrary}
                  onOpenCreateAgent={handleOpenCreateAgent}
                />

                {/* Right: Output Viewer */}
                <OutputViewer
                  result={executionResult}
                  abResult={abResult}
                  agentName={selectedAgentId}
                  inputJson={inputJson}
                  expectedJson={expectedJson}
                  isRunning={isRunning || isRunningAB}
                  onPromoteV2={handlePromoteV2}
                />
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                Carregando agente {selectedAgentId}...
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal para salvar cenário */}
      <ScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveScenario}
        defaultTitle={`${selectedAgentId} - Cenário Customizado`}
      />

      {/* Drawer de Histórico de Experimentos (Pop-up Central ao Clicar) */}
      <ExperimentsHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentAgentId={selectedAgentId}
        onSelectExperiment={handleSelectExperiment}
      />

      {/* Sheet de Configurações do Agente (Painel Dedicado sem sobreposição) */}
      {currentAgent && (
        <AgentConfigSheet
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          agents={agents}
          agent={currentAgent}
          config={agentConfig}
          onChange={setAgentConfig}
          onReset={handleResetAgentConfig}
          onVersionSaved={() => setSavedAgentVersions(loadSavedAgentVersions(selectedAgentId))}
          onSelectAgentForWorkbench={handleSelectAgentForWorkbench}
          initialTab={configInitialTab}
          initialSaveVersionOpen={configInitialSaveVersion}
        />
      )}

      {/* Biblioteca de Agentes Cadastrados & Presets de Entrada (Modal / Drawer Centralizado) */}
      <SavedAssetsDrawer
        isOpen={isLibraryOpen}
        onClose={() => {
          setIsLibraryOpen(false);
          setIsCreateAgentModalOpen(false);
        }}
        currentAgentId={selectedAgentId}
        agents={agents}
        initialTab={libraryInitialTab}
        initialOpenCreateModal={isCreateAgentModalOpen}
        onCreateModalClose={() => setIsCreateAgentModalOpen(false)}
        onApplyPresetToWorkbench={handleApplyPresetFromLibrary}
        onApplyVersionToWorkbench={handleApplyVersionFromLibrary}
        onOpenConfigSheet={(agentId) => {
          if (agentId !== selectedAgentId) setSelectedAgentId(agentId);
          setIsConfigOpen(true);
        }}
        onVersionSaved={() => setSavedAgentVersions(loadSavedAgentVersions(selectedAgentId))}
      />
    </div>
  );
}
