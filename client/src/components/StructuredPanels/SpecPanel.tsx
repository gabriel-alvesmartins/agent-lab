import React from "react";
import { FileText, CheckCircle2, ShieldCheck, Tag } from "lucide-react";

interface SpecPanelProps {
  output: any;
}

export const SpecPanel: React.FC<SpecPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return <div style={{ padding: 16, color: "var(--text-muted)" }}>Nenhum dado de especificação disponível.</div>;
  }

  const spec = output.spec || output;
  const { title, frontmatter, userStories = [], functionalRequirements = [], nonFunctionalRequirements = [], acceptanceCriteria = [] } = spec;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Title & Frontmatter */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <FileText size={18} color="var(--accent-emerald)" />
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>
            {title || frontmatter?.title || "Especificação de Produto (PRD)"}
          </h3>
        </div>
        {frontmatter && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {frontmatter.id && <span className="badge badge-phase">{frontmatter.id}</span>}
            {frontmatter.risk_tier && (
              <span className="badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--accent-amber)" }}>
                Tier: {frontmatter.risk_tier}
              </span>
            )}
            {frontmatter.version && (
              <span className="badge" style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)" }}>
                v{frontmatter.version}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acceptance Criteria with @test tags */}
      {acceptanceCriteria.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)", marginBottom: 8 }}>
            Critérios de Aceitação com Validação (@test) ({acceptanceCriteria.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {acceptanceCriteria.map((ac: any, idx: number) => {
              const text = typeof ac === "string" ? ac : ac.description || ac.text || JSON.stringify(ac);
              const hasTestTag = text.includes("@test");

              return (
                <div key={idx} className="glass-card" style={{ padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>
                    {text}
                    {hasTestTag && (
                      <span className="badge" style={{ marginLeft: 8, background: "rgba(16, 185, 129, 0.2)", color: "var(--accent-emerald)", fontSize: 10 }}>
                        @test verificado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Functional Requirements */}
      {functionalRequirements.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)", marginBottom: 8 }}>
            Requisitos Funcionais (RF) ({functionalRequirements.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {functionalRequirements.map((rf: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: "8px 12px", fontSize: 12 }}>
                {typeof rf === "string" ? rf : `${rf.id || "RF"}: ${rf.description || JSON.stringify(rf)}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Functional Requirements */}
      {nonFunctionalRequirements.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-violet)", marginBottom: 8 }}>
            Requisitos Não-Funcionais (RNF - ISO 25010) ({nonFunctionalRequirements.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {nonFunctionalRequirements.map((rnf: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: "8px 12px", fontSize: 12 }}>
                {typeof rnf === "string" ? rnf : `${rnf.id || "RNF"}: ${rnf.description || JSON.stringify(rnf)}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
