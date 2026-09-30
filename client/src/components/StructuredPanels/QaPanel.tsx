import React from "react";
import { CheckCheck, CheckCircle2, ShieldAlert } from "lucide-react";

interface QaPanelProps {
  output: any;
}

export const QaPanel: React.FC<QaPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return <div style={{ padding: 16, color: "var(--text-muted)" }}>Nenhum plano de QA disponível.</div>;
  }

  const { summary, scenarios = [], coverageMatrix = [], nfrTests = [] } = output;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {summary && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)", marginBottom: 6 }}>
            Estratégia de Validação Pós-G5
          </h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-main)" }}>{summary}</p>
        </div>
      )}

      {/* BDD Scenarios */}
      {scenarios.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)", marginBottom: 8 }}>
            Cenários BDD (Given / When / Then) ({scenarios.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scenarios.map((sc: any, idx: number) => {
              if (typeof sc === "string") {
                return (
                  <div key={idx} className="glass-card" style={{ padding: "10px 14px", fontSize: 12 }}>
                    {sc}
                  </div>
                );
              }
              return (
                <div key={idx} className="glass-card" style={{ padding: "12px 14px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)", marginBottom: 6 }}>
                    {sc.title || `Cenário ${idx + 1}`}
                  </div>
                  {sc.given && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}><b>Given:</b> {sc.given}</div>}
                  {sc.when && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}><b>When:</b> {sc.when}</div>}
                  {sc.then && <div style={{ fontSize: 12, color: "var(--accent-cyan)" }}><b>Then:</b> {sc.then}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
