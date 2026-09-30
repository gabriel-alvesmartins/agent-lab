import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  Cpu,
  BookmarkCheck,
  BookmarkPlus,
  Code,
  FileText,
  Sliders,
  Sparkles,
  ExternalLink,
  Save,
  Trash2,
  Copy,
  Check,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Filter,
  Plus,
  Bot,
  UserCheck,
  SlidersHorizontal,
  Zap,
  Wrench,
  Eye,
} from "lucide-react";
import {
  AgentDetail,
  AgentSummary,
  SavedScenario,
  SavedAgentVersion,
  AgentCharacteristicsConfig,
} from "../types.js";
import { fetchAgentDetails } from "../lib/api.js";
import {
  loadSavedScenarios,
  saveScenario,
  updateScenario,
  deleteScenario,
  loadSavedAgentVersions,
  saveAgentVersion,
  deleteAgentVersion,
} from "../lib/storage.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";

interface SavedAssetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgentId: string;
  agents: AgentSummary[];
  initialTab?: "agents" | "presets";
  initialOpenCreateModal?: boolean;
  onCreateModalClose?: () => void;
  onApplyPresetToWorkbench: (preset: {
    agentId: string;
    input: Record<string, unknown>;
    title: string;
    expectedOutput?: Record<string, unknown>;
  }) => void;
  onApplyVersionToWorkbench?: (agentId: string, version: SavedAgentVersion) => void;
  onOpenConfigSheet?: (agentId: string) => void;
  onVersionSaved?: () => void;
}

export const SavedAssetsDrawer: React.FC<SavedAssetsDrawerProps> = ({
  isOpen,
  onClose,
  currentAgentId,
  agents,
  initialTab = "agents",
  initialOpenCreateModal = false,
  onCreateModalClose,
  onApplyPresetToWorkbench,
  onApplyVersionToWorkbench,
  onOpenConfigSheet,
  onVersionSaved,
}) => {
  const [activeTab, setActiveTab] = useState<"agents" | "presets">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgentId, setFilterAgentId] = useState<string>("all");

  // Sub-aba na seção de Agentes: "canonical" (Canônicos) vs "custom" (Personalizados)
  const [agentSubTab, setAgentSubTab] = useState<"canonical" | "custom">("canonical");

  // Estados da Aba de Agentes
  const [selectedAgentSummary, setSelectedAgentSummary] = useState<AgentSummary | null>(null);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<AgentDetail | null>(null);
  const [savedVersions, setSavedVersions] = useState<SavedAgentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<SavedAgentVersion | null>(null);
  const [agentDetailTab, setAgentDetailTab] = useState<"prompt" | "inputSchema" | "outputSchema" | "info">("prompt");
  const [loadingAgentDetail, setLoadingAgentDetail] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Estados para Criação de Novo Agente Personalizado
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createBaseAgentId, setCreateBaseAgentId] = useState<string>(currentAgentId || "SolutionArchitect");
  const [createAgentName, setCreateAgentName] = useState<string>("");
  const [createPrompt, setCreatePrompt] = useState<string>("");
  const [createInputSchema, setCreateInputSchema] = useState<string>("");
  const [createOutputSchema, setCreateOutputSchema] = useState<string>("");
  const [createStepTab, setCreateStepTab] = useState<"prompt" | "inputSchema" | "outputSchema" | "inference">("prompt");
  const [createValidationError, setCreateValidationError] = useState<string | null>(null);
  const [createTemperature, setCreateTemperature] = useState<number>(0.2);
  const [createEffort, setCreateEffort] = useState<"low" | "medium" | "high">("medium");
  const [createMode, setCreateMode] = useState<"standard" | "thorough" | "fast">("standard");
  const [createAvailableTools, setCreateAvailableTools] = useState<string[]>([]);
  const [createEnabledTools, setCreateEnabledTools] = useState<string[]>([]);

  // Estados da Aba de Presets & Cenários
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [allPresetsList, setAllPresetsList] = useState<
    Array<{
      id: string;
      title: string;
      agentId: string;
      isOfficial: boolean;
      input: Record<string, unknown>;
      expectedOutput?: Record<string, unknown>;
      createdAt?: string;
    }>
  >([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [editingPresetTitle, setEditingPresetTitle] = useState("");
  const [editingPresetJson, setEditingPresetJson] = useState("");
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    if (onCreateModalClose) onCreateModalClose();
  };

  // Sincroniza initialTab ao abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      refreshData();
      if (initialOpenCreateModal) {
        handleOpenCreateModal(currentAgentId);
      }
    }
  }, [isOpen, initialTab, currentAgentId, initialOpenCreateModal]);

  const refreshData = () => {
    // Carrega versões salvas
    const versions = loadSavedAgentVersions();
    setSavedVersions(versions);

    // Carrega cenários salvos
    const scenarios = loadSavedScenarios();
    setSavedScenarios(scenarios);

    // Carrega detalhes do agente atual para presets
    fetchAgentDetails(currentAgentId)
      .then((detail) => {
        setSelectedAgentDetail(detail);
        const official = (detail.presets || []).map((p) => ({
          id: p.id,
          title: p.title,
          agentId: currentAgentId,
          isOfficial: true,
          input: p.input,
          expectedOutput: p.expectedOutput,
        }));

        const userScenarios = scenarios.map((s) => ({
          id: s.id,
          title: s.title,
          agentId: s.agentId,
          isOfficial: false,
          input: s.input,
          expectedOutput: s.expectedOutput,
          createdAt: s.createdAt,
        }));

        const combined = [...userScenarios, ...official];
        setAllPresetsList(combined);

        // Seleciona o primeiro preset por padrão se nada selecionado
        if (combined.length > 0 && !selectedPresetId) {
          const first = combined[0];
          setSelectedPresetId(first.id);
          setEditingPresetTitle(first.title);
          setEditingPresetJson(JSON.stringify(first.input, null, 2));
        }
      })
      .catch((err) => console.error("Erro ao carregar presets:", err));

    // Seleciona agente ativo no catálogo
    const foundSummary = agents.find((a) => a.id === currentAgentId) || agents[0] || null;
    setSelectedAgentSummary(foundSummary);
    if (foundSummary) {
      loadAgentDetail(foundSummary.id);
    }
  };

  const loadAgentDetail = async (agentId: string) => {
    setLoadingAgentDetail(true);
    setSelectedVersion(null);
    try {
      const detail = await fetchAgentDetails(agentId);
      setSelectedAgentDetail(detail);
    } catch (err) {
      console.error("Falha ao carregar detalhe do agente:", err);
    } finally {
      setLoadingAgentDetail(false);
    }
  };

  // Quando o usuário clica em um agente da lista
  const handleSelectAgent = (summary: AgentSummary) => {
    setSelectedAgentSummary(summary);
    setSelectedVersion(null);
    loadAgentDetail(summary.id);
  };

  // Quando o usuário seleciona uma versão customizada salva
  const handleSelectVersion = (version: SavedAgentVersion) => {
    setSelectedVersion(version);
    const summary = agents.find((a) => a.id === version.agentId);
    if (summary) {
      setSelectedAgentSummary(summary);
      loadAgentDetail(summary.id);
    }
  };

  // Iniciar criação de novo agente personalizado
  const handleOpenCreateModal = async (baseId?: string) => {
    const targetBaseId = baseId || selectedAgentSummary?.id || currentAgentId || agents[0]?.id || "SolutionArchitect";
    setCreateBaseAgentId(targetBaseId);
    setCreateValidationError(null);
    setIsCreateModalOpen(true);

    try {
      const detail = await fetchAgentDetails(targetBaseId);
      setCreateAgentName(`${detail.name} - Personalizado`);
      setCreatePrompt(detail.canonicalPrompt || "");
      setCreateInputSchema(JSON.stringify(detail.inputSchemaJson || {}, null, 2));
      setCreateOutputSchema(JSON.stringify(detail.outputSchemaJson || {}, null, 2));
      setCreateTemperature(0.2);
      setCreateEffort("medium");
      setCreateMode("standard");
      setCreateAvailableTools(detail.toolNames || []);
      setCreateEnabledTools(detail.toolNames || []);
    } catch {
      setCreateAgentName(`${targetBaseId} - Personalizado`);
      setCreatePrompt("");
      setCreateInputSchema("");
      setCreateOutputSchema("");
      setCreateTemperature(0.2);
      setCreateEffort("medium");
      setCreateMode("standard");
      setCreateAvailableTools([]);
      setCreateEnabledTools([]);
    }
  };

  // Quando o usuário muda o agente base dentro do modal de criação
  const handleChangeBaseAgentInModal = async (newBaseId: string) => {
    setCreateBaseAgentId(newBaseId);
    try {
      const detail = await fetchAgentDetails(newBaseId);
      setCreateAgentName(`${detail.name} - Personalizado`);
      setCreatePrompt(detail.canonicalPrompt || "");
      setCreateInputSchema(JSON.stringify(detail.inputSchemaJson || {}, null, 2));
      setCreateOutputSchema(JSON.stringify(detail.outputSchemaJson || {}, null, 2));
      setCreateAvailableTools(detail.toolNames || []);
      setCreateEnabledTools(detail.toolNames || []);
    } catch (err) {
      console.error("Erro ao carregar detalhes do novo agente base:", err);
    }
  };

  // Salvar novo agente personalizado criado
  const handleSaveCreatedAgent = () => {
    if (!createAgentName.trim()) {
      setCreateValidationError("Por favor, informe um nome para este agente personalizado.");
      return;
    }

    // Valida JSONs se preenchidos
    if (createInputSchema.trim()) {
      try {
        JSON.parse(createInputSchema);
      } catch (err: any) {
        setCreateValidationError(`Input Schema inválido: ${err.message}`);
        setCreateStepTab("inputSchema");
        return;
      }
    }

    if (createOutputSchema.trim()) {
      try {
        JSON.parse(createOutputSchema);
      } catch (err: any) {
        setCreateValidationError(`Output Schema inválido: ${err.message}`);
        setCreateStepTab("outputSchema");
        return;
      }
    }

    const config: AgentCharacteristicsConfig = {
      promptMode: "override",
      promptOverride: createPrompt,
      inputSchemaMode: createInputSchema.trim() ? "override" : "canonical",
      inputSchemaOverride: createInputSchema.trim() ? createInputSchema : undefined,
      outputSchemaMode: createOutputSchema.trim() ? "override" : "canonical",
      outputSchemaOverride: createOutputSchema.trim() ? createOutputSchema : undefined,
      mode: createMode,
      riskTier: "limited",
      temperature: createTemperature,
      effort: createEffort,
      enabledTools: createEnabledTools,
    };

    const newVersion = saveAgentVersion({
      agentId: createBaseAgentId,
      name: createAgentName.trim(),
      config,
    });

    handleCloseCreateModal();
    refreshData();
    setAgentSubTab("custom");
    setSelectedVersion(newVersion);
    loadAgentDetail(createBaseAgentId);
    if (onVersionSaved) onVersionSaved();
  };

  // Quando o usuário seleciona um preset da lista
  const handleSelectPresetItem = (preset: {
    id: string;
    title: string;
    agentId: string;
    isOfficial: boolean;
    input: Record<string, unknown>;
    expectedOutput?: Record<string, unknown>;
  }) => {
    setSelectedPresetId(preset.id);
    setEditingPresetTitle(preset.title);
    setEditingPresetJson(JSON.stringify(preset.input, null, 2));
    setJsonValidationError(null);
    setSaveSuccessMsg(null);
  };

  // Formatação do JSON no editor de presets
  const handleFormatPresetJson = () => {
    try {
      const parsed = JSON.parse(editingPresetJson);
      setEditingPresetJson(JSON.stringify(parsed, null, 2));
      setJsonValidationError(null);
    } catch (err: any) {
      setJsonValidationError(`JSON inválido: ${err.message}`);
    }
  };

  // Salvar alterações no preset
  const handleSavePresetChanges = () => {
    try {
      const parsed = JSON.parse(editingPresetJson);
      setJsonValidationError(null);

      const currentItem = allPresetsList.find((p) => p.id === selectedPresetId);
      if (!currentItem) return;

      if (!currentItem.isOfficial) {
        updateScenario(currentItem.id, {
          title: editingPresetTitle,
          input: parsed,
        });
        setSaveSuccessMsg("✅ Preset atualizado com sucesso!");
        setTimeout(() => setSaveSuccessMsg(null), 3000);
        refreshData();
      } else {
        const newScn = saveScenario({
          title: `${editingPresetTitle} (Cópia Editada)`,
          agentId: currentItem.agentId,
          input: parsed,
          expectedOutput: currentItem.expectedOutput,
        });
        setSaveSuccessMsg("✅ Salvo como novo preset personalizado!");
        setTimeout(() => setSaveSuccessMsg(null), 3000);
        refreshData();
        setSelectedPresetId(newScn.id);
      }
    } catch (err: any) {
      setJsonValidationError(`Não foi possível salvar: JSON malformado (${err.message})`);
    }
  };

  // Salvar como novo preset
  const handleSaveAsNewPreset = () => {
    try {
      const parsed = JSON.parse(editingPresetJson);
      const titlePrompt = prompt("Nome do novo preset:", `${editingPresetTitle} (Novo)`);
      if (!titlePrompt) return;

      const currentItem = allPresetsList.find((p) => p.id === selectedPresetId);
      const agentId = currentItem ? currentItem.agentId : currentAgentId;

      const newScn = saveScenario({
        title: titlePrompt,
        agentId,
        input: parsed,
      });
      setSaveSuccessMsg("✅ Novo preset salvo com sucesso!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      refreshData();
      setSelectedPresetId(newScn.id);
    } catch (err: any) {
      setJsonValidationError(`JSON malformado: ${err.message}`);
    }
  };

  // Excluir cenário salvo
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente excluir este preset salvo?")) {
      deleteScenario(id);
      refreshData();
      if (selectedPresetId === id) {
        setSelectedPresetId(null);
        setEditingPresetJson("");
        setEditingPresetTitle("");
      }
    }
  };

  // Excluir versão de agente salva
  const handleDeleteVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente excluir este agente personalizado?")) {
      deleteAgentVersion(id);
      refreshData();
      if (onVersionSaved) onVersionSaved();
      if (selectedVersion?.id === id) {
        setSelectedVersion(null);
      }
    }
  };

  // Aplicar ao Workbench
  const handleApplyToWorkbench = () => {
    const currentItem = allPresetsList.find((p) => p.id === selectedPresetId);
    if (!currentItem) return;

    try {
      const parsed = JSON.parse(editingPresetJson);
      onApplyPresetToWorkbench({
        agentId: currentItem.agentId,
        title: editingPresetTitle,
        input: parsed,
        expectedOutput: currentItem.expectedOutput,
      });
      onClose();
    } catch (err: any) {
      setJsonValidationError(`Corrija os erros de JSON antes de aplicar: ${err.message}`);
    }
  };

  // Copiar para clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  // Filtragem de Agentes Canônicos
  const filteredAgents = agents.filter((a) => {
    const matchQuery =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQuery;
  });

  // Filtragem de Agentes Personalizados
  const filteredVersions = savedVersions.filter((v) => {
    if (filterAgentId !== "all" && v.agentId !== filterAgentId) return false;
    return (
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.agentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtragem de Presets
  const filteredPresets = allPresetsList.filter((p) => {
    if (filterAgentId !== "all" && p.agentId !== filterAgentId) return false;
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.agentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Selecionado para visualização de Preset
  const selectedPresetObj = allPresetsList.find((p) => p.id === selectedPresetId);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          width: "100%",
          maxWidth: 1320,
          height: "92vh",
          maxHeight: 960,
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-medium)",
          background: "var(--bg-surface)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <Layers size={16} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
                  Biblioteca de Agentes & Presets
                </h2>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-300">
                  SDLC 1.1 Registry
                </Badge>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 1 }}>
                Inspecione contratos de entrada/saída, prompts oficiais, versões personalizadas e gerencie cenários de teste
              </p>
            </div>
          </div>

          {/* Navigation Pill Bar (Transitions.dev P16) */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="p16-tab-container">
              <button
                onClick={() => setActiveTab("agents")}
                className={`p16-tab-trigger ${activeTab === "agents" ? "active" : ""}`}
              >
                <Cpu size={12} className={activeTab === "agents" ? "text-cyan-400" : "text-zinc-500"} />
                <span>Agentes & Versões Salvas</span>
                {savedVersions.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "rgba(56, 189, 248, 0.2)",
                      color: "#38bdf8",
                      padding: "1px 5px",
                      borderRadius: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {savedVersions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("presets")}
                className={`p16-tab-trigger ${activeTab === "presets" ? "active" : ""}`}
              >
                <BookmarkCheck size={12} className={activeTab === "presets" ? "text-emerald-400" : "text-zinc-500"} />
                <span>Presets & Cenários de Entrada</span>
                {savedScenarios.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "1px 5px",
                      borderRadius: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {savedScenarios.length}
                  </span>
                )}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenCreateModal()}
              className="h-7 gap-1.5 px-2.5 text-xs text-cyan-300 border-cyan-800/70 hover:border-cyan-600 bg-cyan-950/30 hover:bg-cyan-900/40"
              title="Criar novo agente personalizado a partir de qualquer um dos 15 agentes SDLC"
            >
              <Plus className="h-3 w-3 text-cyan-400" />
              <span>+ Novo Agente</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 rounded-full text-zinc-400 hover:text-white"
            >
              <X size={15} />
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: "8px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-stage)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 400 }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Search
                size={13}
                style={{
                  position: "absolute",
                  left: 10,
                  color: "var(--text-subtle)",
                }}
              />
              <input
                type="text"
                placeholder={
                  activeTab === "agents"
                    ? "Buscar por agente, papel ou versão salva..."
                    : "Buscar por título do preset ou agente..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-surface)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "5px 10px 5px 30px",
                  fontSize: 12,
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              <Filter size={12} className="text-zinc-500" />
              <span>Filtrar por Agente:</span>
              <select
                value={filterAgentId}
                onChange={(e) => setFilterAgentId(e.target.value)}
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "3px 6px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Todos os Agentes</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area (Split Master-Detail) */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* ============================================================== */}
          {/* ABA 1: AGENTES & VERSÕES SALVAS                                */}
          {/* ============================================================== */}
          {activeTab === "agents" && (
            <>
              {/* Left Column: Sub-tabs (Canônicos vs Personalizados) & List */}
              <div
                style={{
                  width: 380,
                  borderRight: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg-surface-stage)",
                  overflowY: "auto",
                  padding: 12,
                  gap: 10,
                }}
              >
                {/* Sub-abas Agentes Canônicos vs Agentes Personalizados */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                    padding: 3,
                    background: "rgba(0, 0, 0, 0.25)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    onClick={() => setAgentSubTab("canonical")}
                    style={{
                      padding: "6px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: "calc(var(--radius-sm) - 2px)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      background: agentSubTab === "canonical" ? "var(--bg-surface-elevated)" : "transparent",
                      color: agentSubTab === "canonical" ? "var(--text-main)" : "var(--text-subtle)",
                      boxShadow: agentSubTab === "canonical" ? "0 1px 3px rgba(0, 0, 0, 0.4)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Bot size={12} className={agentSubTab === "canonical" ? "text-indigo-400" : "text-zinc-500"} />
                    <span>Canônicos ({filteredAgents.length})</span>
                  </button>

                  <button
                    onClick={() => setAgentSubTab("custom")}
                    style={{
                      padding: "6px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: "calc(var(--radius-sm) - 2px)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      background: agentSubTab === "custom" ? "var(--bg-surface-elevated)" : "transparent",
                      color: agentSubTab === "custom" ? "var(--text-main)" : "var(--text-subtle)",
                      boxShadow: agentSubTab === "custom" ? "0 1px 3px rgba(0, 0, 0, 0.4)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Sparkles size={12} className={agentSubTab === "custom" ? "text-cyan-400" : "text-zinc-500"} />
                    <span>Personalizados ({filteredVersions.length})</span>
                  </button>
                </div>

                {/* Sub-aba 1: Agentes Canônicos do SDLC */}
                {agentSubTab === "canonical" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)" }}>
                        15 Agentes Oficiais SDLC
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCreateModal(selectedAgentSummary?.id)}
                        className="h-6 px-2 text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/20"
                        title="Criar versão personalizada a partir deste agente"
                      >
                        <Plus size={11} className="mr-1" />
                        <span>Personalizar</span>
                      </Button>
                    </div>

                    {filteredAgents.map((agent) => {
                      const isSelected = !selectedVersion && selectedAgentSummary?.id === agent.id;
                      return (
                        <div
                          key={agent.id}
                          onClick={() => handleSelectAgent(agent)}
                          className="glass-card hover:border-indigo-500 transition-colors"
                          style={{
                            padding: "8px 10px",
                            cursor: "pointer",
                            border: isSelected ? "1px solid #6366f1" : "1px solid var(--border-subtle)",
                            background: isSelected ? "rgba(99, 102, 241, 0.08)" : "var(--bg-surface)",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "var(--radius-sm)",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid var(--border-subtle)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--text-main)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            P{agent.phase}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                              {agent.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-subtle)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {agent.role}
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            size="xs"
                            className="font-mono text-zinc-400 border-zinc-700/80"
                            style={{
                              fontSize: 8.5,
                              padding: "0px 4px",
                              maxWidth: 90,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.02em",
                              flexShrink: 0,
                            }}
                          >
                            {agent.id}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub-aba 2: Agentes Personalizados Salvos */}
                {agentSubTab === "custom" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)" }}>
                        Agentes Personalizados ({filteredVersions.length})
                      </span>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenCreateModal()}
                        className="h-6 px-2 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm"
                        title="Criar novo agente personalizado a partir de qualquer agente SDLC"
                      >
                        <Plus size={11} className="mr-1" />
                        <span>Novo Agente</span>
                      </Button>
                    </div>

                    {filteredVersions.length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "36px 16px",
                          color: "var(--text-muted)",
                          border: "1px dashed var(--border-medium)",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.01)",
                        }}
                      >
                        <Bot size={28} className="text-zinc-600 mx-auto mb-2 opacity-50" />
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                          Nenhum agente personalizado salvo ainda.
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4, marginBottom: 12 }}>
                          Você pode clonar qualquer um dos 15 agentes canônicos do SDLC, ajustar o prompt e schemas, e salvar aqui.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreateModal()}
                          className="h-7 px-3 text-xs border-cyan-800 text-cyan-300 hover:text-white bg-cyan-950/30"
                        >
                          <Plus size={12} className="mr-1.5" />
                          <span>Criar Primeiro Agente</span>
                        </Button>
                      </div>
                    )}

                    {filteredVersions.map((v) => {
                      const isSelected = selectedVersion?.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectVersion(v)}
                          className="glass-card hover:border-cyan-500 transition-colors"
                          style={{
                            padding: "8px 10px",
                            cursor: "pointer",
                            border: isSelected ? "1px solid #38bdf8" : "1px solid var(--border-subtle)",
                            background: isSelected ? "rgba(56, 189, 248, 0.08)" : "var(--bg-surface)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 border-cyan-800/50 text-cyan-400 bg-cyan-950/30 font-mono"
                            >
                              Base: {v.agentId}
                            </Badge>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                                {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteVersion(v.id, e)}
                                className="h-5 w-5 text-zinc-500 hover:text-rose-400"
                                title="Excluir agente personalizado"
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          </div>

                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                            {v.name}
                          </div>

                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                            {v.config.promptMode === "override" && (
                              <span
                                style={{
                                  fontSize: 9,
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  background: "rgba(244, 63, 94, 0.15)",
                                  color: "#fb7185",
                                  border: "1px solid rgba(244, 63, 94, 0.3)",
                                }}
                              >
                                Prompt ✎
                              </span>
                            )}
                            {Boolean(v.config.outputSchemaOverride) && (
                              <span
                                style={{
                                  fontSize: 9,
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  background: "rgba(16, 185, 129, 0.15)",
                                  color: "#34d399",
                                  border: "1px solid rgba(16, 185, 129, 0.3)",
                                }}
                              >
                                Output Schema ✎
                              </span>
                            )}
                            {Boolean(v.config.inputSchemaOverride) && (
                              <span
                                style={{
                                  fontSize: 9,
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  background: "rgba(6, 182, 212, 0.15)",
                                  color: "#22d3ee",
                                  border: "1px solid rgba(6, 182, 212, 0.3)",
                                }}
                              >
                                Input Schema ✎
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Detailed Inspector */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  padding: 20,
                  gap: 14,
                  background: "var(--bg-surface)",
                }}
              >
                {loadingAgentDetail ? (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                    Carregando especificações e contratos do agente...
                  </div>
                ) : selectedAgentDetail ? (
                  <>
                    {/* Header do Agente/Versão Inspecionada */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        paddingBottom: 14,
                        borderBottom: "1px solid var(--border-subtle)",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-main)" }}>
                            {selectedVersion ? selectedVersion.name : selectedAgentDetail.name}
                          </h3>
                          <Badge
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 font-mono text-zinc-400"
                          >
                            {selectedAgentDetail.id}
                          </Badge>
                          {selectedVersion ? (
                            <Badge size="sm" className="bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                              Agente Personalizado
                            </Badge>
                          ) : (
                            <Badge size="sm" className="bg-zinc-800 border border-zinc-700 text-zinc-300">
                              Canônico Oficial SDLC
                            </Badge>
                          )}
                        </div>

                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                          {selectedAgentDetail.role} • Fase {selectedAgentDetail.phase}:{" "}
                          {selectedAgentDetail.phaseName}
                        </p>
                      </div>

                      {/* Ações */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {selectedVersion && onApplyVersionToWorkbench && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              onApplyVersionToWorkbench(selectedAgentDetail.id, selectedVersion);
                              onClose();
                            }}
                            className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-2.5"
                          >
                            <ExternalLink size={12} className="mr-1.5" />
                            <span>Carregar no Workbench</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreateModal(selectedAgentDetail.id)}
                          className="h-7 text-xs border-indigo-700/60 text-indigo-300 hover:text-white bg-indigo-950/20 px-2.5"
                          title="Criar novo agente personalizado a partir deste modelo"
                        >
                          <Plus size={12} className="mr-1 text-indigo-400" />
                          <span>Personalizar Novo</span>
                        </Button>
                      </div>
                    </div>

                    {/* Sub-tabs de Inspeção */}
                    <div className="p16-tab-container" style={{ alignSelf: "flex-start" }}>
                      <button
                        onClick={() => setAgentDetailTab("prompt")}
                        className={`p16-tab-trigger ${agentDetailTab === "prompt" ? "active" : ""}`}
                      >
                        <FileText size={12} className={agentDetailTab === "prompt" ? "text-cyan-400" : "text-zinc-500"} />
                        <span>Prompt do Sistema</span>
                      </button>
                      <button
                        onClick={() => setAgentDetailTab("inputSchema")}
                        className={`p16-tab-trigger ${agentDetailTab === "inputSchema" ? "active" : ""}`}
                      >
                        <Code size={12} className={agentDetailTab === "inputSchema" ? "text-indigo-400" : "text-zinc-500"} />
                        <span>Input Schema (Contrato)</span>
                      </button>
                      <button
                        onClick={() => setAgentDetailTab("outputSchema")}
                        className={`p16-tab-trigger ${agentDetailTab === "outputSchema" ? "active" : ""}`}
                      >
                        <BookmarkCheck size={12} className={agentDetailTab === "outputSchema" ? "text-emerald-400" : "text-zinc-500"} />
                        <span>Output Schema (Artefato)</span>
                      </button>
                      <button
                        onClick={() => setAgentDetailTab("info")}
                        className={`p16-tab-trigger ${agentDetailTab === "info" ? "active" : ""}`}
                      >
                        <Sliders size={12} className={agentDetailTab === "info" ? "text-amber-400" : "text-zinc-500"} />
                        <span>Hiperparâmetros & Info</span>
                      </button>
                    </div>

                    {/* Conteúdo da Sub-tab */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                      {/* Aba: Prompt */}
                      {agentDetailTab === "prompt" && (
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                              {selectedVersion?.config.promptMode === "override"
                                ? "Prompt Personalizado Ativo"
                                : "Prompt Oficial do Sistema (Canônico)"}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const text =
                                  selectedVersion?.config.promptOverride ||
                                  selectedAgentDetail.canonicalPrompt ||
                                  "";
                                handleCopy(text, "prompt");
                              }}
                              className="h-7 text-xs border-zinc-800 text-zinc-300"
                            >
                              {copiedCode === "prompt" ? (
                                <>
                                  <Check size={11} className="mr-1 text-emerald-400" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} className="mr-1" />
                                  <span>Copiar Prompt</span>
                                </>
                              )}
                            </Button>
                          </div>

                          <pre
                            style={{
                              flex: 1,
                              padding: 14,
                              borderRadius: "var(--radius-md)",
                              background: "var(--bg-surface-stage)",
                              border: "1px solid var(--border-medium)",
                              color: "var(--text-main)",
                              fontSize: 12,
                              fontFamily: "var(--font-mono)",
                              lineHeight: 1.6,
                              overflowY: "auto",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {selectedVersion?.config.promptOverride ||
                              selectedAgentDetail.canonicalPrompt ||
                              "Nenhum prompt disponível."}
                          </pre>
                        </div>
                      )}

                      {/* Aba: Input Schema */}
                      {agentDetailTab === "inputSchema" && (
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                              {selectedVersion?.config.inputSchemaOverride
                                ? "Input Schema Personalizado"
                                : "JSON Schema Oficial de Entrada"}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const text =
                                  selectedVersion?.config.inputSchemaOverride ||
                                  JSON.stringify(selectedAgentDetail.inputSchemaJson, null, 2);
                                handleCopy(text, "inputSchema");
                              }}
                              className="h-7 text-xs border-zinc-800 text-zinc-300"
                            >
                              {copiedCode === "inputSchema" ? (
                                <>
                                  <Check size={11} className="mr-1 text-emerald-400" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} className="mr-1" />
                                  <span>Copiar Schema</span>
                                </>
                              )}
                            </Button>
                          </div>

                          <pre
                            style={{
                              flex: 1,
                              padding: 14,
                              borderRadius: "var(--radius-md)",
                              background: "var(--bg-surface-stage)",
                              border: "1px solid var(--border-medium)",
                              color: "#38bdf8",
                              fontSize: 12,
                              fontFamily: "var(--font-mono)",
                              lineHeight: 1.5,
                              overflowY: "auto",
                            }}
                          >
                            {selectedVersion?.config.inputSchemaOverride
                              ? selectedVersion.config.inputSchemaOverride
                              : JSON.stringify(selectedAgentDetail.inputSchemaJson, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Aba: Output Schema */}
                      {agentDetailTab === "outputSchema" && (
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                              {selectedVersion?.config.outputSchemaOverride
                                ? "Output Schema Personalizado"
                                : "JSON Schema Oficial do Artefato Gerado"}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const text =
                                  selectedVersion?.config.outputSchemaOverride ||
                                  JSON.stringify(selectedAgentDetail.outputSchemaJson, null, 2);
                                handleCopy(text, "outputSchema");
                              }}
                              className="h-7 text-xs border-zinc-800 text-zinc-300"
                            >
                              {copiedCode === "outputSchema" ? (
                                <>
                                  <Check size={11} className="mr-1 text-emerald-400" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} className="mr-1" />
                                  <span>Copiar Schema</span>
                                </>
                              )}
                            </Button>
                          </div>

                          <pre
                            style={{
                              flex: 1,
                              padding: 14,
                              borderRadius: "var(--radius-md)",
                              background: "var(--bg-surface-stage)",
                              border: "1px solid var(--border-medium)",
                              color: "#34d399",
                              fontSize: 12,
                              fontFamily: "var(--font-mono)",
                              lineHeight: 1.5,
                              overflowY: "auto",
                            }}
                          >
                            {selectedVersion?.config.outputSchemaOverride
                              ? selectedVersion.config.outputSchemaOverride
                              : JSON.stringify(selectedAgentDetail.outputSchemaJson, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Aba: Info & Ferramentas */}
                      {agentDetailTab === "info" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
                          {/* Hiperparâmetros de Inferência */}
                          <div className="glass-card" style={{ padding: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Sliders size={14} className="text-amber-400" />
                                <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                  Hiperparâmetros de Inferência {selectedVersion ? "(Versão Customizada)" : "(Canônico Padrão)"}
                                </h4>
                              </div>
                              {selectedVersion && (
                                <Badge variant="warning" size="xs">
                                  Customizado
                                </Badge>
                              )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                              <div style={{ background: "var(--bg-surface-stage)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 600 }}>Temperatura</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-indigo, #818cf8)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                                  {selectedVersion?.config.temperature !== undefined ? selectedVersion.config.temperature.toFixed(2) : "0.20"}
                                </div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                                  {(selectedVersion?.config.temperature ?? 0.2) <= 0.2 ? "Determinístico / Estrito" : (selectedVersion?.config.temperature ?? 0.2) <= 0.5 ? "Alta Precisão" : "Criativo / Aberto"}
                                </div>
                              </div>

                              <div style={{ background: "var(--bg-surface-stage)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 600 }}>Reasoning Effort</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-amber, #fbbf24)", textTransform: "capitalize", marginTop: 2 }}>
                                  {selectedVersion?.config.effort || "medium"}
                                </div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                                  Extended Thinking Cota
                                </div>
                              </div>

                              <div style={{ background: "var(--bg-surface-stage)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 600 }}>Modo SDLC</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-emerald, #34d399)", textTransform: "capitalize", marginTop: 2 }}>
                                  {selectedVersion?.config.mode || "standard"}
                                </div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                                  Postura do Framework
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 12,
                            }}
                          >
                            <div className="glass-card" style={{ padding: 12 }}>
                              <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                                Artefato Produzido
                              </h4>
                              <p style={{ fontSize: 12, color: "var(--accent-emerald)", fontFamily: "var(--font-mono)" }}>
                                {selectedAgentDetail.produces.artifact}
                              </p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                {selectedAgentDetail.produces.description}
                              </p>
                            </div>

                            <div className="glass-card" style={{ padding: 12 }}>
                              <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                                Consumidores Downstream
                              </h4>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {selectedAgentDetail.produces.consumers.map((c) => (
                                  <Badge key={c} variant="outline" className="text-[10px] border-zinc-700">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Ferramentas Habilitadas */}
                          <div className="glass-card" style={{ padding: 12 }}>
                            <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                              Ferramentas do Agente ({selectedAgentDetail.toolNames?.length ?? 0})
                            </h4>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {selectedAgentDetail.toolNames?.map((t) => (
                                <Badge
                                  key={t}
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 border-zinc-700 font-mono text-zinc-300"
                                >
                                  {t}
                                </Badge>
                              )) ?? <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>Nenhuma ferramenta registrada</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                    Selecione um agente ou versão na lista lateral.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* ABA 2: PRESETS & CENÁRIOS DE ENTRADA                           */}
          {/* ============================================================== */}
          {activeTab === "presets" && (
            <>
              {/* Left Column: List of Presets (Official + User Saved) */}
              <div
                style={{
                  width: 380,
                  borderRight: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg-surface-stage)",
                  overflowY: "auto",
                  padding: 12,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)" }}>
                    Presets Salvos ({filteredPresets.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAsNewPreset}
                    className="h-6 px-2 text-[10px] border-zinc-800 text-zinc-300 hover:text-white"
                  >
                    <Plus size={11} className="mr-1 text-emerald-400" />
                    <span>Novo Preset</span>
                  </Button>
                </div>

                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPresetItem(preset)}
                      className="glass-card hover:border-emerald-500 transition-colors"
                      style={{
                        padding: "8px 10px",
                        cursor: "pointer",
                        border: isSelected ? "1px solid #10b981" : "1px solid var(--border-subtle)",
                        background: isSelected ? "rgba(16, 185, 129, 0.08)" : "var(--bg-surface)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-zinc-700">
                            {preset.agentId}
                          </Badge>
                          {preset.isOfficial ? (
                            <span
                              style={{
                                fontSize: 9,
                                padding: "1px 5px",
                                borderRadius: 3,
                                background: "rgba(99, 102, 241, 0.15)",
                                color: "#818cf8",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                              }}
                            >
                              Oficial SDLC
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 9,
                                padding: "1px 5px",
                                borderRadius: 3,
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#34d399",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                              }}
                            >
                              Personalizado
                            </span>
                          )}
                        </div>

                        {!preset.isOfficial && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeletePreset(preset.id, e)}
                            className="h-5 w-5 text-zinc-500 hover:text-rose-400"
                            title="Excluir preset personalizado"
                          >
                            <Trash2 size={11} />
                          </Button>
                        )}
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                        {preset.title}
                      </div>

                      <div style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                        Chaves: {Object.keys(preset.input).slice(0, 3).join(", ")}
                        {Object.keys(preset.input).length > 3 ? "..." : ""}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Interactive Parallel Preset Editor & Runner */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: 18,
                  gap: 12,
                  background: "var(--bg-surface)",
                  overflow: "hidden",
                }}
              >
                {selectedPresetObj ? (
                  <>
                    {/* Header do Preset com Edição de Título */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: 10,
                        borderBottom: "1px solid var(--border-subtle)",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-zinc-700">
                              Agente: {selectedPresetObj.agentId}
                            </Badge>
                            <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                              {selectedPresetObj.isOfficial
                                ? "Preset de Fábrica (Canônico)"
                                : "Preset Personalizado Salvo"}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={editingPresetTitle}
                            onChange={(e) => setEditingPresetTitle(e.target.value)}
                            placeholder="Nome do Preset..."
                            style={{
                              width: "100%",
                              background: "var(--bg-surface-stage)",
                              color: "var(--text-main)",
                              border: "1px solid var(--border-medium)",
                              borderRadius: "var(--radius-sm)",
                              padding: "5px 8px",
                              fontSize: 13,
                              fontWeight: 600,
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      {/* Ações do Preset */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFormatPresetJson}
                          className="h-7 text-xs border-zinc-800 text-zinc-300 hover:text-white"
                          title="Formatar indentação do JSON"
                        >
                          <Code size={12} className="mr-1 text-cyan-400" />
                          <span>Formatar</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSavePresetChanges}
                          className="h-7 text-xs border-emerald-800/60 text-emerald-300 hover:text-white bg-emerald-950/20"
                          title="Salvar alterações feitas neste preset"
                        >
                          <Save size={12} className="mr-1 text-emerald-400" />
                          <span>Salvar Alterações</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveAsNewPreset}
                          className="h-7 text-xs border-zinc-800 text-zinc-300 hover:text-white"
                          title="Salvar como um novo preset independente"
                        >
                          <BookmarkPlus size={12} className="mr-1 text-indigo-400" />
                          <span>Salvar Cópia</span>
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleApplyToWorkbench}
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm"
                          title="Carregar este payload de entrada no workbench e testar"
                        >
                          <ExternalLink size={12} className="mr-1.5" />
                          <span>Aplicar & Testar</span>
                        </Button>
                      </div>
                    </div>

                    {/* Feedback Messages */}
                    {saveSuccessMsg && (
                      <div
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(16, 185, 129, 0.15)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          color: "#34d399",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>{saveSuccessMsg}</span>
                      </div>
                    )}

                    {jsonValidationError && (
                      <div
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(244, 63, 94, 0.15)",
                          border: "1px solid rgba(244, 63, 94, 0.3)",
                          color: "#fb7185",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <AlertTriangle size={13} />
                        <span>{jsonValidationError}</span>
                      </div>
                    )}

                    {/* Editor de JSON em Tela Paralela */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "5px 10px",
                          background: "var(--bg-surface-stage)",
                          borderTopLeftRadius: "var(--radius-sm)",
                          borderTopRightRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-medium)",
                          borderBottom: "none",
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <span>Payload JSON de Entrada (Editável)</span>
                        <span>{editingPresetJson.split("\n").length} linhas</span>
                      </div>

                      <textarea
                        value={editingPresetJson}
                        onChange={(e) => {
                          setEditingPresetJson(e.target.value);
                          setJsonValidationError(null);
                        }}
                        style={{
                          flex: 1,
                          width: "100%",
                          background: "var(--bg-main)",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-medium)",
                          borderBottomLeftRadius: "var(--radius-sm)",
                          borderBottomRightRadius: "var(--radius-sm)",
                          padding: 12,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          lineHeight: 1.5,
                          resize: "none",
                          outline: "none",
                          tabSize: 2,
                        }}
                        spellCheck={false}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                    Selecione um preset na lista lateral para inspecionar ou modificar.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Embutido para Criar Novo Agente Personalizado (Audio 4) */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 10005,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            padding: 20,
          }}
          onClick={handleCloseCreateModal}
        >
          <div
            className="glass-card animate-scale-in"
            style={{
              width: "100%",
              maxWidth: 960,
              height: "85vh",
              maxHeight: 820,
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-medium)",
              background: "var(--bg-surface)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.9)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal Criação */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-elevated)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} className="text-cyan-400" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
                  Criar Novo Agente Personalizado
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseCreateModal}
                className="h-7 w-7 rounded-full text-zinc-400 hover:text-white"
              >
                <X size={15} />
              </Button>
            </div>

            {/* Inputs: Agente Base e Nome da Nova Versão */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-stage)",
                display: "grid",
                gridTemplateColumns: "1fr 1.6fr",
                gap: 16,
              }}
            >
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", display: "block", marginBottom: 4 }}>
                  Agente Base (1 dos 15 SDLC):
                </label>
                <select
                  value={createBaseAgentId}
                  onChange={(e) => handleChangeBaseAgentInModal(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-surface)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 8px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Fase {a.phase} - {a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", display: "block", marginBottom: 4 }}>
                  Nome do Agente Personalizado / Versão:
                </label>
                <input
                  type="text"
                  value={createAgentName}
                  onChange={(e) => {
                    setCreateAgentName(e.target.value);
                    setCreateValidationError(null);
                  }}
                  placeholder="Ex: Solution Architect - IoT & Edge, TechLead - Microsserviços..."
                  style={{
                    width: "100%",
                    background: "var(--bg-surface)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Error banner if any */}
            {createValidationError && (
              <div
                style={{
                  padding: "6px 20px",
                  background: "rgba(244, 63, 94, 0.15)",
                  borderBottom: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fb7185",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AlertTriangle size={13} />
                <span>{createValidationError}</span>
              </div>
            )}

            {/* Tabs for Prompt, Input Schema, Output Schema */}
            <div
              style={{
                padding: "8px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="p16-tab-container">
                <button
                  onClick={() => setCreateStepTab("prompt")}
                  className={`p16-tab-trigger ${createStepTab === "prompt" ? "active" : ""}`}
                >
                  <FileText size={12} className={createStepTab === "prompt" ? "text-cyan-400" : "text-zinc-500"} />
                  <span>Prompt Personalizado</span>
                </button>
                <button
                  onClick={() => setCreateStepTab("inputSchema")}
                  className={`p16-tab-trigger ${createStepTab === "inputSchema" ? "active" : ""}`}
                >
                  <Code size={12} className={createStepTab === "inputSchema" ? "text-indigo-400" : "text-zinc-500"} />
                  <span>Input Schema (JSON)</span>
                </button>
                <button
                  onClick={() => setCreateStepTab("outputSchema")}
                  className={`p16-tab-trigger ${createStepTab === "outputSchema" ? "active" : ""}`}
                >
                  <BookmarkCheck size={12} className={createStepTab === "outputSchema" ? "text-emerald-400" : "text-zinc-500"} />
                  <span>Output Schema (JSON)</span>
                </button>
                <button
                  onClick={() => setCreateStepTab("inference")}
                  className={`p16-tab-trigger ${createStepTab === "inference" ? "active" : ""}`}
                >
                  <SlidersHorizontal size={12} className={createStepTab === "inference" ? "text-amber-400" : "text-zinc-500"} />
                  <span>Hiperparâmetros & Inferência</span>
                </button>
              </div>

              <span style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                Os campos foram pré-preenchidos com a base de {createBaseAgentId}
              </span>
            </div>

            {/* Body of Modal Editor */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, overflow: "hidden" }}>
              {createStepTab === "prompt" && (
                <textarea
                  value={createPrompt}
                  onChange={(e) => setCreatePrompt(e.target.value)}
                  placeholder="Instruções de sistema, persona, regras e contratos que este agente seguirá..."
                  style={{
                    flex: 1,
                    width: "100%",
                    background: "var(--bg-main)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-sm)",
                    padding: 12,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.5,
                    resize: "none",
                    outline: "none",
                  }}
                  spellCheck={false}
                />
              )}

              {createStepTab === "inputSchema" && (
                <textarea
                  value={createInputSchema}
                  onChange={(e) => setCreateInputSchema(e.target.value)}
                  placeholder="JSON Schema para os parâmetros de entrada que este agente aceita..."
                  style={{
                    flex: 1,
                    width: "100%",
                    background: "var(--bg-main)",
                    color: "#38bdf8",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-sm)",
                    padding: 12,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.5,
                    resize: "none",
                    outline: "none",
                  }}
                  spellCheck={false}
                />
              )}

              {createStepTab === "outputSchema" && (
                <textarea
                  value={createOutputSchema}
                  onChange={(e) => setCreateOutputSchema(e.target.value)}
                  placeholder="JSON Schema para a estrutura de saída gerada por este agente..."
                  style={{
                    flex: 1,
                    width: "100%",
                    background: "var(--bg-main)",
                    color: "#34d399",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-sm)",
                    padding: 12,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.5,
                    resize: "none",
                    outline: "none",
                  }}
                  spellCheck={false}
                />
              )}

              {createStepTab === "inference" && (
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Temperatura */}
                    <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Sparkles size={14} className="text-indigo-400" />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                            Temperatura de Amostragem
                          </span>
                        </div>
                        <Badge variant="outline" size="xs">
                          {createTemperature.toFixed(2)}
                        </Badge>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>0.0</span>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={createTemperature}
                          onChange={(e) => setCreateTemperature(Number.parseFloat(e.target.value))}
                          style={{ flex: 1, accentColor: "var(--accent-indigo, #6366f1)", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>1.0</span>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                          { val: 0.2, label: "0.2 Estrito" },
                          { val: 0.3, label: "0.3 Precisão" },
                          { val: 0.7, label: "0.7 Arquitetura" },
                          { val: 1.0, label: "1.0 Criativo" },
                        ].map((p) => (
                          <Button
                            key={p.val}
                            type="button"
                            variant={createTemperature === p.val ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setCreateTemperature(p.val)}
                            className="h-6 px-2 text-[10px]"
                          >
                            {p.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Reasoning Effort */}
                    <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Zap size={14} className="text-amber-400" />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                            Esforço de Raciocínio (Extended Thinking)
                          </span>
                        </div>
                        <Badge variant="outline" size="xs">
                          {createEffort}
                        </Badge>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
                        {(["low", "medium", "high"] as const).map((eff) => (
                          <button
                            key={eff}
                            type="button"
                            onClick={() => setCreateEffort(eff)}
                            style={{
                              padding: "8px 6px",
                              borderRadius: "var(--radius-sm)",
                              border: `1px solid ${createEffort === eff ? "var(--accent-indigo, #6366f1)" : "var(--border-subtle)"}`,
                              background: createEffort === eff ? "rgba(99, 102, 241, 0.15)" : "var(--bg-surface-stage)",
                              color: createEffort === eff ? "var(--text-main)" : "var(--text-muted)",
                              cursor: "pointer",
                              textAlign: "center",
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {eff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Modo de Execução */}
                    <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Eye size={14} className="text-emerald-400" />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                            Modo de Rigor da Plataforma
                          </span>
                        </div>
                        <Badge variant="outline" size="xs">
                          {createMode}
                        </Badge>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
                        {(["standard", "thorough", "fast"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCreateMode(m)}
                            style={{
                              padding: "8px 6px",
                              borderRadius: "var(--radius-sm)",
                              border: `1px solid ${createMode === m ? "var(--accent-emerald, #10b981)" : "var(--border-subtle)"}`,
                              background: createMode === m ? "rgba(16, 185, 129, 0.12)" : "var(--bg-surface-stage)",
                              color: createMode === m ? "var(--text-main)" : "var(--text-muted)",
                              cursor: "pointer",
                              textAlign: "center",
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ferramentas Ativas */}
                    <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Wrench size={14} className="text-cyan-400" />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                            Ferramentas Registradas (Tools)
                          </span>
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                          {createEnabledTools.length} ativas
                        </span>
                      </div>

                      {createAvailableTools.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {createAvailableTools.map((tool) => {
                            const isChecked = createEnabledTools.includes(tool);
                            return (
                              <label
                                key={tool}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 11,
                                  color: "var(--text-main)",
                                  padding: "5px 8px",
                                  borderRadius: "var(--radius-sm)",
                                  background: "var(--bg-surface-stage)",
                                  border: "1px solid var(--border-subtle)",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...createEnabledTools, tool]
                                      : createEnabledTools.filter((t) => t !== tool);
                                    setCreateEnabledTools(updated);
                                  }}
                                  style={{ accentColor: "var(--accent-cyan, #06b6d4)", cursor: "pointer" }}
                                />
                                <span style={{ fontFamily: "var(--font-mono)" }}>{tool}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", padding: 8, textAlign: "center" }}>
                          Este agente base não possui ferramentas auxiliares registradas.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal Criação */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-stage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseCreateModal}
                className="h-7 text-xs border-zinc-700 text-zinc-300"
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveCreatedAgent}
                className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3"
              >
                <Save size={12} className="mr-1.5" />
                <span>Salvar Agente Personalizado</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
