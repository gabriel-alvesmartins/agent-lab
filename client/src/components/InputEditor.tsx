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
  onOpenLibrary?: (tab?: "agents" | "presets") => void;
  onOpenCreateAgent?: () => void;
}

export const InputEditor: React.FC<InputEditorProps> = ({
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
  onOpenLibrary,
  onOpenCreateAgent,
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [sideAId, setSideAId] = useState<string>("canonical");
  const [sideBId, setSideBId] = useState<string>("active");
  const [activeProfileId, setActiveProfileId] = useState<string>("active");

  // Formatador JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(inputJson);
      onInputChange(JSON.stringify(parsed, null, 2));
    } catch {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = agent.presets.find((p) => p.id === presetId);
    if (preset) {
      onInputChange(JSON.stringify(preset.input, null, 2));
      if (preset.expectedOutput && onExpectedChange) {
        onExpectedChange(JSON.stringify(preset.expectedOutput, null, 2));
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

  const lineCount = inputJson.split("\n").length;

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
    const sideA = resolveSide(sideAId);
    const sideB = resolveSide(sideBId);
    onRunAB(sideA, sideB);
  };

  const handleProfileSelect = (val: string) => {
    setActiveProfileId(val);
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
          padding: "8px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          background: "var(--bg-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Seletor de Versão do Agente (Perfil Ativo) */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Versão:
            </span>
            <select
              value={activeProfileId}
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
          </div>

          {/* Preset Select */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Preset:
            </span>
            <select
              onChange={(e) => handleSelectPreset(e.target.value)}
              defaultValue=""
              style={{
                background: "var(--bg-surface-stage)",
                color: "var(--text-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "3px 6px",
                fontSize: 11,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                Escolher preset...
              </option>
              {agent.presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Saved Scenarios Select */}
          {savedScenarios.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
                Salvos:
              </span>
              <select
                onChange={(e) => {
                  const scn = savedScenarios.find((s) => s.id === e.target.value);
                  if (scn) onLoadScenario(scn);
                }}
                defaultValue=""
                style={{
                  background: "var(--bg-surface-stage)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "3px 6px",
                  fontSize: 11,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="" disabled>
                  Cenários ({savedScenarios.length})...
                </option>
                {savedScenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSaveModal}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
            title="Salvar entrada atual e configurações como um Cenário de Teste (JSON)"
          >
            <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
            <span>Salvar Cenário</span>
          </Button>
        </div>
      </div>

      {/* ── BARRA DE COMPARAÇÃO A/B FLEXÍVEL ───────────────────────── */}
      <div
        style={{
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface-stage)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 2 }}>
            <ArrowLeftRight size={12} className="text-zinc-400" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Comparação A/B:
            </span>
          </div>

          {/* Seletor Lado A */}
          <select
            value={sideAId}
            onChange={(e) => setSideAId(e.target.value)}
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 6px",
              fontSize: 11,
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
            }}
            title="Escolha a versão do agente para o Lado A (Base de Comparação)"
          >
            <option value="canonical">Lado A: Original (Oficial SDLC)</option>
            <option value="active">Lado A: Config Atual (Personalizada)</option>
            {savedAgentVersions.map((v) => (
              <option key={v.id} value={v.id}>
                Lado A: {v.name}
              </option>
            ))}
          </select>

          {/* Botão Swap A ⟷ B */}
          <button
            onClick={handleSwapSides}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
            }}
            title="Inverter Lado A e Lado B"
          >
            <ArrowLeftRight size={12} className="hover:text-white transition-colors" />
          </button>

          {/* Seletor Lado B */}
          <select
            value={sideBId}
            onChange={(e) => setSideBId(e.target.value)}
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              color: "#34d399",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 6px",
              fontSize: 11,
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
            }}
            title="Escolha a versão do agente para o Lado B (Candidato de Teste)"
          >
            <option value="active">Lado B: Config Atual (Personalizada)</option>
            <option value="canonical">Lado B: Original (Oficial SDLC)</option>
            {savedAgentVersions.map((v) => (
              <option key={v.id} value={v.id}>
                Lado B: {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Info de Linhas e Chars */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
          <span>{lineCount} linhas</span>
          <span>{inputJson.length} chars</span>
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
        <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>
          Edite a entrada do teste isolado ou comparação
        </span>
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
          value={inputJson}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="{\n  // Cole ou digite o JSON de entrada para o agente...\n}"
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
            onClick={onValidate}
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
            onClick={onRun}
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
