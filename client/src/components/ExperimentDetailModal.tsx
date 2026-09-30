import React, { useState } from "react";
import {
  X,
  Scale,
  Code,
  FileText,
  Sliders,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ExperimentRecord, ABExecutionResult, AgentExecutionResult } from "../types.js";
import { ImpactAnalysisCard } from "./ImpactAnalysisCard.js";
import { DiffViewer } from "./DiffViewer.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";

interface ExperimentDetailModalProps {
  experiment: ExperimentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoWorkbench?: (exp: ExperimentRecord) => void;
}

export const ExperimentDetailModal: React.FC<ExperimentDetailModalProps> = ({
  experiment,
  isOpen,
  onClose,
  onLoadIntoWorkbench,
}) => {
  const [activeTab, setActiveTab] = useState<"ab" | "input" | "prompts" | "raw">("ab");
  const [copiedInput, setCopiedInput] = useState(false);

  if (!isOpen || !experiment) return null;

  const versionAName = experiment.versionAName || "Oficial SDLC";
  const versionBName = experiment.versionBName || "Personalizado";

  const syntheticAbResult: ABExecutionResult = {
    success: experiment.canonicalResult.success && experiment.customResult.success,
    agentName: experiment.agentId,
    experimentId: experiment.id,
    versionAName,
    versionBName,
    canonicalResult: {
      agentName: experiment.agentId,
      success: experiment.canonicalResult.success,
      output: experiment.canonicalResult.output,
      elapsedMs: experiment.canonicalResult.elapsedMs,
      outputValid: experiment.canonicalResult.outputValid,
      outputValidationErrors: experiment.canonicalResult.outputValidationErrors as any,
      markdownRepresentation: experiment.canonicalResult.markdown,
      error: experiment.canonicalResult.error,
    },
    customResult: {
      agentName: experiment.agentId,
      success: experiment.customResult.success,
      output: experiment.customResult.output,
      elapsedMs: experiment.customResult.elapsedMs,
      outputValid: experiment.customResult.outputValid,
      outputValidationErrors: experiment.customResult.outputValidationErrors as any,
      markdownRepresentation: experiment.customResult.markdown,
      error: experiment.customResult.error,
    },
    diffSummary: experiment.diffSummary,
  };

  const formattedInputJson = JSON.stringify(experiment.input, null, 2);

  const handleCopyInput = () => {
    navigator.clipboard.writeText(formattedInputJson);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const dateStr = new Date(experiment.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
          maxWidth: 1280,
          height: "92vh",
          maxHeight: 950,
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
        {/* Header do Modal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <Scale size={18} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>
                  {experiment.title}
                </h3>
                <Badge variant="outline" size="xs" className="border-zinc-700 text-zinc-400 font-mono">
                  {experiment.agentId}
                </Badge>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-subtle)",
                  }}
                >
                  {dateStr}
                </span>
              </div>

              {/* Versões Confrontadas */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "#38bdf8", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  Lado A: {versionAName}
                </span>
                <span style={{ color: "var(--text-subtle)", fontSize: 11 }}>⟷</span>
                <span style={{ fontSize: 11, color: "#34d399", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  Lado B: {versionBName}
                </span>
                <span style={{ color: "var(--text-subtle)", fontSize: 11, marginLeft: 8 }}>
                  • Modelo: {experiment.modelId.replace("anthropic:", "")} ({experiment.mode.toUpperCase()})
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onLoadIntoWorkbench && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoadIntoWorkbench(experiment);
                  onClose();
                }}
                className="h-8 text-xs border-indigo-700/60 text-indigo-300 hover:text-white bg-indigo-950/20"
                title="Carregar este experimento e sua entrada no workbench principal"
              >
                <ExternalLink size={13} className="mr-1.5 text-indigo-400" />
                <span>Carregar no Workbench</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div
          style={{
            padding: "8px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-stage)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="p16-tab-container">
            <button
              onClick={() => setActiveTab("ab")}
              className={`p16-tab-trigger ${activeTab === "ab" ? "active" : ""}`}
            >
              <Scale size={12} className={activeTab === "ab" ? "text-cyan-400" : "text-zinc-500"} />
              <span>Comparativo A/B & Impacto</span>
            </button>
            <button
              onClick={() => setActiveTab("input")}
              className={`p16-tab-trigger ${activeTab === "input" ? "active" : ""}`}
            >
              <Code size={12} className={activeTab === "input" ? "text-indigo-400" : "text-zinc-500"} />
              <span>Entrada Utilizada (input.json)</span>
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`p16-tab-trigger ${activeTab === "prompts" ? "active" : ""}`}
            >
              <Sliders size={12} className={activeTab === "prompts" ? "text-emerald-400" : "text-zinc-500"} />
              <span>Prompts & Contratos</span>
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`p16-tab-trigger ${activeTab === "raw" ? "active" : ""}`}
            >
              <FileText size={12} className={activeTab === "raw" ? "text-amber-400" : "text-zinc-500"} />
              <span>Saídas Brutas JSON</span>
            </button>
          </div>

          <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
            ID: {experiment.id}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {/* ABA 1: COMPARATIVO A/B */}
          {activeTab === "ab" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ImpactAnalysisCard abResult={syntheticAbResult} />
              <div style={{ minHeight: 460 }}>
                <DiffViewer
                  actual={experiment.canonicalResult.output}
                  expected={experiment.customResult.output}
                  actualTitle={`Saída (Lado A): ${versionAName}`}
                  expectedTitle={`Saída (Lado B): ${versionBName}`}
                  actualBadge={versionAName}
                  expectedBadge={versionBName}
                />
              </div>
            </div>
          )}

          {/* ABA 2: ENTRADA UTILIZADA */}
          {activeTab === "input" && (
            <div className="glass-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Code size={16} className="text-indigo-400" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                    JSON de Entrada Enviado para Ambos os Agentes
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                    {formattedInputJson.split("\n").length} linhas • {formattedInputJson.length} chars
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyInput}
                    className="h-7 px-2.5 text-xs"
                  >
                    {copiedInput ? <Check size={12} className="text-emerald-400 mr-1" /> : <Copy size={12} className="mr-1" />}
                    <span>{copiedInput ? "Copiado!" : "Copiar Entrada"}</span>
                  </Button>
                </div>
              </div>

              <pre
                style={{
                  background: "var(--bg-surface-stage)",
                  padding: 16,
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-main)",
                  maxHeight: 560,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {formattedInputJson}
              </pre>
            </div>
          )}

          {/* ABA 3: PROMPTS & CONTRATOS */}
          {activeTab === "prompts" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Lado A Config */}
              <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8" }}>
                    Lado A: {versionAName}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    Prompt Utilizado:
                  </span>
                  <pre
                    style={{
                      background: "var(--bg-surface-stage)",
                      padding: 12,
                      borderRadius: "var(--radius-sm)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      maxHeight: 400,
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.45,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {experiment.canonicalConfig.prompt || "(Prompt padrão de fábrica)"}
                  </pre>
                </div>
              </div>

              {/* Lado B Config */}
              <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>
                    Lado B: {versionBName}
                  </span>
                  <Badge variant="secondary" size="xs">
                    Modo: {experiment.customConfig.promptMode || "canonical"}
                  </Badge>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    Prompt Customizado / Efetivo:
                  </span>
                  <pre
                    style={{
                      background: "var(--bg-surface-stage)",
                      padding: 12,
                      borderRadius: "var(--radius-sm)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-main)",
                      maxHeight: 400,
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.45,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {experiment.customConfig.promptOverride ||
                      experiment.customConfig.promptAppend ||
                      "(Mesmo prompt do Lado A)"}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: SAÍDAS BRUTAS JSON */}
          {activeTab === "raw" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>
                  JSON Saída Lado A ({versionAName})
                </span>
                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    maxHeight: 520,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {JSON.stringify(experiment.canonicalResult.output, null, 2)}
                </pre>
              </div>

              <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}>
                  JSON Saída Lado B ({versionBName})
                </span>
                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    maxHeight: 520,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {JSON.stringify(experiment.customResult.output, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
