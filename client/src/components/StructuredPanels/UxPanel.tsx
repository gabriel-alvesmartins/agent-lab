import React, { useState } from "react";
import { Compass, Eye, CheckSquare, Layers, Code, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { MermaidViewer } from "../MermaidViewer.js";
import { Badge } from "../ui/badge.js";

interface UxPanelProps {
  output: any;
}

export const UxPanel: React.FC<UxPanelProps> = ({ output }) => {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhuma especificação de UX disponível.
      </div>
    );
  }

  const {
    userFlows = [],
    wireframes = [],
    designSystem,
    wcagChecklist = [],
    mermaidChart,
  } = output;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Mermaid Flowchart / User Flow Diagram if present */}
      {mermaidChart && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Compass size={18} className="text-cyan-400" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
              Fluxo Interativo de Navegação (Mermaid)
            </h3>
          </div>
          <MermaidViewer chart={mermaidChart} title="Fluxo UX FleetPulse" />
        </div>
      )}

      {/* User Flows Cards */}
      {userFlows.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Compass size={16} className="text-indigo-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-indigo)" }}>
              Fluxos de Navegação do Usuário ({userFlows.length})
            </h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {userFlows.map((flow: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent-indigo)" }}>
                      {flow.flowId || `FLOW-${idx + 1}`}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                      {flow.name || flow.title || "Fluxo de Usuário"}
                    </span>
                  </div>
                  {flow.personaId && (
                    <Badge variant="outline" size="xs" className="border-cyan-800 text-cyan-300">
                      Persona: {flow.personaId}
                    </Badge>
                  )}
                </div>

                {flow.happyPath && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
                    <b>Caminho Feliz:</b> {flow.happyPath}
                  </p>
                )}

                {/* Steps Timeline */}
                {flow.steps && flow.steps.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase" }}>Passos da Jornada:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 }}>
                      {flow.steps.map((step: any, sIdx: number) => (
                        <React.Fragment key={sIdx}>
                          <div
                            style={{
                              padding: "4px 8px",
                              background: "rgba(99, 102, 241, 0.1)",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: 11,
                              color: "var(--text-main)",
                            }}
                          >
                            <span style={{ color: "var(--accent-indigo)", fontWeight: 700, marginRight: 4 }}>{sIdx + 1}.</span>
                            {typeof step === "string" ? step : step.action || step.name}
                          </div>
                          {sIdx < flow.steps.length - 1 && <ArrowRight size={12} className="text-zinc-600" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wireframes with ASCII Layout */}
      {wireframes.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Eye size={16} className="text-cyan-400" />
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)" }}>
                Wireframes Estruturais ({wireframes.length})
              </h4>
            </div>

            {/* Screen Selector Tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {wireframes.map((wf: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveScreenIndex(idx)}
                  className={`btn btn-xs ${activeScreenIndex === idx ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: 11, padding: "2px 8px" }}
                >
                  {wf.name || wf.screenId || `Tela ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>

          {/* Current Wireframe ASCII Preview */}
          {wireframes[activeScreenIndex] && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                  {wireframes[activeScreenIndex].name || wireframes[activeScreenIndex].screenId}
                </span>
                {wireframes[activeScreenIndex].screenId && (
                  <Badge variant="outline" size="xs" className="font-mono border-zinc-700 text-zinc-400">
                    {wireframes[activeScreenIndex].screenId}
                  </Badge>
                )}
              </div>

              {wireframes[activeScreenIndex].asciiLayout && (
                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: 12,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#38bdf8",
                    lineHeight: 1.4,
                    overflowX: "auto",
                    whiteSpace: "pre",
                  }}
                >
                  {wireframes[activeScreenIndex].asciiLayout}
                </pre>
              )}

              {/* Screen Components */}
              {wireframes[activeScreenIndex].components && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase" }}>Componentes da Tela:</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {wireframes[activeScreenIndex].components.map((c: any, i: number) => (
                      <Badge key={i} variant="outline" size="xs" className="border-zinc-800 text-zinc-300">
                        {typeof c === "string" ? c : c.name || c.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WCAG Checklist & Design System Tokens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {/* WCAG Accessibility */}
        {wcagChecklist.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <CheckSquare size={15} className="text-emerald-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-emerald)" }}>
                Acessibilidade WCAG 2.1 AA ({wcagChecklist.length})
              </h5>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {wcagChecklist.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12 }}>
                  <CheckCircle2 size={13} className="text-emerald-400" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ color: "var(--text-main)", fontWeight: 500 }}>
                      {typeof item === "string" ? item : item.criterion || item.rule}
                    </span>
                    {item.notes && <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "var(--text-muted)" }}>{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Design System Tokens */}
        {designSystem && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Layers size={15} className="text-violet-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-violet)" }}>
                Tokens de Design System
              </h5>
            </div>
            <pre style={{ margin: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", overflowX: "auto" }}>
              {JSON.stringify(designSystem, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
