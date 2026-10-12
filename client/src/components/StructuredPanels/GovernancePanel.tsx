import React from "react";
import { ShieldAlert, ShieldCheck, Scale, AlertTriangle, FileCheck2, Database, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface GovernancePanelProps {
  output: any;
  agentName?: string;
}

export const GovernancePanel: React.FC<GovernancePanelProps> = ({ output, agentName }) => {
  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhum dado de governança e risco disponível.
      </div>
    );
  }

  // Detect Tier and Rationale
  const tier = output.tier || output.preliminaryTier || "limited";
  const score = output.score ?? output.iso27005Score;
  const rationale = output.rationale || output.justification || output.summary;
  const mandatoryControls: any[] = output.mandatoryControls || output.controls || [];
  const regulatoryFrameworks: any[] = output.regulatoryFrameworks || output.frameworks || [];
  const sensitiveDataCategories: string[] = output.sensitiveDataCategories || output.sensitiveData || [];
  const rawRisks: any[] = output.rawRisks || output.risks || [];

  const getTierColor = (t: string) => {
    switch (t?.toLowerCase()) {
      case "critical":
        return { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#f87171", label: "CRÍTICO (Tier 1)" };
      case "high":
        return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", label: "ALTO (Tier 2)" };
      case "limited":
        return { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#60a5fa", label: "LIMITADO (Tier 3)" };
      case "minimal":
      default:
        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#34d399", label: "MÍNIMO (Tier 4)" };
    }
  };

  const tierStyle = getTierColor(tier);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Tier Classification Banner */}
      <div
        className="glass-card"
        style={{
          padding: 18,
          border: `1px solid ${tierStyle.border}`,
          background: tierStyle.bg,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={22} style={{ color: tierStyle.text }} />
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
                Classificação de Risco Regulatória & Operacional
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: tierStyle.text, margin: "2px 0 0 0" }}>
                {tierStyle.label}
              </h3>
            </div>
          </div>

          {score !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0, 0, 0, 0.3)", padding: "4px 10px", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Score ISO 27005:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: tierStyle.text }}>
                {score}/100
              </span>
            </div>
          )}
        </div>

        {rationale && (
          <p style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.6, margin: "4px 0 0 0" }}>
            <b>Justificativa / Parecer:</b> {rationale}
          </p>
        )}
      </div>

      {/* Regulatory Frameworks & Sensitive Data */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {/* Frameworks */}
        {regulatoryFrameworks.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Scale size={15} className="text-violet-400" />
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-violet)" }}>
                Enquadramento Normativo ({regulatoryFrameworks.length})
              </h4>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {regulatoryFrameworks.map((rf: any, idx: number) => (
                <Badge key={idx} variant="outline" size="sm" className="border-violet-800 text-violet-300">
                  {typeof rf === "string" ? rf : rf.name || rf.framework}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sensitive Data Categories */}
        {sensitiveDataCategories.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Database size={15} className="text-amber-400" />
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-amber)" }}>
                Dados Sensíveis Mapeados ({sensitiveDataCategories.length})
              </h4>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sensitiveDataCategories.map((cat: string, idx: number) => (
                <Badge key={idx} variant="outline" size="sm" className="border-amber-800 text-amber-300">
                  <Lock size={10} className="mr-1" />
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Controls Checklist */}
      {mandatoryControls.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FileCheck2 size={16} className="text-emerald-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)" }}>
              Controles Obrigatórios Exigidos para {tierStyle.label} ({mandatoryControls.length})
            </h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
            {mandatoryControls.map((ctrl: any, idx: number) => {
              const code = typeof ctrl === "string" ? ctrl : ctrl.id || ctrl.code || `CTRL-${idx + 1}`;
              const desc = typeof ctrl === "string" ? null : ctrl.description || ctrl.name;
              return (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    background: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={14} className="text-emerald-400" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent-emerald)" }}>
                      {code}
                    </span>
                    {desc && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "var(--text-main)", lineHeight: 1.4 }}>
                        {desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw Risks Elicited */}
      {rawRisks.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} className="text-rose-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-rose)" }}>
              Riscos Elicitados ({rawRisks.length})
            </h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rawRisks.map((r: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                    {r.title || r.id || `Risco #${idx + 1}`}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.severity && (
                      <Badge variant="outline" size="xs" className="border-rose-800 text-rose-300 font-mono">
                        Gravidade: {r.severity}
                      </Badge>
                    )}
                    {r.category && (
                      <Badge variant="outline" size="xs" className="border-zinc-700 text-zinc-300">
                        {r.category}
                      </Badge>
                    )}
                  </div>
                </div>
                {r.description && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px 0", lineHeight: 1.5 }}>
                    {r.description}
                  </p>
                )}
                {r.mitigation && (
                  <p style={{ fontSize: 11, color: "var(--accent-emerald)", margin: 0 }}>
                    ↳ <b>Mitigação:</b> {r.mitigation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
