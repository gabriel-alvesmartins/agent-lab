import React, { useState } from "react";
import {
  Play,
  Sparkles,
  BookmarkPlus,
  CheckCircle2,
  AlertTriangle,
  Code,
  Sliders,
  SlidersHorizontal,
  FileCode,
  Plus,
  Loader2,
  Check,
  ArrowLeftRight,
  Layers,
  Edit3,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import {
  AgentCharacteristicsConfig,
  AgentDetail,
  SavedScenario,
  SavedAgentVersion,
} from "../types.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";

export interface SideVersionOption {
  id: string;
  name: string;
  config?: AgentCharacteristicsConfig;
}

interface InputEditorProps {
  agent: AgentDetail;
  inputJson: string;
  onInputChange: (val: string) => void;
  expectedJson?: string;
  onExpectedChange?: (val: string) => void;
  agentConfig: AgentCharacteristicsConfig;
  onAgentConfigChange?: (cfg: AgentCharacteristicsConfig) => void;
  onOpenConfig?: () => void;
  onRun: () => void;
  isRunning: boolean;
  onRunAB?: (
    sideA: { name: string; config?: AgentCharacteristicsConfig },
    sideB: { name: string; config?: AgentCharacteristicsConfig }
  ) => void;
  isRunningAB?: boolean;
  validationStatus: { valid: boolean; errors?: Array<{ path: string; message: string }> } | null;
  onValidate: () => void;
  savedScenarios: SavedScenario[];
  onLoadScenario: (scenario: SavedScenario) => void;
  onDeleteScenario: (id: string) => void;
  onOpenSaveModal: () => void;
  savedAgentVersions?: SavedAgentVersion[];
  onSelectAgentVersion?: (versionId: string) => void;
  activeProfileId?: string;
  onActiveProfileChange?: (val: string) => void;
  onOpenLibrary?: (tab?: "agents" | "presets") => void;
  onOpenCreateAgent?: () => void;
  onEditAgentVersion?: (versionId: string) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const InputEditorComponent: React.FC<InputEditorProps> = ({
  agent,
  inputJson,
  onInputChange,
  onExpectedChange,
  agentConfig,
  onAgentConfigChange,
  onOpenConfig,
  onRun,
  isRunning,
  onRunAB,
  isRunningAB = false,
  validationStatus,
  onValidate,
  savedScenarios,
  onLoadScenario,
  onOpenSaveModal,
  savedAgentVersions = [],
  onSelectAgentVersion,
  activeProfileId: activeProfileIdProp,
  onActiveProfileChange,
  onOpenLibrary,
  onOpenCreateAgent,
  onEditAgentVersion,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [sideAId, setSideAId] = useState<string>("canonical");
  const [sideBId, setSideBId] = useState<string>("active");
  const [localActiveProfileId, setLocalActiveProfileId] = useState<string>("canonical");
  const activeProfile = activeProfileIdProp ?? localActiveProfileId;
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>("");

  // Estado local desacoplado para resposta instantânea ao digitar (Zero Lag na UI)
  const [localInput, setLocalInput] = useState<string>(inputJson);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sincroniza estado local quando inputJson muda externamente (mudança de agente, preset, reset)
  React.useEffect(() => {
    setLocalInput(inputJson);
  }, [inputJson]);

  // Função para sincronizar imediatamente o valor digitado com o App
  const flushInput = React.useCallback(
    (val: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      onInputChange(val);
    },
    [onInputChange]
  );

  // Manipulador de digitação suave com debounce de 250ms
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onInputChange(val);
    }, 250);
  };

  // Limpa o timer de debounce ao desmontar
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Reseta cenário selecionado se mudar o agente
  React.useEffect(() => {
    setSelectedScenarioKey("");
  }, [agent.id]);

  // Formatador JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(localInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalInput(formatted);
      flushInput(formatted);
    } catch {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  // Validação garantindo sincronização imediata
  const handleValidateClick = () => {
    flushInput(localInput);
    onValidate();
  };

  // Execução isolada garantindo sincronização imediata
  const handleRunClick = () => {
    flushInput(localInput);
    onRun();
  };

  // Seletor unificado de Cenários (Presets Padrão + Cenários Salvos)
  const handleSelectScenario = (val: string) => {
    if (!val) return;
    if (val === "__clear__") {
      setLocalInput("");
      flushInput("");
      if (onExpectedChange) onExpectedChange("");
      setSelectedScenarioKey("");
      return;
    }
    if (val.startsWith("preset:")) {
      const presetId = val.replace("preset:", "");
      const preset = agent.presets.find((p) => p.id === presetId);
      if (preset) {
        const text = JSON.stringify(preset.input, null, 2);
        setLocalInput(text);
        flushInput(text);
        if (preset.expectedOutput && onExpectedChange) {
          onExpectedChange(JSON.stringify(preset.expectedOutput, null, 2));
        }
      }
    } else if (val.startsWith("saved:")) {
      const savedId = val.replace("saved:", "");
      const scn = savedScenarios.find((s) => s.id === savedId);
      if (scn) {
        onLoadScenario(scn);
      }
    }
  };

  const isConfigModified =
    agentConfig.promptMode !== "canonical" ||
    agentConfig.outputSchemaMode === "override" ||
    agentConfig.inputSchemaMode === "override" ||
    agentConfig.mode !== "standard" ||
    agentConfig.riskTier !== "limited" ||
    agentConfig.temperature !== 0.2 ||
    agentConfig.effort !== "medium" ||
    Boolean(agent.toolNames && agentConfig.enabledTools && agentConfig.enabledTools.length !== agent.toolNames.length);

  const isHyperparametersModified =
    agentConfig.temperature !== 0.2 ||
    agentConfig.effort !== "medium" ||
    agentConfig.mode !== "standard" ||
    agentConfig.riskTier !== "limited" ||
    Boolean(agent.toolNames && agentConfig.enabledTools && agentConfig.enabledTools.length !== agent.toolNames.length);

  const isPromptOrSchemaModified =
    agentConfig.promptMode !== "canonical" ||
    agentConfig.outputSchemaMode === "override" ||
    agentConfig.inputSchemaMode === "override";

  const lineCount = localInput.split("\n").length;

  // Resolve os detalhes de configuração para um lado do teste A/B
  const resolveSide = (id: string): { name: string; config?: AgentCharacteristicsConfig } => {
    if (id === "canonical") {
      return {
        name: "Original (Oficial SDLC)",
        config: undefined,
      };
    }
    if (id === "active") {
      return {
        name: "Configuração Atual (Personalizada)",
        config: agentConfig,
      };
    }
    const saved = savedAgentVersions.find((v) => v.id === id);
    if (saved) {
      return {
        name: saved.name,
        config: saved.config,
      };
    }
    return {
      name: "Customizado",
      config: agentConfig,
    };
  };

  const handleSwapSides = () => {
    const prevA = sideAId;
    setSideAId(sideBId);
    setSideBId(prevA);
  };

  const handleExecuteAB = () => {
    if (!onRunAB) return;
    flushInput(localInput);
    const sideA = resolveSide(sideAId);
    const sideB = resolveSide(sideBId);
    onRunAB(sideA, sideB);
  };

  const handleProfileSelect = (val: string) => {
    if (onActiveProfileChange) {
      onActiveProfileChange(val);
    } else {
      setLocalActiveProfileId(val);
    }
    if (val === "canonical") {
      if (onSelectAgentVersion) onSelectAgentVersion("canonical");
    } else if (val === "active") {
      if (onSelectAgentVersion) onSelectAgentVersion("active");
    } else {
      const saved = savedAgentVersions.find((v) => v.id === val);
      if (saved) {
        if (onAgentConfigChange) onAgentConfigChange(saved.config);
        if (onSelectAgentVersion) onSelectAgentVersion(saved.id);
      }
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── TOP BAR: Versão do Agente, Presets, Cenários e Ajustar ──── */}
      <div
        style={{
          padding: "6px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          gap: 10,
          background: "var(--bg-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {/* Seletor de Versão do Agente (Perfil Ativo) */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Versão:
            </span>
            <select
              value={activeProfile}
              onChange={(e) => {
                if (e.target.value === "__create_new__") {
                  if (onOpenCreateAgent) {
                    onOpenCreateAgent();
                  } else if (onOpenConfig) {
                    onOpenConfig();
                  }
                  return;
                }
                handleProfileSelect(e.target.value);
              }}
              style={{
                background: "var(--bg-surface-stage)",
                color: "var(--text-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "3px 6px",
                fontSize: 11,
                outline: "none",
                cursor: "pointer",
                maxWidth: 145,
                textOverflow: "ellipsis",
              }}
            >
              <option value="canonical">Original (Oficial SDLC)</option>
              <option value="active">
                Configuração Atual {isConfigModified ? "(Personalizada)" : "(Padrão)"}
              </option>
              {savedAgentVersions.length > 0 && (
                <optgroup label="Versões Customizadas Salvas">
                  {savedAgentVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__create_new__">➕ Criar Novo Agente / Salvar Versão...</option>
            </select>

            {/* Botão de Editar Agente Personalizado quando uma versão salva estiver ativa */}
            {activeProfile !== "canonical" &&
              activeProfile !== "active" &&
              savedAgentVersions.some((v) => v.id === activeProfile) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (onEditAgentVersion) {
                      onEditAgentVersion(activeProfile);
                    } else if (onOpenConfig) {
                      onOpenConfig();
                    }
                  }}
                  className="h-6 text-[11px] px-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-800/50 gap-1 font-medium"
                  title="Editar este agente personalizado sem precisar criar um novo"
                >
                  <Edit3 size={11} />
                  <span>Editar Agente</span>
                </Button>
              )}
          </div>

          {/* Seletor Unificado de Cenários (Presets Padrão + Cenários Salvos) */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Cenário:
            </span>
            <select
              value={selectedScenarioKey}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedScenarioKey(val);
                handleSelectScenario(val);
              }}
              style={{
                background: "var(--bg-surface-stage)",
                color: "var(--text-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "3px 6px",
                fontSize: 11,
                outline: "none",
                cursor: "pointer",
                maxWidth: 165,
                textOverflow: "ellipsis",
              }}
              title="Carregar um cenário de teste padrão (preset) ou cenário personalizado salvo"
            >
              <option value="">Escolher cenário...</option>
              {inputJson.trim() !== "" && (
                <option value="__clear__">🧹 Limpar (Entrada Vazia)</option>
              )}
              {agent.presets && agent.presets.length > 0 && (
                <optgroup label="Cenários Padrão (Presets)">
                  {agent.presets.map((p) => (
                    <option key={p.id} value={`preset:${p.id}`}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>
              )}
              {savedScenarios.length > 0 && (
                <optgroup label="Cenários Salvos (Personalizados)">
                  {savedScenarios.map((s) => (
                    <option key={s.id} value={`saved:${s.id}`}>
                      {s.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSaveModal}
            className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-200"
            title="Salvar entrada atual e configurações como um Cenário de Teste (JSON)"
          >
            <BookmarkPlus className="h-3 w-3 mr-1 text-emerald-400" />
            <span>Salvar Cenário</span>
          </Button>
        </div>

        {/* Ação à Direita: Botão Ampliar / Restaurar em Pop-up (Fixado no topo direito) */}
        {onToggleMaximize && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, alignSelf: "flex-start" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleMaximize}
              className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                isMaximized
                  ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40"
                  : "border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-white hover:border-zinc-700"
              }`}
              title={
                isMaximized
                  ? "Restaurar tamanho normal do editor (Esc)"
                  : "Ampliar editor de entrada em um pop-up maior para melhor visualização e edição"
              }
            >
              {isMaximized ? (
                <>
                  <Minimize2 size={12} className="text-cyan-400" />
                  <span>Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 size={12} className="text-cyan-400" />
                  <span>Ampliar</span>
                </>
              )}
            </Button>
            {isMaximized && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMaximize}
                className="h-7 w-7 rounded-full text-zinc-400 hover:text-white"
                title="Fechar pop-up ampliado (Esc)"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── BARRA DE COMPARAÇÃO A/B FLEXÍVEL (Sempre em linha única) ── */}
      <div
        style={{
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface-stage)",
          flexWrap: "nowrap",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <ArrowLeftRight size={12} className="text-cyan-400" />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            Comparação A/B:
          </span>
        </div>

        {/* Lado A */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: "1 1 0",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              flexShrink: 0,
              fontFamily: "var(--font-mono)",
            }}
            title="Lado A (Base de Comparação)"
          >
            A
          </span>
          <select
            value={sideAId}
            onChange={(e) => setSideAId(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              background: "rgba(15, 23, 42, 0.7)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 6px",
              fontSize: 11,
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
              textOverflow: "ellipsis",
            }}
            title="Escolha a versão do agente para o Lado A (Base de Comparação)"
          >
            <option value="canonical">Original (Oficial SDLC)</option>
            <option value="active">Config Atual (Personalizada)</option>
            {savedAgentVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botão Swap A ⟷ B */}
        <button
          onClick={handleSwapSides}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            flexShrink: 0,
            transition: "all 0.15s ease",
          }}
          title="Inverter Lado A ⟷ Lado B"
        >
          <ArrowLeftRight size={11} className="hover:text-white transition-colors" />
        </button>

        {/* Lado B */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: "1 1 0",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(52, 211, 153, 0.15)",
              color: "#34d399",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              flexShrink: 0,
              fontFamily: "var(--font-mono)",
            }}
            title="Lado B (Candidato de Teste)"
          >
            B
          </span>
          <select
            value={sideBId}
            onChange={(e) => setSideBId(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              background: "rgba(15, 23, 42, 0.7)",
              color: "#34d399",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 6px",
              fontSize: 11,
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
              textOverflow: "ellipsis",
            }}
            title="Escolha a versão do agente para o Lado B (Candidato de Teste)"
          >
            <option value="active">Config Atual (Personalizada)</option>
            <option value="canonical">Original (Oficial SDLC)</option>
            {savedAgentVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── HEADER IDENTIFICADOR DO EDITOR: INPUT ──────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 14px",
          background: "var(--bg-surface-stage)",
          borderBottom: "1px solid var(--border-subtle)",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Code size={12} className="text-indigo-400" />
          <span style={{ fontWeight: 700, color: "var(--text-main)", letterSpacing: "0.04em", fontSize: 11 }}>
            INPUT SPEC (Payload de Entrada JSON)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
          <span>{lineCount} linhas</span>
          <span>{localInput.length} chars</span>
        </div>
      </div>

      {/* ── EDITOR BODY: 100% focado no input.json ───────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
        className={isShaking ? "shake-error" : ""}
      >
        <textarea
          value={localInput}
          onChange={handleTextareaChange}
          onBlur={() => flushInput(localInput)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (e.shiftKey) {
                handleExecuteAB();
              } else {
                handleRunClick();
              }
            }
          }}
          placeholder={`{\n  // Cole ou digite o JSON de entrada para o agente, ou escolha um cenário acima...\n}`}
          className="code-editor"
          spellCheck={false}
          style={{
            flex: 1,
            borderRadius: 0,
            border: "none",
            height: "100%",
          }}
        />

        {/* Validation Errors Popup if invalid */}
        {validationStatus && !validationStatus.valid && validationStatus.errors && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(239, 68, 68, 0.08)",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              fontSize: 11,
              color: "#fca5a5",
              maxHeight: 90,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, marginBottom: 2 }}>
              <AlertTriangle size={13} className="text-rose-400" />
              <span>Inconformidade com o schema Zod do agente:</span>
            </div>
            {validationStatus.errors.map((err, i) => (
              <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 10, marginLeft: 19 }}>
                • <b>{err.path}:</b> {err.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM ACTION FOOTER: Validação e Botões de Execução ─────── */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Botão Formatar JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormat}
            className="h-7 px-2.5 text-xs text-zinc-300 border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
            title="Formatar indentação do JSON atual"
          >
            <Code className="h-3 w-3 mr-1 text-cyan-400" />
            <span>Formatar</span>
          </Button>

          {/* Botão Validar Schema */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidateClick}
            className="h-7 px-2.5 text-xs text-zinc-300 border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
            title="Validar JSON contra o inputSchema Zod do agente"
          >
            <CheckCircle2 className="h-3 w-3 mr-1 text-zinc-400" />
            <span>Validar Schema</span>
          </Button>

          {validationStatus && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, marginLeft: 4 }}>
              {validationStatus.valid ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-emerald)" }}>
                  <Check size={11} className="p10-success-icon" />
                  <span style={{ fontWeight: 500, fontSize: 11 }}>Válido</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-rose)" }}>
                  <AlertTriangle size={11} />
                  <span style={{ fontWeight: 500, fontSize: 11 }}>{validationStatus.errors?.length || 1} erro(s)</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Botão de Teste A/B Flexível */}
          {onRunAB && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecuteAB}
              disabled={isRunning || isRunningAB}
              className="h-7 gap-1.5 px-2.5 text-xs text-zinc-200 border-zinc-700 hover:border-zinc-500 bg-zinc-800/80"
              title="Executa a comparação A/B entre as versões selecionadas acima (Ctrl+Shift+Enter)"
            >
              {isRunningAB ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeftRight className="h-3 w-3 text-cyan-400" />}
              <span>Executar A/B</span>
              <kbd style={{ fontSize: 9, opacity: 0.6, fontFamily: "var(--font-mono)", marginLeft: 2 }}>
                Ctrl+⇧+↵
              </kbd>
            </Button>
          )}

          {/* Botão de Execução Simples */}
          <Button
            size="sm"
            onClick={handleRunClick}
            disabled={isRunning || isRunningAB}
            className="h-7 gap-1.5 px-3 text-xs font-semibold bg-zinc-100 text-zinc-900 hover:bg-white"
            title="Executar o agente com a entrada e configuração ativa (Ctrl+Enter)"
          >
            {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
            <span>Executar</span>
            <kbd style={{ fontSize: 9, opacity: 0.7, fontFamily: "var(--font-mono)", marginLeft: 2 }}>
              Ctrl+↵
            </kbd>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const InputEditor = React.memo(InputEditorComponent);
