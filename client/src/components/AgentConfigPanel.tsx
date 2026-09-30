import React, { useState } from "react";
import {
  Sliders,
  SlidersHorizontal,
  RotateCcw,
  FileCode,
  Copy,
  Check,
  Database,
  Braces,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Columns,
  Maximize2,
  Eye,
  Zap,
  Sparkles,
  Wrench,
  PlusCircle,
  Lock,
} from "lucide-react";
import { AgentCharacteristicsConfig, AgentDetail } from "../types.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";

interface AgentConfigPanelProps {
  agent: AgentDetail;
  config: AgentCharacteristicsConfig;
  onChange: (config: AgentCharacteristicsConfig) => void;
  onReset: () => void;
  initialTab?: "prompt" | "output_schema" | "input_schema" | "inference";
  isReadOnly?: boolean;
  onRequestCloneToCustom?: () => void;
}

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  agent,
  config,
  onChange,
  onReset,
  initialTab = "prompt",
  isReadOnly = false,
  onRequestCloneToCustom,
}) => {
  const [subTab, setSubTab] = useState<"prompt" | "output_schema" | "input_schema" | "inference">(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setSubTab(initialTab);
    }
  }, [initialTab]);
  const [schemaViewMode, setSchemaViewMode] = useState<"split" | "custom_full" | "official_full">("split");
  const [inputSchemaViewMode, setInputSchemaViewMode] = useState<"split" | "custom_full" | "official_full">("split");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedOutputSchema, setCopiedOutputSchema] = useState(false);
  const [copiedInputSchema, setCopiedInputSchema] = useState(false);
  const [schemaJsonError, setSchemaJsonError] = useState<string | null>(null);
  const [inputSchemaJsonError, setInputSchemaJsonError] = useState<string | null>(null);

  const canonicalPrompt = agent.canonicalPrompt || "";
  const canonicalOutputSchemaStr = agent.outputSchemaJson
    ? JSON.stringify(agent.outputSchemaJson, null, 2)
    : "{\n  \"type\": \"object\",\n  \"properties\": {}\n}";
  const canonicalInputSchemaStr = agent.inputSchemaJson
    ? JSON.stringify(agent.inputSchemaJson, null, 2)
    : "{\n  \"type\": \"object\",\n  \"properties\": {}\n}";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(canonicalPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyOutputSchema = () => {
    navigator.clipboard.writeText(canonicalOutputSchemaStr);
    setCopiedOutputSchema(true);
    setTimeout(() => setCopiedOutputSchema(false), 2000);
  };

  const handleCopyInputSchema = () => {
    navigator.clipboard.writeText(canonicalInputSchemaStr);
    setCopiedInputSchema(true);
    setTimeout(() => setCopiedInputSchema(false), 2000);
  };

  const handleLoadCanonicalSchemaToCustom = () => {
    onChange({
      ...config,
      outputSchemaMode: "override",
      outputSchemaOverride: canonicalOutputSchemaStr,
    });
    setSchemaJsonError(null);
  };

  const handleCustomSchemaChange = (value: string) => {
    try {
      if (value.trim()) {
        JSON.parse(value);
      }
      setSchemaJsonError(null);
    } catch (err: any) {
      setSchemaJsonError(err.message);
    }
    onChange({
      ...config,
      outputSchemaOverride: value,
    });
  };

  const handleLoadCanonicalInputSchemaToCustom = () => {
    onChange({
      ...config,
      inputSchemaMode: "override",
      inputSchemaOverride: canonicalInputSchemaStr,
    });
    setInputSchemaJsonError(null);
  };

  const handleCustomInputSchemaChange = (value: string) => {
    try {
      if (value.trim()) {
        JSON.parse(value);
      }
      setInputSchemaJsonError(null);
    } catch (err: any) {
      setInputSchemaJsonError(err.message);
    }
    onChange({
      ...config,
      inputSchemaOverride: value,
    });
  };

  const isCustomized =
    config.promptMode !== "canonical" ||
    config.outputSchemaMode === "override" ||
    config.inputSchemaMode === "override" ||
    config.temperature !== 0.2 ||
    config.effort !== "medium" ||
    config.mode !== "standard" ||
    (agent.toolNames && config.enabledTools && config.enabledTools.length !== agent.toolNames.length);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        userSelect: "none",
      }}
    >
      {/* Header bar com Navegação de Sub-Abas em Pílula Deslizante */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "var(--bg-surface-stage)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sliders size={15} className="text-indigo-400" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
            Configuração do Agente
          </span>
          {isCustomized && (
            <Badge variant="warning" size="xs">
              Modificado
            </Badge>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Transitions.dev P16 Sliding Tabs Pill */}
          <div className="p16-tab-container">
            <button
              onClick={() => setSubTab("prompt")}
              className={`p16-tab-trigger ${subTab === "prompt" ? "active" : ""}`}
            >
              <FileCode size={12} className={subTab === "prompt" ? "text-indigo-400" : "text-zinc-500"} />
              <span>Prompt & Persona</span>
            </button>
            <button
              onClick={() => setSubTab("output_schema")}
              className={`p16-tab-trigger ${subTab === "output_schema" ? "active" : ""}`}
            >
              <Braces size={12} className={subTab === "output_schema" ? "text-emerald-400" : "text-zinc-500"} />
              <span>Contrato de Saída</span>
            </button>
            <button
              onClick={() => setSubTab("input_schema")}
              className={`p16-tab-trigger ${subTab === "input_schema" ? "active" : ""}`}
            >
              <Database size={12} className={subTab === "input_schema" ? "text-cyan-400" : "text-zinc-500"} />
              <span>Contrato de Entrada</span>
            </button>
            <button
              onClick={() => setSubTab("inference")}
              className={`p16-tab-trigger ${subTab === "inference" ? "active" : ""}`}
            >
              <SlidersHorizontal size={12} className={subTab === "inference" ? "text-amber-400" : "text-zinc-500"} />
              <span>Hiperparâmetros & Inferência</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs border-zinc-800 text-zinc-300 hover:text-white"
            title="Restaurar prompt e schemas para os valores originais da plataforma"
          >
            <RotateCcw size={11} className="mr-1.5 text-zinc-400" />
            <span>Restaurar Fábrica</span>
          </Button>
        </div>
      </div>

      {/* Banner de Bloqueio se for Agente Oficial SDLC */}
      {isReadOnly && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={14} className="text-indigo-400" />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>
                Agente Oficial SDLC 1.1 (Modo Somente Leitura)
              </span>
              <p style={{ fontSize: 11, color: "var(--text-subtle)", margin: 0 }}>
                Os prompts, contratos e hiperparâmetros oficiais são imutáveis para garantir conformidade de arquitetura. Para editar, crie uma versão personalizada.
              </p>
            </div>
          </div>

          {onRequestCloneToCustom && (
            <Button
              size="sm"
              onClick={onRequestCloneToCustom}
              className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
            >
              <Copy size={12} className="mr-1.5" />
              <span>Personalizar Cópia</span>
            </Button>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ABA 1: PROMPT & PERSONA TUNING                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {subTab === "prompt" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileCode size={15} className="text-indigo-400" />
                <h4
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-main)",
                  }}
                >
                  Prompt de Sistema do Agente (System Prompt)
                </h4>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-subtle)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {canonicalPrompt.length} caracteres no canônico
              </span>
            </div>

            {/* Toolbar simplificada: Status do Prompt e Ações */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--bg-surface-stage)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-subtle)" }}>
                  Status:
                </span>
                {isReadOnly ? (
                  <Badge variant="secondary" size="xs">
                    🔒 Oficial SDLC (Imutável)
                  </Badge>
                ) : config.promptMode === "override" && config.promptOverride && config.promptOverride !== canonicalPrompt ? (
                  <Badge variant="warning" size="xs">
                    ✎ Prompt Personalizado Ativo
                  </Badge>
                ) : (
                  <Badge variant="default" size="xs">
                    ✓ Prompt Canônico Oficial
                  </Badge>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="h-6 px-2 text-xs"
                  title="Copiar prompt atual"
                >
                  {copiedPrompt ? <Check size={11} className="text-emerald-400 mr-1" /> : <Copy size={11} className="mr-1" />}
                  <span>{copiedPrompt ? "Copiado!" : "Copiar"}</span>
                </Button>

                {!isReadOnly && config.promptMode === "override" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onChange({
                        ...config,
                        promptMode: "canonical",
                        promptOverride: "",
                        promptAppend: "",
                      });
                    }}
                    className="h-6 px-2 text-xs text-amber-400 hover:text-amber-300"
                    title="Restaurar o prompt original de fábrica da plataforma"
                  >
                    <RotateCcw size={11} className="mr-1" />
                    <span>Restaurar Oficial</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Editor de Prompt Unificado e Direto */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {isReadOnly
                    ? "Visualização do prompt canônico oficial (somente leitura):"
                    : config.promptMode === "override" && config.promptOverride && config.promptOverride !== canonicalPrompt
                    ? "Edite livremente abaixo (modifique trechos, acrescente diretivas ao final ou reescreva tudo):"
                    : "Prompt canônico carregado. Digite ou altere o texto abaixo para personalizar:"}
                </span>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-subtle)" }}>
                  {(config.promptMode === "override" && config.promptOverride !== undefined && config.promptOverride !== "" ? config.promptOverride : canonicalPrompt).length} caracteres
                </span>
              </div>

              <textarea
                className="code-editor"
                value={config.promptMode === "override" && config.promptOverride !== undefined && config.promptOverride !== "" ? config.promptOverride : canonicalPrompt}
                onChange={(e) => {
                  if (isReadOnly) return;
                  onChange({
                    ...config,
                    promptMode: "override",
                    promptOverride: e.target.value,
                  });
                }}
                readOnly={isReadOnly}
                rows={18}
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  minHeight: 380,
                  opacity: isReadOnly ? 0.9 : 1,
                  cursor: isReadOnly ? "default" : "text",
                }}
                placeholder="Digite as instruções e diretivas para este agente..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ABA 2: CONTRATO DE SAÍDA (OUTPUT SCHEMA) — AMPLO          */}
      {/* ────────────────────────────────────────────────────────── */}
      {subTab === "output_schema" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Toolbar de visualização e modo de saída */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 12px",
              background: "var(--bg-surface-stage)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {/* View Mode Toggle: Split vs Custom Full vs Official Full */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
                Layout:
              </span>
              <div className="p16-tab-container">
                <button
                  onClick={() => setSchemaViewMode("split")}
                  className={`p16-tab-trigger ${schemaViewMode === "split" ? "active" : ""}`}
                >
                  <Columns size={11} />
                  <span>Dividido (Lado a Lado)</span>
                </button>
                <button
                  onClick={() => setSchemaViewMode("custom_full")}
                  className={`p16-tab-trigger ${schemaViewMode === "custom_full" ? "active" : ""}`}
                >
                  <Maximize2 size={11} />
                  <span>Editor Personalizado (Tela Ampla)</span>
                </button>
                <button
                  onClick={() => setSchemaViewMode("official_full")}
                  className={`p16-tab-trigger ${schemaViewMode === "official_full" ? "active" : ""}`}
                >
                  <Eye size={11} />
                  <span>Oficial (Somente Leitura)</span>
                </button>
              </div>
            </div>

            {/* Mode selection for agent execution: Canonical vs Override */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Button
                variant={config.outputSchemaMode !== "override" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onChange({ ...config, outputSchemaMode: "canonical" })}
                className="h-6 px-2 text-xs"
              >
                Usar Oficial
              </Button>
              <Button
                variant={config.outputSchemaMode === "override" ? "accent" : "ghost"}
                size="sm"
                onClick={() => {
                  if (!config.outputSchemaOverride) {
                    handleLoadCanonicalSchemaToCustom();
                  } else {
                    onChange({ ...config, outputSchemaMode: "override" });
                  }
                }}
                className="h-6 px-2.5 text-xs text-emerald-400"
              >
                ✎ Ativar Personalizado
              </Button>
            </div>
          </div>

          {/* Grid or Full Width Views */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                schemaViewMode === "split"
                  ? "1fr 1fr"
                  : "1fr",
              gap: 14,
            }}
          >
            {/* LADO ESQUERDO: OFICIAL (PLATAFORMA SDLC) */}
            {(schemaViewMode === "split" || schemaViewMode === "official_full") && (
              <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Database size={14} className="text-zinc-400" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                      Output Schema Oficial
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyOutputSchema}
                      className="h-6 px-2 text-xs"
                      title="Copiar schema oficial"
                    >
                      {copiedOutputSchema ? <Check size={10} className="text-emerald-400 mr-1" /> : <Copy size={10} className="mr-1" />}
                      <span>Copiar</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLoadCanonicalSchemaToCustom}
                      className="h-6 px-2 text-xs text-indigo-400"
                      title="Carrega este schema oficial no editor customizado"
                    >
                      <span>Copiar para Customizado</span>
                      <ArrowRight size={10} className="ml-1" />
                    </Button>
                  </div>
                </div>

                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    height: schemaViewMode === "official_full" ? 480 : 380,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.45,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {canonicalOutputSchemaStr}
                </pre>
              </div>
            )}

            {/* LADO DIREITO: ALTERNATIVO (CUSTOMIZADO) */}
            {(schemaViewMode === "split" || schemaViewMode === "custom_full") && (
              <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Braces size={14} className="text-emerald-400" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                      Output Schema Alternativo (Personalizado)
                    </span>
                    {config.outputSchemaMode === "override" && (
                      <Badge variant="success" size="xs">
                        Ativo para Teste A/B
                      </Badge>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {schemaJsonError ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-rose)", fontSize: 11 }}>
                        <AlertCircle size={12} />
                        <span>JSON Inválido</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-emerald)", fontSize: 11 }}>
                        <CheckCircle2 size={12} />
                        <span>JSON Válido</span>
                      </div>
                    )}
                  </div>
                </div>

                {config.outputSchemaMode !== "override" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 32,
                      textAlign: "center",
                      gap: 10,
                      background: "var(--bg-surface-stage)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      height: schemaViewMode === "custom_full" ? 480 : 380,
                    }}
                  >
                    <Braces size={28} className="text-zinc-600 opacity-60" />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                      Usando Output Schema Oficial de Fábrica
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 320 }}>
                      Deseja adicionar novos campos estruturados ou testar um formato alternativo de saída para o agente?
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLoadCanonicalSchemaToCustom}
                      className="mt-2 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <span>Copiar Oficial e Começar Edição</span>
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <textarea
                      className="code-editor"
                      value={config.outputSchemaOverride || ""}
                      onChange={(e) => handleCustomSchemaChange(e.target.value)}
                      placeholder="Cole aqui o JSON Schema de saída modificado..."
                      rows={schemaViewMode === "custom_full" ? 22 : 18}
                      style={{ fontSize: 12, height: schemaViewMode === "custom_full" ? 440 : 350 }}
                      spellCheck={false}
                    />

                    {schemaJsonError && (
                      <div style={{ fontSize: 11, color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
                        Erro de sintaxe: {schemaJsonError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ABA 3: CONTRATO DE ENTRADA (INPUT SCHEMA) — AMPLO          */}
      {/* ────────────────────────────────────────────────────────── */}
      {subTab === "input_schema" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Toolbar de visualização e modo de entrada */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 12px",
              background: "var(--bg-surface-stage)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {/* View Mode Toggle: Split vs Custom Full vs Official Full */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
                Layout:
              </span>
              <div className="p16-tab-container">
                <button
                  onClick={() => setInputSchemaViewMode("split")}
                  className={`p16-tab-trigger ${inputSchemaViewMode === "split" ? "active" : ""}`}
                >
                  <Columns size={11} />
                  <span>Dividido (Lado a Lado)</span>
                </button>
                <button
                  onClick={() => setInputSchemaViewMode("custom_full")}
                  className={`p16-tab-trigger ${inputSchemaViewMode === "custom_full" ? "active" : ""}`}
                >
                  <Maximize2 size={11} />
                  <span>Editor Personalizado (Tela Ampla)</span>
                </button>
                <button
                  onClick={() => setInputSchemaViewMode("official_full")}
                  className={`p16-tab-trigger ${inputSchemaViewMode === "official_full" ? "active" : ""}`}
                >
                  <Eye size={11} />
                  <span>Oficial (Somente Leitura)</span>
                </button>
              </div>
            </div>

            {/* Mode selection for input schema: Canonical vs Override */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Button
                variant={config.inputSchemaMode !== "override" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onChange({ ...config, inputSchemaMode: "canonical" })}
                className="h-6 px-2 text-xs"
              >
                Usar Oficial
              </Button>
              <Button
                variant={config.inputSchemaMode === "override" ? "accent" : "ghost"}
                size="sm"
                onClick={() => {
                  if (!config.inputSchemaOverride) {
                    handleLoadCanonicalInputSchemaToCustom();
                  } else {
                    onChange({ ...config, inputSchemaMode: "override" });
                  }
                }}
                className="h-6 px-2.5 text-xs text-cyan-400"
              >
                ✎ Ativar Personalizado
              </Button>
            </div>
          </div>

          {/* Grid or Full Width Views */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                inputSchemaViewMode === "split"
                  ? "1fr 1fr"
                  : "1fr",
              gap: 14,
            }}
          >
            {/* LADO ESQUERDO: OFICIAL (PLATAFORMA SDLC) */}
            {(inputSchemaViewMode === "split" || inputSchemaViewMode === "official_full") && (
              <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Database size={14} className="text-zinc-400" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                      Input Schema Oficial
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyInputSchema}
                      className="h-6 px-2 text-xs"
                      title="Copiar schema oficial"
                    >
                      {copiedInputSchema ? <Check size={10} className="text-emerald-400 mr-1" /> : <Copy size={10} className="mr-1" />}
                      <span>Copiar</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLoadCanonicalInputSchemaToCustom}
                      className="h-6 px-2 text-xs text-cyan-400"
                      title="Carrega este schema oficial no editor customizado"
                    >
                      <span>Copiar para Customizado</span>
                      <ArrowRight size={10} className="ml-1" />
                    </Button>
                  </div>
                </div>

                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    height: inputSchemaViewMode === "official_full" ? 480 : 380,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.45,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {canonicalInputSchemaStr}
                </pre>
              </div>
            )}

            {/* LADO DIREITO: ALTERNATIVO (CUSTOMIZADO) */}
            {(inputSchemaViewMode === "split" || inputSchemaViewMode === "custom_full") && (
              <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Braces size={14} className="text-cyan-400" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                      Input Schema Alternativo (Personalizado)
                    </span>
                    {config.inputSchemaMode === "override" && (
                      <Badge variant="success" size="xs">
                        Ativo para Execução
                      </Badge>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {inputSchemaJsonError ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-rose)", fontSize: 11 }}>
                        <AlertCircle size={12} />
                        <span>JSON Inválido</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-emerald)", fontSize: 11 }}>
                        <CheckCircle2 size={12} />
                        <span>JSON Válido</span>
                      </div>
                    )}
                  </div>
                </div>

                {config.inputSchemaMode !== "override" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 32,
                      background: "var(--bg-surface-stage)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px dashed var(--border-medium)",
                      height: inputSchemaViewMode === "custom_full" ? 480 : 380,
                      textAlign: "center",
                      gap: 12,
                    }}
                  >
                    <Database size={32} className="text-zinc-600 opacity-60" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        Nenhum Input Schema customizado ativo
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 360, marginTop: 4 }}>
                        Ao ativar o schema customizado, você pode redefinir os campos aceitos, obrigatoriedades e tipagens para validar entradas no workbench e testar resiliência contratual.
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLoadCanonicalInputSchemaToCustom}
                      className="text-xs text-cyan-400 gap-1.5"
                    >
                      <span>Copiar Schema Oficial e Iniciar Edição</span>
                      <ArrowRight size={12} />
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                        Edite o JSON Schema de entrada que validará o workbench deste agente:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadCanonicalInputSchemaToCustom}
                        className="h-5 px-1.5 text-[10px] text-zinc-400 hover:text-white"
                        title="Sobrescrever com o schema oficial de fábrica"
                      >
                        Recarregar Oficial
                      </Button>
                    </div>

                    <textarea
                      className="code-editor"
                      value={config.inputSchemaOverride || ""}
                      onChange={(e) => handleCustomInputSchemaChange(e.target.value)}
                      placeholder="Cole aqui o JSON Schema de entrada modificado..."
                      rows={inputSchemaViewMode === "custom_full" ? 22 : 18}
                      style={{ fontSize: 12, height: inputSchemaViewMode === "custom_full" ? 440 : 350 }}
                      spellCheck={false}
                    />

                    {inputSchemaJsonError && (
                      <div style={{ fontSize: 11, color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
                        Erro de sintaxe: {inputSchemaJsonError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ABA 4: INFERÊNCIA & PARÂMETROS                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {subTab === "inference" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header do painel de inferência */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <SlidersHorizontal size={16} className="text-amber-400" />
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-main)" }}>
                Hiperparâmetros de Inferência, Raciocínio & Ferramentas
              </h4>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 750 }}>
              Controle fino sobre estocasticidade, profundidade do raciocínio interno (extended thinking), modo de rigor e tools expostas para testar a adaptabilidade do modelo de IA.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 14 }}>
            {/* Card 1: Temperatura de Amostragem */}
            <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={15} className="text-indigo-400" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                    Temperatura (0.0 — 1.0)
                  </span>
                </div>
                <Badge
                  variant={config.temperature > 0.7 ? "warning" : config.temperature < 0.4 ? "default" : "secondary"}
                  size="xs"
                >
                  {config.temperature.toFixed(2)}
                </Badge>
              </div>

              <p style={{ fontSize: 11, color: "var(--text-subtle)", margin: 0 }}>
                Valores menores produzem respostas mais reprodutíveis e determinísticas; valores maiores estimulam criatividade e soluções alternativas em arquitetura e design.
              </p>

              {/* Slider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>0.0</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    !isReadOnly && onChange({
                      ...config,
                      temperature: Number.parseFloat(e.target.value),
                    })
                  }
                  style={{
                    flex: 1,
                    accentColor: "var(--accent-indigo, #6366f1)",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    opacity: isReadOnly ? 0.6 : 1,
                  }}
                />
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>1.0</span>
              </div>

              {/* Quick Presets */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                <Button
                  variant={config.temperature === 0.2 ? "secondary" : "outline"}
                  size="sm"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, temperature: 0.2 })}
                  className="h-6 px-2 text-[10px]"
                  title="Determinístico: ideal para classificação de risco e triagem"
                >
                  0.2 (Estrito)
                </Button>
                <Button
                  variant={config.temperature === 0.3 ? "secondary" : "outline"}
                  size="sm"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, temperature: 0.3 })}
                  className="h-6 px-2 text-[10px]"
                  title="Alta Precisão: recomendado para DataArchitect, Compliance e Auditor"
                >
                  0.3 (Precisão)
                </Button>
                <Button
                  variant={config.temperature === 0.7 ? "secondary" : "outline"}
                  size="sm"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, temperature: 0.7 })}
                  className="h-6 px-2 text-[10px]"
                  title="Padrão Arquitetural: recomendado para SolutionArchitect, PM e TechLead"
                >
                  0.7 (Arquitetura)
                </Button>
                <Button
                  variant={config.temperature === 1.0 ? "secondary" : "outline"}
                  size="sm"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, temperature: 1.0 })}
                  className="h-6 px-2 text-[10px]"
                  title="Criativo: recomendado para Discovery, UX e UI"
                >
                  1.0 (Criativo)
                </Button>
              </div>
            </div>

            {/* Card 2: Esforço de Raciocínio (Extended Thinking) */}
            <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Zap size={15} className="text-amber-400" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                    Esforço de Raciocínio (Reasoning Effort)
                  </span>
                </div>
                <Badge variant="outline" size="xs">
                  {config.effort}
                </Badge>
              </div>

              <p style={{ fontSize: 11, color: "var(--text-subtle)", margin: 0 }}>
                Controla a cota de tokens dedicada à cadeia de pensamento oculta (Extended Thinking) antes da síntese do artefato JSON.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, effort: "low" })}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${config.effort === "low" ? "var(--accent-cyan, #06b6d4)" : "var(--border-subtle)"}`,
                    background: config.effort === "low" ? "rgba(6, 182, 212, 0.12)" : "var(--bg-surface-stage)",
                    color: config.effort === "low" ? "var(--text-main)" : "var(--text-muted)",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    opacity: isReadOnly ? 0.6 : 1,
                    textAlign: "center",
                    transition: "all var(--duration-quick)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Low</div>
                  <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 2 }}>Latência rápida (UI/UX)</div>
                </button>

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, effort: "medium" })}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${config.effort === "medium" ? "var(--accent-indigo, #6366f1)" : "var(--border-subtle)"}`,
                    background: config.effort === "medium" ? "rgba(99, 102, 241, 0.15)" : "var(--bg-surface-stage)",
                    color: config.effort === "medium" ? "var(--text-main)" : "var(--text-muted)",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    opacity: isReadOnly ? 0.6 : 1,
                    textAlign: "center",
                    transition: "all var(--duration-quick)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Medium</div>
                  <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 2 }}>Equilibrado (Padrão)</div>
                </button>

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && onChange({ ...config, effort: "high" })}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${config.effort === "high" ? "var(--accent-purple, #a855f7)" : "var(--border-subtle)"}`,
                    background: config.effort === "high" ? "rgba(168, 85, 247, 0.15)" : "var(--bg-surface-stage)",
                    color: config.effort === "high" ? "var(--text-main)" : "var(--text-muted)",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    opacity: isReadOnly ? 0.6 : 1,
                    textAlign: "center",
                    transition: "all var(--duration-quick)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>High</div>
                  <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 2 }}>Análise exaustiva</div>
                </button>
              </div>
            </div>

            {/* Card 3: Modo de Rigor da Plataforma (Mode) */}
            <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Eye size={15} className="text-emerald-400" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                    Modo de Execução da Plataforma
                  </span>
                </div>
                <Badge variant="outline" size="xs">
                  {config.mode}
                </Badge>
              </div>

              <p style={{ fontSize: 11, color: "var(--text-subtle)", margin: 0 }}>
                Interpola no cabeçalho do prompt do framework (`(modo: ${config.mode})`), ditando a postura da persona do agente.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
                {(["standard", "thorough", "fast"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => !isReadOnly && onChange({ ...config, mode: m })}
                    style={{
                      padding: "8px 6px",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${config.mode === m ? "var(--accent-emerald, #10b981)" : "var(--border-subtle)"}`,
                      background: config.mode === m ? "rgba(16, 185, 129, 0.12)" : "var(--bg-surface-stage)",
                      color: config.mode === m ? "var(--text-main)" : "var(--text-muted)",
                      cursor: isReadOnly ? "not-allowed" : "pointer",
                      opacity: isReadOnly ? 0.6 : 1,
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

            {/* Card 4: Ferramentas Habilitadas (Tools) */}
            <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Wrench size={15} className="text-cyan-400" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                    Ferramentas Registradas (Tools)
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                  {config.enabledTools?.length || 0} ativas
                </span>
              </div>

              <p style={{ fontSize: 11, color: "var(--text-subtle)", margin: 0 }}>
                Habilite ou desabilite tools individuais que o agente tem permissão de chamar em tempo de execução.
              </p>

              {agent.toolNames && agent.toolNames.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  {agent.toolNames.map((tool) => {
                    const isChecked = config.enabledTools?.includes(tool) ?? true;
                    return (
                      <label
                        key={tool}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "var(--text-main)",
                          padding: "6px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-surface-stage)",
                          border: "1px solid var(--border-subtle)",
                          cursor: isReadOnly ? "not-allowed" : "pointer",
                          opacity: isReadOnly ? 0.7 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isReadOnly}
                          onChange={(e) => {
                            if (isReadOnly) return;
                            const current = config.enabledTools || [];
                            const updated = e.target.checked
                              ? [...current, tool]
                              : current.filter((t) => t !== tool);
                            onChange({ ...config, enabledTools: updated });
                          }}
                          style={{ accentColor: "var(--accent-cyan, #06b6d4)", cursor: isReadOnly ? "not-allowed" : "pointer" }}
                        />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{tool}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: "12px",
                    background: "var(--bg-surface-stage)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--border-subtle)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textAlign: "center",
                  }}
                >
                  Este agente opera por síntese contextual direta (não requer ferramentas auxiliares externas).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
