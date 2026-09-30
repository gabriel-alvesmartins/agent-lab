import React, { useState, useEffect } from "react";
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Eye,
  Code,
  HelpCircle,
  Cpu,
  Braces,
  FileJson,
  X,
} from "lucide-react";
import { MermaidViewer } from "../MermaidViewer.js";
import { Button } from "../ui/button.js";
import { Badge } from "../ui/badge.js";

interface ArchitecturePanelProps {
  output: any;
}

interface JsonModalData {
  isOpen: boolean;
  title: string;
  category: "ADR" | "Componente" | "Risco" | "Questão" | "Geral";
  formattedJson: string;
  rawString?: string;
}

export const ArchitecturePanel: React.FC<ArchitecturePanelProps> = ({ output }) => {
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedContainer, setCopiedContainer] = useState(false);
  const [modalData, setModalData] = useState<JsonModalData | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<"object" | "raw">("object");
  const [modalCopied, setModalCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!modalData?.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalData(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalData?.isOpen]);

  if (!output || typeof output !== "object") {
    return <div style={{ padding: 16, color: "var(--text-muted)" }}>Nenhuma saída estruturada disponível.</div>;
  }

  const {
    summary,
    decisions = [],
    components = [],
    risks = [],
    c4Context,
    c4Container,
    open_questions = [],
  } = output;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openJsonModal = (data: {
    title: string;
    category: "ADR" | "Componente" | "Risco" | "Questão" | "Geral";
    formattedJson: string;
    rawString?: string;
  }) => {
    setModalData({ isOpen: true, ...data });
    setModalActiveTab("object");
    setModalCopied(false);
  };

  const handleModalCopy = () => {
    if (!modalData) return;
    const textToCopy =
      modalActiveTab === "raw" && modalData.rawString
        ? modalData.rawString
        : modalData.formattedJson;
    navigator.clipboard.writeText(textToCopy);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "2px" }}>
      {/* Executive Summary */}
      {summary && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)", marginBottom: 6 }}>
            Sumário Executivo
          </h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-main)" }}>{summary}</p>
        </div>
      )}

      {/* C4 Mermaid Diagrams: Code View + Interactive Graphic View */}
      {(c4Context || c4Container) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {c4Context && (
            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Layers size={14} className="text-indigo-400" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>
                    C4 Nível 1: System Context
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(c4Context, setCopiedContext)}
                  className="h-6 px-2 text-xs"
                  title="Copiar código Mermaid"
                >
                  {copiedContext ? <Check size={11} className="text-emerald-400 mr-1" /> : <Copy size={11} className="mr-1" />}
                  <span>{copiedContext ? "Copiado!" : "Copiar Mermaid"}</span>
                </Button>
              </div>

              {/* Code View */}
              <div style={{ marginBottom: 12 }}>
                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 10,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    maxHeight: 160,
                    overflowY: "auto",
                    color: "#a5b4fc",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {c4Context}
                </pre>
              </div>

              {/* Interactive Visual Mermaid Rendering with Expand Modal */}
              <MermaidViewer
                chart={c4Context}
                id="c4-context-diagram"
                title="C4 Nível 1: System Context (FleetPulse)"
              />
            </div>
          )}

          {c4Container && (
            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Layers size={14} className="text-cyan-400" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>
                    C4 Nível 2: Containers Macro
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(c4Container, setCopiedContainer)}
                  className="h-6 px-2 text-xs"
                  title="Copiar código Mermaid"
                >
                  {copiedContainer ? <Check size={11} className="text-emerald-400 mr-1" /> : <Copy size={11} className="mr-1" />}
                  <span>{copiedContainer ? "Copiado!" : "Copiar Mermaid"}</span>
                </Button>
              </div>

              {/* Code View */}
              <div style={{ marginBottom: 12 }}>
                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 10,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    maxHeight: 160,
                    overflowY: "auto",
                    color: "#7dd3fc",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {c4Container}
                </pre>
              </div>

              {/* Interactive Visual Mermaid Rendering with Expand Modal */}
              <MermaidViewer
                chart={c4Container}
                id="c4-container-diagram"
                title="C4 Nível 2: Containers Macro (FleetPulse)"
              />
            </div>
          )}
        </div>
      )}

      {/* ADRs - Architectural Decision Records */}
      {decisions.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-amber)" }}>
              Decisões Arquiteturais (ADRs — {decisions.length})
            </h4>
            <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>
              Clique em "Visualizar JSON" para abrir o modal de inspeção e cópia do item
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {decisions.map((dec: any, idx: number) => {
              let titlePart = "";
              let metaParts: string[] = [];
              let parsedObject: Record<string, any> = {};
              let rawString = "";

              if (typeof dec === "object" && dec !== null) {
                titlePart = dec.id ? `${dec.id}: ${dec.title || dec.name || ""}` : (dec.title || dec.name || JSON.stringify(dec));
                parsedObject = dec;
                rawString = JSON.stringify(dec, null, 2);
              } else {
                rawString = String(dec);
                const parts = rawString.split(" | ");
                titlePart = parts[0] || rawString;
                metaParts = parts.slice(1);

                const idMatch = titlePart.match(/^(AD-\d+|[A-Z0-9_-]+):\s*(.*)$/);
                parsedObject = {
                  ...(idMatch ? { id: idMatch[1], title: idMatch[2] } : { title: titlePart }),
                };

                for (const mp of metaParts) {
                  const [k, ...v] = mp.split(": ");
                  const val = v.join(": ");
                  if (k === "reversible") {
                    parsedObject[k] = val === "true";
                  } else {
                    parsedObject[k] = val;
                  }
                }
              }

              const formattedJson = JSON.stringify(parsedObject, null, 2);

              return (
                <div key={idx} className="glass-card" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)", lineHeight: 1.4 }}>
                      {titlePart}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        openJsonModal({
                          title: titlePart,
                          category: "ADR",
                          formattedJson,
                          rawString,
                        })
                      }
                      className="h-6 px-2 text-[11px] gap-1.5 shrink-0 text-zinc-300"
                      title="Visualizar JSON desta decisão arquitetural"
                    >
                      <Braces size={12} className="text-amber-400" />
                      <span>Visualizar JSON</span>
                    </Button>
                  </div>

                  {typeof dec === "object" && dec !== null ? (
                    <>
                      {dec.rationale && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          <b>Rationale:</b> {dec.rationale}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", fontSize: 11 }}>
                        {dec.quality_driver && (
                          <span style={{ color: "var(--text-subtle)" }}>Driver: <b style={{ color: "var(--text-main)" }}>{dec.quality_driver}</b></span>
                        )}
                        {dec.reversible !== undefined && (
                          <span style={{ color: dec.reversible ? "var(--accent-emerald)" : "var(--accent-rose)", fontWeight: 600 }}>
                            {dec.reversible ? "Reversível" : "Irreversível"}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                      {metaParts.map((mp, pIdx) => {
                        const [k, ...v] = mp.split(": ");
                        const val = v.join(": ");
                        const isReversible = k === "reversible" && val === "true";
                        const isIrreversible = k === "reversible" && val === "false";

                        return (
                          <div key={pIdx} style={{ fontSize: 12, display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ color: "var(--text-subtle)", fontWeight: 600, textTransform: "capitalize" }}>
                              {k}:
                            </span>
                            <span
                              style={{
                                color: isReversible
                                  ? "var(--accent-emerald)"
                                  : isIrreversible
                                  ? "var(--accent-rose)"
                                  : "var(--text-muted)",
                                fontWeight: isReversible || isIrreversible ? 600 : 400,
                              }}
                            >
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Software Components */}
      {components.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)" }}>
              Componentes de Software ({components.length})
            </h4>
            <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>
              Clique em "Visualizar JSON" para abrir o modal de inspeção e cópia do componente
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
            {components.map((comp: any, idx: number) => {
              let titlePart = "";
              let descPart = "";
              let depsPart = "";
              let parsedObject: Record<string, any> = {};
              let rawString = "";

              if (typeof comp === "object" && comp !== null) {
                titlePart = comp.id ? `${comp.id}: ${comp.name || comp.title}` : (comp.name || comp.title);
                descPart = comp.description || "";
                parsedObject = comp;
                rawString = JSON.stringify(comp, null, 2);
              } else {
                rawString = String(comp);
                const parts = rawString.split(" | ");
                titlePart = parts[0] || rawString;
                descPart = parts[1] || "";
                depsPart = parts[2] || "";

                const idMatch = titlePart.match(/^(C-\d+|[A-Z0-9_-]+):\s*(.*)$/);
                parsedObject = {
                  id: idMatch ? idMatch[1] : titlePart,
                  name: idMatch ? idMatch[2] : titlePart,
                  ...(descPart ? { description: descPart } : {}),
                  ...(depsPart ? { dependencies: depsPart.replace(/^deps:\s*/, "") } : {}),
                };
              }

              const formattedJson = JSON.stringify(parsedObject, null, 2);

              return (
                <div key={idx} className="glass-card" style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text-main)" }}>
                      {titlePart}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        openJsonModal({
                          title: titlePart,
                          category: "Componente",
                          formattedJson,
                          rawString,
                        })
                      }
                      className="h-5 px-1.5 text-[10px] gap-1 shrink-0 text-zinc-300"
                      title="Visualizar JSON deste componente"
                    >
                      <Braces size={11} className="text-cyan-400" />
                      <span>Visualizar JSON</span>
                    </Button>
                  </div>
                  {descPart && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{descPart}</p>}
                  {depsPart && (
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-subtle)", marginTop: 4 }}>
                      {depsPart}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Structural Risks & Mitigation */}
      {risks.length > 0 && (
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-rose)", marginBottom: 8 }}>
            Riscos Arquiteturais & Mitigação ({risks.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {risks.map((risk: any, idx: number) => {
              const rawString = typeof risk === "string" ? risk : JSON.stringify(risk, null, 2);
              let parsedObject: Record<string, any> = {};

              if (typeof risk === "string") {
                const parts = risk.split(" | ");
                parsedObject = {
                  risk: parts[0] || risk,
                  ...(parts[1] ? { severity: parts[1] } : {}),
                  ...(parts[2] ? { mitigation: parts[2].replace(/^mitigation:\s*/, "") } : {}),
                };
              } else {
                parsedObject = risk;
              }

              const formattedJson = JSON.stringify(parsedObject, null, 2);
              const titlePart = parsedObject.risk || (typeof risk === "string" ? risk : `Risco ${idx + 1}`);

              return (
                <div key={idx} className="glass-card" style={{ padding: "10px 12px", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
                      <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                      <span style={{ fontSize: 12, color: "var(--text-main)", lineHeight: 1.5 }}>
                        {rawString}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        openJsonModal({
                          title: titlePart,
                          category: "Risco",
                          formattedJson,
                          rawString,
                        })
                      }
                      className="h-5 px-1.5 text-[10px] gap-1 shrink-0 text-zinc-300"
                      title="Visualizar JSON deste risco"
                    >
                      <Braces size={11} className="text-rose-400" />
                      <span>Visualizar JSON</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Questions */}
      {open_questions.length > 0 && (
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-violet)", marginBottom: 8 }}>
            Questões em Aberto ({open_questions.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {open_questions.map((q: any, idx: number) => {
              const rawString = typeof q === "string" ? q : JSON.stringify(q, null, 2);
              const parsedObject = {
                id: `Q-${idx + 1}`,
                question: rawString,
              };
              const formattedJson = JSON.stringify(parsedObject, null, 2);

              return (
                <div key={idx} className="glass-card" style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <HelpCircle size={14} className="text-indigo-400 shrink-0" />
                    <span style={{ fontSize: 12, color: "var(--text-main)" }}>
                      {rawString}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      openJsonModal({
                        title: `Questão ${idx + 1}`,
                        category: "Questão",
                        formattedJson,
                        rawString,
                      })
                    }
                    className="h-5 px-1.5 text-[10px] gap-1 shrink-0 text-zinc-300"
                    title="Visualizar JSON desta questão em aberto"
                  >
                    <Braces size={11} className="text-indigo-400" />
                    <span>Visualizar JSON</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL POP-UP: VISUALIZADOR DE JSON DO COMPONENTE / ITEM ────── */}
      {modalData?.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setModalData(null)}
        >
          <div
            style={{
              width: "90vw",
              maxWidth: "760px",
              maxHeight: "86vh",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-medium)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Pop-up */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-elevated)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-amber)",
                  }}
                >
                  <FileJson size={15} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                      {modalData.title}
                    </h3>
                    <Badge variant="outline" size="xs" className="border-zinc-700 text-zinc-400">
                      {modalData.category}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                    JSON correspondente no contrato estruturado de saída do agente
                  </p>
                </div>
              </div>

              {/* Botão de Copiar JSON & Fechar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleModalCopy}
                  className="h-7 px-3 text-xs gap-1.5"
                  title="Copiar JSON para a área de transferência"
                >
                  {modalCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{modalCopied ? "Copiado!" : "Copiar JSON"}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setModalData(null)}
                  className="h-7 w-7 text-zinc-400 hover:text-white"
                  title="Fechar (Esc)"
                >
                  <X size={15} />
                </Button>
              </div>
            </div>

            {/* Alternador de visualização se houver rawString diferente */}
            {modalData.rawString && modalData.rawString !== modalData.formattedJson && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 18px",
                  background: "var(--bg-surface-stage)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-subtle)" }}>
                  Formato de Exibição:
                </span>
                <div className="p16-tab-container">
                  <button
                    onClick={() => setModalActiveTab("object")}
                    className={`p16-tab-trigger ${modalActiveTab === "object" ? "active" : ""}`}
                  >
                    <Braces size={11} />
                    <span>Objeto JSON Estruturado</span>
                  </button>
                  <button
                    onClick={() => setModalActiveTab("raw")}
                    className={`p16-tab-trigger ${modalActiveTab === "raw" ? "active" : ""}`}
                  >
                    <Code size={11} />
                    <span>String Canônica no Schema</span>
                  </button>
                </div>
              </div>
            )}

            {/* Corpo do Pop-up com o JSON formatado */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 18px",
                background: "var(--bg-surface-stage)",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1.6,
                  color: modalActiveTab === "raw" ? "#7dd3fc" : "#a5b4fc",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {modalActiveTab === "raw" && modalData.rawString
                  ? modalData.rawString
                  : modalData.formattedJson}
              </pre>
            </div>

            {/* Rodapé informativo */}
            <div
              style={{
                padding: "8px 18px",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--text-subtle)",
              }}
            >
              <span>{modalActiveTab === "raw" ? "String pura armazenada no array canônico de saída" : "Objeto JSON serializado com chaves e tipos normalizados"}</span>
              <span>Pressione <kbd className="font-mono text-[10px]">Esc</kbd> para fechar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
