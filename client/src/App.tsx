import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
  const [activeProfileId, setActiveProfileId] = useState<string>("canonical");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [editingAgentVersion, setEditingAgentVersion] = useState<SavedAgentVersion | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [maximizedPane, setMaximizedPane] = useState<"input" | "output" | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

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
        // O campo input e expected ficam vazios por padrão para todos os agentes
        setInputJson("");
        setExpectedJson("");
        setActiveProfileId("canonical");

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
  const handleRun = React.useCallback(async () => {
    if (!selectedAgentId) return;
    setIsRunning(true);
    setExecutionResult(null);
    setAbResult(null);

    try {
      let parsedInput: unknown;
      try {
        parsedInput = inputJson.trim() ? JSON.parse(inputJson) : {};
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
  }, [selectedAgentId, inputJson, mode, selectedModel, agentConfig]);

  // 4. Execução do Teste A/B Flexível (Entre quaisquer duas versões)
  const handleRunAB = React.useCallback(async (
    sideA?: { name: string; config?: AgentCharacteristicsConfig },
    sideB?: { name: string; config?: AgentCharacteristicsConfig }
  ) => {
    if (!selectedAgentId) return;
    setIsRunningAB(true);
    setAbResult(null);

    try {
      let parsedInput: unknown;
      try {
        parsedInput = inputJson.trim() ? JSON.parse(inputJson) : {};
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
  }, [selectedAgentId, inputJson, mode, selectedModel, agentConfig]);

  // 5. Validação de Schema
  const handleValidate = React.useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      const parsedInput = inputJson.trim() ? JSON.parse(inputJson) : {};
      const res = await validateAgentInput(selectedAgentId, parsedInput);
      setValidationStatus(res);
    } catch (err: any) {
      setValidationStatus({
        valid: false,
        errors: [{ path: "JSON", message: `Sintaxe inválida: ${err.message}` }],
      });
    }
  }, [selectedAgentId, inputJson]);

  // 5. Reset das Características
  const handleResetAgentConfig = React.useCallback(() => {
    if (currentAgent) {
      setAgentConfig({
        ...DEFAULT_CONFIG,
        enabledTools: currentAgent.toolNames || [],
        promptOverride: currentAgent.canonicalPrompt || "",
      });
      setActiveProfileId("canonical");
    }
  }, [currentAgent]);

  const handleSelectAgentForWorkbench = React.useCallback((agentId: string, targetConfig: AgentCharacteristicsConfig) => {
    if (agentId !== selectedAgentId) {
      pendingCustomConfigRef.current = targetConfig;
      setSelectedAgentId(agentId);
    } else {
      setAgentConfig(targetConfig);
    }
    setIsConfigOpen(false);
  }, [selectedAgentId]);

  // 6. Gestão de Cenários
  const handleSaveScenario = React.useCallback((title: string) => {
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
      showToast("Cenário salvo com sucesso!", "success");
    } catch (err: any) {
      showToast(`Não foi possível salvar o cenário: ${err.message}`, "error");
    }
  }, [selectedAgentId, inputJson, expectedJson, agentConfig]);

  const handleLoadScenario = React.useCallback((scenario: SavedScenario) => {
    setInputJson(JSON.stringify(scenario.input, null, 2));
    if (scenario.expectedOutput) {
      setExpectedJson(JSON.stringify(scenario.expectedOutput, null, 2));
    }
    if (scenario.agentConfig) {
      setAgentConfig(scenario.agentConfig);
    }
  }, []);

  const handleDeleteScenario = React.useCallback((id: string) => {
    deleteScenario(id);
    setSavedScenarios(loadSavedScenarios(selectedAgentId));
  }, [selectedAgentId]);

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
  const handlePromoteV2 = React.useCallback((output: unknown) => {
    if (!output) return;
    setExpectedJson(JSON.stringify(output, null, 2));
    showToast("Saída da versão customizada promovida para a Saída Esperada!", "success");
  }, []);

  // 9. Ações da Biblioteca de Agentes & Presets
  const handleOpenLibrary = React.useCallback((tab: "agents" | "presets" = "agents") => {
    setLibraryInitialTab(tab);
    setIsCreateAgentModalOpen(false);
    setIsLibraryOpen(true);
  }, []);

  const handleOpenCreateAgent = React.useCallback(() => {
    setEditingAgentVersion(null);
    setLibraryInitialTab("agents");
    setIsCreateAgentModalOpen(true);
    setIsLibraryOpen(true);
  }, []);

  const handleOpenEditAgent = React.useCallback((versionId: string) => {
    const v = savedAgentVersions.find((item) => item.id === versionId);
    if (v) {
      setEditingAgentVersion(v);
      setLibraryInitialTab("agents");
      setIsCreateAgentModalOpen(false);
      setIsLibraryOpen(true);
    }
  }, [savedAgentVersions]);

  const handleOpenConfigModal = React.useCallback(() => {
    setIsConfigOpen(true);
  }, []);

  const handleOpenSaveScenarioModal = React.useCallback(() => {
    setIsSaveModalOpen(true);
  }, []);

  const handleToggleMaximizeInput = React.useCallback(() => {
    setMaximizedPane((prev) => (prev === "input" ? null : "input"));
  }, []);

  const handleToggleMaximizeOutput = React.useCallback(() => {
    setMaximizedPane((prev) => (prev === "output" ? null : "output"));
  }, []);

  const handleCloseMaximize = React.useCallback(() => {
    setMaximizedPane(null);
  }, []);

  const handleApplyPresetFromLibrary = React.useCallback((preset: {
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
  }, [selectedAgentId]);

  const handleApplyVersionFromLibrary = React.useCallback((agentId: string, version: SavedAgentVersion) => {
    if (agentId !== selectedAgentId) {
      setSelectedAgentId(agentId);
    }
    setAgentConfig(version.config);
    setActiveProfileId(version.id);
    setIsLibraryOpen(false);
  }, [selectedAgentId]);

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
      // Escape -> Fechar drawers, modais e pop-ups ampliados
      if (e.key === "Escape") {
        if (maximizedPane) {
          setMaximizedPane(null);
          return;
        }
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
  }, [inputJson, selectedAgentId, mode, selectedModel, agentConfig, isRunning, isRunningAB, maximizedPane]);

  // Detecta se a configuração atual foi modificada em relação aos padrões
  const isConfigModified = Boolean(
    currentAgent &&
      (agentConfig.promptMode !== "canonical" ||
        agentConfig.outputSchemaMode === "override" ||
        agentConfig.inputSchemaMode === "override" ||
        agentConfig.temperature !== 0.2 ||
        agentConfig.effort !== "medium" ||
        agentConfig.mode !== "standard" ||
        (Boolean(currentAgent.toolNames) &&
          Boolean(agentConfig.enabledTools) &&
          agentConfig.enabledTools.length !== (currentAgent.toolNames?.length ?? 0)))
  );

  // Calcula a nomenclatura da versão ativa para exibição na tag do banner
  const activeVersionName = useMemo(() => {
    if (activeProfileId === "canonical") {
      return isConfigModified ? "v1.0.0 (Personalizada)" : "v1.0.0 (Oficial)";
    }
    if (activeProfileId === "active") {
      return isConfigModified ? "v1.0.0 (Personalizada)" : "v1.0.0 (Padrão)";
    }
    const saved = savedAgentVersions.find((v) => v.id === activeProfileId);
    if (saved) {
      return saved.name;
    }
    return isConfigModified ? "v1.0.0 (Personalizada)" : "v1.0.0 (Oficial)";
  }, [activeProfileId, isConfigModified, savedAgentVersions]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        overflow: "hidden",
      }}
    >
      {/* Top Application Header */}
      <Header
        serverOnline={serverOnline}
        mode={mode}
        onModeChange={setMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        modelProviders={modelProviders}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLibrary={handleOpenLibrary}
        onOpenCreateAgent={handleOpenCreateAgent}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left Agents Directory Sidebar */}
        <AgentSidebar
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(id) => {
            setSelectedAgentId(id);
            setExecutionResult(null);
            setAbResult(null);
          }}
        />

        {/* Center Workbench */}
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
              {/* Agent Spec & Upstream/Downstream Banner com Tag de Versão */}
              <AgentSpecBanner
                agent={currentAgent}
                onOpenConfig={handleOpenConfigModal}
                isConfigModified={isConfigModified}
                activeVersionName={activeVersionName}
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
                  onOpenConfig={handleOpenConfigModal}
                  onRun={handleRun}
                  isRunning={isRunning}
                  onRunAB={handleRunAB}
                  isRunningAB={isRunningAB}
                  validationStatus={validationStatus}
                  onValidate={handleValidate}
                  savedScenarios={savedScenarios}
                  onLoadScenario={handleLoadScenario}
                  onDeleteScenario={handleDeleteScenario}
                  onOpenSaveModal={handleOpenSaveScenarioModal}
                  savedAgentVersions={savedAgentVersions}
                  activeProfileId={activeProfileId}
                  onActiveProfileChange={setActiveProfileId}
                  onSelectAgentVersion={(verId) => {
                    setActiveProfileId(verId);
                    if (verId === "canonical") handleResetAgentConfig();
                  }}
                  onOpenLibrary={handleOpenLibrary}
                  onOpenCreateAgent={handleOpenCreateAgent}
                  onEditAgentVersion={handleOpenEditAgent}
                  isMaximized={false}
                  onToggleMaximize={handleToggleMaximizeInput}
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
                  isMaximized={false}
                  onToggleMaximize={handleToggleMaximizeOutput}
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
          setEditingAgentVersion(null);
        }}
        currentAgentId={selectedAgentId}
        agents={agents}
        initialTab={libraryInitialTab}
        initialOpenCreateModal={isCreateAgentModalOpen}
        initialEditVersion={editingAgentVersion}
        onInitialEditVersionConsumed={() => setEditingAgentVersion(null)}
        onCreateModalClose={() => setIsCreateAgentModalOpen(false)}
        onApplyPresetToWorkbench={handleApplyPresetFromLibrary}
        onApplyVersionToWorkbench={handleApplyVersionFromLibrary}
        onOpenConfigSheet={(agentId) => {
          if (agentId !== selectedAgentId) setSelectedAgentId(agentId);
          setIsConfigOpen(true);
        }}
        onVersionSaved={() => setSavedAgentVersions(loadSavedAgentVersions(selectedAgentId))}
      />

      {/* ── Pop-up Ampliado para Edição de Entrada (InputEditor) ──── */}
      {maximizedPane === "input" && currentAgent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            backgroundColor: "rgba(5, 5, 8, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 24px",
          }}
          onClick={handleCloseMaximize}
        >
          <div
            className="p7-modal-enter"
            style={{
              width: "100%",
              maxWidth: 1360,
              height: "92vh",
              maxHeight: 900,
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--radius-lg, 12px)",
              overflow: "hidden",
              border: "1px solid var(--border-medium)",
              background: "var(--bg-surface)",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.95)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <InputEditor
              agent={currentAgent}
              inputJson={inputJson}
              onInputChange={setInputJson}
              expectedJson={expectedJson}
              onExpectedChange={setExpectedJson}
              agentConfig={agentConfig}
              onAgentConfigChange={setAgentConfig}
              onOpenConfig={handleOpenConfigModal}
              onRun={handleRun}
              isRunning={isRunning}
              onRunAB={handleRunAB}
              isRunningAB={isRunningAB}
              validationStatus={validationStatus}
              onValidate={handleValidate}
              savedScenarios={savedScenarios}
              onLoadScenario={handleLoadScenario}
              onDeleteScenario={handleDeleteScenario}
              onOpenSaveModal={handleOpenSaveScenarioModal}
              savedAgentVersions={savedAgentVersions}
              activeProfileId={activeProfileId}
              onActiveProfileChange={setActiveProfileId}
              onSelectAgentVersion={(verId) => {
                setActiveProfileId(verId);
                if (verId === "canonical") handleResetAgentConfig();
              }}
              onOpenLibrary={handleOpenLibrary}
              onOpenCreateAgent={handleOpenCreateAgent}
              onEditAgentVersion={handleOpenEditAgent}
              isMaximized={true}
              onToggleMaximize={handleCloseMaximize}
            />
          </div>
        </div>
      )}

      {/* ── Pop-up Ampliado para Visualização de Saída (OutputViewer) ──── */}
      {maximizedPane === "output" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            backgroundColor: "rgba(5, 5, 8, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 24px",
          }}
          onClick={handleCloseMaximize}
        >
          <div
            className="p7-modal-enter"
            style={{
              width: "100%",
              maxWidth: 1480,
              height: "92vh",
              maxHeight: 920,
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--radius-lg, 12px)",
              overflow: "hidden",
              border: "1px solid var(--border-medium)",
              background: "var(--bg-surface)",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.95)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <OutputViewer
              result={executionResult}
              abResult={abResult}
              agentName={selectedAgentId}
              inputJson={inputJson}
              expectedJson={expectedJson}
              isRunning={isRunning || isRunningAB}
              onPromoteV2={handlePromoteV2}
              isMaximized={true}
              onToggleMaximize={handleCloseMaximize}
            />
          </div>
        </div>
      )}

      {/* Notificação Toast In-App (elimina alerts nativos) */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10090,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: "var(--radius-md, 8px)",
            background: toastMessage.type === "error" ? "rgba(225, 29, 72, 0.95)" : "rgba(15, 23, 42, 0.95)",
            color: "#ffffff",
            border: toastMessage.type === "error" ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid rgba(6, 182, 212, 0.4)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle size={16} className="text-rose-400" />
          ) : (
            <CheckCircle2 size={16} className="text-cyan-400" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
}
