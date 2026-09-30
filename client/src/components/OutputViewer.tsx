import React, { useState, useEffect } from "react";
import {
  Layers,
  FileDiff,
  FileCode2,
  FileText,
  Activity,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Sparkles,
  Scale,
} from "lucide-react";
import { AgentExecutionResult, ABExecutionResult } from "../types.js";
import { ArchitecturePanel } from "./StructuredPanels/ArchitecturePanel.js";
import { SpecPanel } from "./StructuredPanels/SpecPanel.js";
import { DataModelPanel } from "./StructuredPanels/DataModelPanel.js";
import { QaPanel } from "./StructuredPanels/QaPanel.js";
import { TechLeadPanel } from "./StructuredPanels/TechLeadPanel.js";
import { GenericPanel } from "./StructuredPanels/GenericPanel.js";
import { DiffViewer } from "./DiffViewer.js";
import { ImpactAnalysisCard } from "./ImpactAnalysisCard.js";
import { StructuredInputPanel } from "./StructuredPanels/StructuredInputPanel.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";

interface OutputViewerProps {
  result: AgentExecutionResult | null;
  abResult?: ABExecutionResult | null;
  agentName: string;
  inputJson: string;
  expectedJson: string;
  isRunning: boolean;
  onPromoteV2?: (output: unknown) => void;
}

const THINKING_STEPS = [
  "Carregando persona e inputSchema do agente...",
  "Construindo prompt de sistema e ferramentas SDLC...",
  "Executando inferência e síntese do artefato...",
  "Validando conformidade de contrato Zod...",
  "Calculando métricas de latência e diff semântico...",
];

export const OutputViewer: React.FC<OutputViewerProps> = ({
  result,
  abResult,
  agentName,
  inputJson,
  expectedJson,
  isRunning,
  onPromoteV2,
}) => {
  const [activeTab, setActiveTab] = useState<
    "ab" | "panel" | "diff" | "json" | "markdown" | "metrics"
  >(abResult ? "ab" : "panel");
  const [panelViewMode, setPanelViewMode] = useState<"output" | "input">("output");
  const [copied, setCopied] = useState(false);
  const [abSelectedView, setAbSelectedView] = useState<"canonical" | "custom">("custom");
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Transitions.dev P28 Thinking Step Cycle & Timer
  useEffect(() => {
    if (!isRunning) {
      setThinkingIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    const stepInterval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 1400);

    return () => {
      clearInterval(timerInterval);
      clearInterval(stepInterval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (abResult) {
      setActiveTab("ab");
    }
  }, [abResult]);

  const effectiveResult: AgentExecutionResult | null = abResult
    ? abSelectedView === "custom"
      ? abResult.customResult
      : abResult.canonicalResult
    : result;

  const handleDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    if (effectiveResult?.output) {
      navigator.clipboard.writeText(JSON.stringify(effectiveResult.output, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Transitions.dev P28/P29 AI Agent Execution State View
  if (isRunning) {
    return (
      <div
        className="glass-card"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          position: "relative",
          background: "var(--bg-surface)",
        }}
      >
        {/* Matrix Dot Loader (Transitions.dev P33) */}
        <div style={{ marginBottom: 20 }}>
          <div className="p33-matrix-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="p33-matrix-dot" />
            ))}
          </div>
        </div>

        {/* Agent Name & Shimmering Status (Transitions.dev P28) */}
        <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", letterSpacing: "-0.01em" }}>
          Executando Agente {agentName}
        </h4>

        {/* Shimmer Sweep Text */}
        <p
          className="p28-thinking-shimmer"
          style={{
            fontSize: 12,
            marginTop: 6,
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 380,
            minHeight: 20,
          }}
        >
          {THINKING_STEPS[thinkingIndex]}
        </p>

        {/* Elapsed Timer Counter */}
        <div
          style={{
            marginTop: 16,
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-subtle)",
          }}
        >
          <span>Tempo decorrido: </span>
          <b style={{ color: "var(--text-main)" }}>{elapsedSeconds.toFixed(1)}s</b>
        </div>
      </div>
    );
  }

  // Estado Vazio (Aguardando Execução)
  if (!effectiveResult && !abResult) {
    return (
      <div
        className="glass-card"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          textAlign: "center",
          background: "var(--bg-surface)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-md)",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-subtle)",
            marginBottom: 14,
          }}
        >
          <Layers size={20} />
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
          Aguardando Execução
        </h4>
        <p style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 360, marginTop: 4 }}>
          Selecione um preset ou preencha a entrada à esquerda e clique em <b>Executar</b> (<kbd className="font-mono text-[10px]">Ctrl+↵</kbd>) ou <b>Executar A/B</b> para inspecionar os resultados.
        </p>
      </div>
    );
  }

  // Falha na Execução
  if (effectiveResult && !effectiveResult.success && !abResult) {
    return (
      <div className="glass-card" style={{ height: "100%", padding: 20, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-rose)", marginBottom: 12 }}>
          <AlertCircle size={18} />
          <h4 style={{ fontSize: 15, fontWeight: 600 }}>Falha na Execução do Agente</h4>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-main)", marginBottom: 12 }}>
          {effectiveResult.error}
        </p>
        {effectiveResult.validationErrors && (
          <div
            style={{
              background: "var(--bg-surface-stage)",
              padding: 12,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#fca5a5",
            }}
          >
            {effectiveResult.validationErrors.map((v, i) => (
              <div key={i}>• {v.path}: {v.message}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderStructuredPanel = () => {
    if (!effectiveResult?.output) return null;
    switch (agentName) {
      case "SolutionArchitect":
      case "SoftwareArchitect":
        return <ArchitecturePanel output={effectiveResult.output} />;
      case "PM":
        return <SpecPanel output={effectiveResult.output} />;
      case "DataArchitect":
        return <DataModelPanel output={effectiveResult.output} />;
      case "QA":
        return <QaPanel output={effectiveResult.output} />;
      case "TechLead":
        return <TechLeadPanel output={effectiveResult.output} />;
      default:
        return <GenericPanel output={effectiveResult.output} />;
    }
  };

  const hasExpectedOutput = expectedJson.trim().length > 10;

  return (
    <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Tabs: Transitions.dev P16 Sliding Tabs */}
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
        {/* Navigation Tabs */}
        <div className="p16-tab-container">
          {abResult && (
            <button
              className={`p16-tab-trigger ${activeTab === "ab" ? "active" : ""}`}
              onClick={() => setActiveTab("ab")}
            >
              <Scale size={12} className={activeTab === "ab" ? "text-amber-400" : "text-zinc-500"} />
              <span>Comparativo A/B</span>
            </button>
          )}

          <button
            className={`p16-tab-trigger ${activeTab === "panel" ? "active" : ""}`}
            onClick={() => setActiveTab("panel")}
          >
            <Layers size={12} className={activeTab === "panel" ? "text-indigo-400" : "text-zinc-500"} />
            <span>Estruturado</span>
          </button>

          {hasExpectedOutput && !abResult && (
            <button
              className={`p16-tab-trigger ${activeTab === "diff" ? "active" : ""}`}
              onClick={() => setActiveTab("diff")}
            >
              <FileDiff size={12} className={activeTab === "diff" ? "text-cyan-400" : "text-zinc-500"} />
              <span>Diff</span>
            </button>
          )}

          <button
            className={`p16-tab-trigger ${activeTab === "json" ? "active" : ""}`}
            onClick={() => setActiveTab("json")}
          >
            <FileCode2 size={12} className={activeTab === "json" ? "text-emerald-400" : "text-zinc-500"} />
            <span>JSON</span>
          </button>

          <button
            className={`p16-tab-trigger ${activeTab === "markdown" ? "active" : ""}`}
            onClick={() => setActiveTab("markdown")}
          >
            <FileText size={12} className={activeTab === "markdown" ? "text-zinc-300" : "text-zinc-500"} />
            <span>Artefato .md</span>
          </button>

          <button
            className={`p16-tab-trigger ${activeTab === "metrics" ? "active" : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            <Activity size={12} className={activeTab === "metrics" ? "text-violet-400" : "text-zinc-500"} />
            <span>Métricas</span>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {abResult && activeTab !== "ab" && (
            <div className="p16-tab-container">
              <button
                onClick={() => setAbSelectedView("canonical")}
                className={`p16-tab-trigger ${abSelectedView === "canonical" ? "active" : ""}`}
                style={{ padding: "3px 8px", fontSize: 11 }}
              >
                Oficial
              </button>
              <button
                onClick={() => setAbSelectedView("custom")}
                className={`p16-tab-trigger ${abSelectedView === "custom" ? "active" : ""}`}
                style={{ padding: "3px 8px", fontSize: 11 }}
              >
                {abResult?.versionBName || "Personalizado"}
              </button>
            </div>
          )}

          {/* Adotar Saída como Referência */}
          {abResult && onPromoteV2 && abResult.customResult?.output && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPromoteV2(abResult.customResult.output)}
              title="Definir a saída desta versão como a Saída Esperada (Referência) no editor de testes"
              className="h-7 px-2.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5"
            >
              <Check className="h-3 w-3 text-emerald-400" />
              <span>Adotar como Referência</span>
            </Button>
          )}

          {/* Copy Action */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyJson}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
            title="Copiar JSON de saída para área de transferência"
          >
            {copied ? <Check size={12} className="text-emerald-400 mr-1" /> : <Copy size={12} className="mr-1" />}
            <span>{copied ? "Copiado!" : "Copiar"}</span>
          </Button>

          {/* Download JSON */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              handleDownload(
                `${agentName.toLowerCase()}-output.json`,
                JSON.stringify(effectiveResult?.output || {}, null, 2),
                "application/json"
              )
            }
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
            title="Baixar JSON de saída"
          >
            <Download size={12} className="mr-1" />
            <span>JSON</span>
          </Button>

          {effectiveResult?.markdownRepresentation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleDownload(
                  `${agentName.toLowerCase()}-artifact.md`,
                  effectiveResult.markdownRepresentation || "",
                  "text/markdown"
                )
              }
              className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
              title="Baixar Markdown gerado"
            >
              <Download size={12} className="mr-1" />
              <span>.MD</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Mini-Bar with Transitions.dev P10 Pop Check */}
      {effectiveResult && (
        <div
          style={{
            padding: "5px 14px",
            background: "var(--bg-surface-stage)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 11,
            color: "var(--text-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={12} />
            <span>
              Latência: <b style={{ color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>{effectiveResult.elapsedMs}ms</b>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {effectiveResult.modeUsed === "fallback" ? (
              <Zap size={12} className="text-amber-400" />
            ) : (
              <Sparkles size={12} className="text-indigo-400" />
            )}
            <span>
              Modo:{" "}
              <b style={{ color: "var(--text-main)" }}>
                {effectiveResult.modeUsed === "fallback" ? "Offline (Mock)" : "LLM Real"}
              </b>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <CheckCircle2
              size={12}
              className={effectiveResult.outputValid ? "text-emerald-400 p10-success-icon" : "text-rose-400"}
            />
            <span>
              Schema Zod:{" "}
              <b style={{ color: effectiveResult.outputValid ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                {effectiveResult.outputValid ? "Validado" : "Inválido"}
              </b>
            </span>
          </div>

          {abResult && (
            <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
              Exibindo: <b style={{ color: abSelectedView === "custom" ? "var(--accent-emerald)" : "var(--accent-cyan)" }}>{abSelectedView === "custom" ? (abResult.versionBName || "Personalizado") : (abResult.versionAName || "Canônica")}</b>
            </div>
          )}
        </div>
      )}

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {/* ABA COMPARATIVO A/B */}
        {activeTab === "ab" && abResult && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>
            <ImpactAnalysisCard abResult={abResult} />
            <div style={{ flex: 1, minHeight: 450 }}>
              <DiffViewer
                actual={abResult.canonicalResult.output}
                expected={abResult.customResult.output}
                actualTitle={
                  abResult.versionAName
                    ? `Saída (Lado A): ${abResult.versionAName}`
                    : "Saída Canônica (Oficial SDLC)"
                }
                expectedTitle={
                  abResult.versionBName
                    ? `Saída (Lado B): ${abResult.versionBName}`
                    : "Saída Alternativa (Personalizada)"
                }
                actualBadge={abResult.versionAName || "Lado A (Oficial)"}
                expectedBadge={abResult.versionBName || "Lado B (Personalizado)"}
              />
            </div>
          </div>
        )}

        {activeTab === "panel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
              <div className="p16-tab-container">
                <button
                  onClick={() => setPanelViewMode("output")}
                  className={`p16-tab-trigger ${panelViewMode === "output" ? "active" : ""}`}
                >
                  <Layers size={12} className={panelViewMode === "output" ? "text-indigo-400" : "text-zinc-500"} />
                  <span>Saída Estruturada (Output)</span>
                </button>
                <button
                  onClick={() => setPanelViewMode("input")}
                  className={`p16-tab-trigger ${panelViewMode === "input" ? "active" : ""}`}
                >
                  <FileText size={12} className={panelViewMode === "input" ? "text-cyan-400" : "text-zinc-500"} />
                  <span>Entrada Estruturada (Input)</span>
                </button>
              </div>

              <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                {panelViewMode === "output" ? "Artefato gerado pelo agente" : "Especificação e requisitos de entrada"}
              </span>
            </div>

            {panelViewMode === "output" ? (
              renderStructuredPanel()
            ) : (
              <StructuredInputPanel inputJson={inputJson} />
            )}
          </div>
        )}

        {activeTab === "diff" && hasExpectedOutput && !abResult && (
          <DiffViewer actual={effectiveResult?.output} expected={JSON.parse(expectedJson || "{}")} />
        )}

        {activeTab === "json" && (
          <pre
            style={{
              background: "var(--bg-surface-stage)",
              padding: 14,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "#e4e4e7",
              lineHeight: 1.55,
              overflowX: "auto",
              margin: 0,
            }}
          >
            {JSON.stringify(effectiveResult?.output, null, 2)}
          </pre>
        )}

        {activeTab === "markdown" && (
          <pre
            style={{
              background: "var(--bg-surface-stage)",
              padding: 14,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "#e4e4e7",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowX: "auto",
              margin: 0,
            }}
          >
            {effectiveResult?.markdownRepresentation || "Nenhuma representação em Markdown disponível."}
          </pre>
        )}

        {activeTab === "metrics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Eventos de Auditoria Emitidos ({effectiveResult?.auditEvents?.length || 0})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {effectiveResult?.auditEvents?.map((ev, i) => (
                <div key={i} className="glass-card" style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--accent-indigo)" }}>
                      {ev.type}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                      {ev.timestamp}
                    </span>
                  </div>
                  {ev.payload && (
                    <pre style={{ margin: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", overflowX: "auto" }}>
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
