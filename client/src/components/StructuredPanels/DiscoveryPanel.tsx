import React from "react";
import { Users, Target, HelpCircle, CheckCircle2, TrendingUp, Lightbulb, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface DiscoveryPanelProps {
  output: any;
}

export const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhum dado de descoberta disponível.
      </div>
    );
  }

  const {
    personas = [],
    jobsToBeDone = [],
    problemStatement,
    assumptions = [],
    successMetrics = [],
  } = output;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Problem Statement Card */}
      {problemStatement && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Lightbulb size={18} className="text-amber-400" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
              Declaração do Problema (Problem Statement)
            </h3>
          </div>
          {typeof problemStatement === "string" ? (
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-main)" }}>
              {problemStatement}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {problemStatement.currentSituation && (
                <div style={{ padding: 10, background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Situação Atual</span>
                  <p style={{ fontSize: 12, marginTop: 4, color: "var(--text-main)", lineHeight: 1.5 }}>{problemStatement.currentSituation}</p>
                </div>
              )}
              {problemStatement.coreProblem && (
                <div style={{ padding: 10, background: "rgba(239, 68, 68, 0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-rose)", textTransform: "uppercase" }}>Dor Central</span>
                  <p style={{ fontSize: 12, marginTop: 4, color: "var(--text-main)", lineHeight: 1.5 }}>{problemStatement.coreProblem}</p>
                </div>
              )}
              {problemStatement.impact && (
                <div style={{ padding: 10, background: "rgba(245, 158, 11, 0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-amber)", textTransform: "uppercase" }}>Impacto nos Negócios</span>
                  <p style={{ fontSize: 12, marginTop: 4, color: "var(--text-main)", lineHeight: 1.5 }}>{problemStatement.impact}</p>
                </div>
              )}
              {problemStatement.desiredOutcome && (
                <div style={{ padding: 10, background: "rgba(16, 185, 129, 0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase" }}>Resultado Desejado</span>
                  <p style={{ fontSize: 12, marginTop: 4, color: "var(--text-main)", lineHeight: 1.5 }}>{problemStatement.desiredOutcome}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Personas Section */}
      {personas.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Users size={16} className="text-cyan-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)" }}>
              Personas de Usuários ({personas.length})
            </h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {personas.map((p: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                    {p.name || p.id || `Persona #${idx + 1}`}
                  </span>
                  {p.role && (
                    <Badge variant="outline" size="xs" className="border-cyan-800 text-cyan-300">
                      {p.role}
                    </Badge>
                  )}
                </div>

                {p.goals && p.goals.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-emerald)" }}>Objetivos:</span>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: 12, color: "var(--text-main)" }}>
                      {p.goals.map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {p.pains && p.pains.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-rose)" }}>Dores / Frustrações:</span>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: 12, color: "var(--text-main)" }}>
                      {p.pains.map((pain: string, i: number) => (
                        <li key={i}>{pain}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs To Be Done (JTBD) */}
      {jobsToBeDone.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Target size={16} className="text-indigo-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-indigo)" }}>
              Jobs-To-Be-Done ({jobsToBeDone.length})
            </h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jobsToBeDone.map((j: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-indigo)", fontWeight: 700 }}>
                    {j.id || `JTBD-${idx + 1}`}
                  </span>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-main)", flex: 1 }}>
                    {j.jobStatement || (typeof j === "string" ? j : JSON.stringify(j))}
                  </p>
                </div>
                {j.outcome && (
                  <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "var(--accent-emerald)" }}>
                    ↳ <b>Resultado esperado:</b> {j.outcome}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions & Success Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {/* Assumptions */}
        {assumptions.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <HelpCircle size={15} className="text-amber-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-amber)" }}>
                Premissas & Hipóteses ({assumptions.length})
              </h5>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 4 }}>
              {assumptions.map((a: string, i: number) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Metrics */}
        {successMetrics.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <TrendingUp size={15} className="text-emerald-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-emerald)" }}>
                Métricas de Sucesso ({successMetrics.length})
              </h5>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {successMetrics.map((m: any, i: number) => (
                <div key={i} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 4 }}>
                  <span style={{ color: "var(--text-main)" }}>{typeof m === "string" ? m : m.metric}</span>
                  {m.target && (
                    <Badge variant="outline" size="xs" className="border-emerald-800 text-emerald-300 font-mono">
                      Meta: {m.target}
                    </Badge>
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
