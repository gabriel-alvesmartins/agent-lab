import React from "react";
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, XCircle, AlertTriangle, Layers, FileCheck2 } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface AuditorPanelProps {
  output: any;
}

export const AuditorPanel: React.FC<AuditorPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhum parecer de auditoria ou stage-gate disponível.
      </div>
    );
  }

  const gateStatus = (output.gateStatus || output.verdict || "approved").toLowerCase();
  const summary = output.summary || output.rationale || "";
  const crossArtifactConsistency: any[] = output.crossArtifactConsistency || output.consistency || [];
  const gateChecklist: any[] = output.gateChecklist || output.checklist || [];
  const scannedCount = output.scannedArtifactsCount || output.artifactsScanned || 0;

  const getGateVerdict = () => {
    if (gateStatus === "approved" || gateStatus === "pass") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "var(--radius-sm)" }}>
          <ShieldCheck size={22} className="text-emerald-400" />
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
              Veredito do Stage-Gate SDLC
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-emerald)", margin: "1px 0 0 0" }}>
              GATE APROVADO — PRONTO PARA DEPLOY
            </h3>
          </div>
        </div>
      );
    }
    if (gateStatus === "conditional" || gateStatus === "warn") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "var(--radius-sm)" }}>
          <ShieldAlert size={22} className="text-amber-400" />
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
              Veredito do Stage-Gate SDLC
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-amber)", margin: "1px 0 0 0" }}>
              APROVAÇÃO CONDICIONAL — RESSALVAS PENDENTES
            </h3>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "var(--radius-sm)" }}>
        <AlertOctagon size={22} className="text-rose-400" />
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
            Veredito do Stage-Gate SDLC
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-rose)", margin: "1px 0 0 0" }}>
            GATE BLOQUEADO — NÃO CONFORME
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Stage-Gate Verdict Banner */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: summary ? 10 : 0 }}>
          {getGateVerdict()}

          {scannedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              <Layers size={14} className="text-cyan-400" />
              <span>Artefatos Auditados: <b style={{ color: "var(--text-main)" }}>{scannedCount}</b></span>
            </div>
          )}
        </div>

        {summary && (
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--text-main)", lineHeight: 1.5 }}>
            <b>Parecer Geral:</b> {summary}
          </p>
        )}
      </div>

      {/* Cross-Artifact Consistency Matrix */}
      {crossArtifactConsistency.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FileCheck2 size={16} className="text-cyan-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)" }}>
              Consistência Cruzada entre Artefatos ({crossArtifactConsistency.length})
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {crossArtifactConsistency.map((item: any, idx: number) => {
              const match = item.match ?? true;
              return (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    background: match ? "rgba(16, 185, 129, 0.04)" : "rgba(239, 68, 68, 0.06)",
                    border: match ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  {match ? (
                    <CheckCircle2 size={15} className="text-emerald-400" style={{ flexShrink: 0, marginTop: 2 }} />
                  ) : (
                    <XCircle size={15} className="text-rose-400" style={{ flexShrink: 0, marginTop: 2 }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                      <span style={{ color: "var(--text-main)" }}>{item.artifactA || "Artefato A"}</span>
                      <span style={{ color: "var(--text-subtle)" }}>⟷</span>
                      <span style={{ color: "var(--text-main)" }}>{item.artifactB || "Artefato B"}</span>
                    </div>

                    {item.notes && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: match ? "var(--text-muted)" : "var(--accent-rose)", lineHeight: 1.4 }}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gate Checklist */}
      {gateChecklist.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={16} className="text-emerald-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)" }}>
              Checklist de Requisitos do Gate ({gateChecklist.length})
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
            {gateChecklist.map((item: any, idx: number) => {
              const status = (item.status || "PASS").toUpperCase();
              const isPass = status === "PASS";
              const isWarn = status === "WARN";

              return (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  {isPass && <CheckCircle2 size={14} className="text-emerald-400" style={{ flexShrink: 0, marginTop: 2 }} />}
                  {isWarn && <AlertTriangle size={14} className="text-amber-400" style={{ flexShrink: 0, marginTop: 2 }} />}
                  {!isPass && !isWarn && <XCircle size={14} className="text-rose-400" style={{ flexShrink: 0, marginTop: 2 }} />}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                        {item.rule || `Regra #${idx + 1}`}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: isPass ? "var(--accent-emerald)" : isWarn ? "var(--accent-amber)" : "var(--accent-rose)",
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    {item.detail && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
