import React from "react";
import { Scale, FileText, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Clock } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface CompliancePanelProps {
  output: any;
}

export const CompliancePanel: React.FC<CompliancePanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhuma avaliação de conformidade regulatória (Compliance) disponível.
      </div>
    );
  }

  const {
    lgpdFrameworks = [],
    legalBases = [],
    dataSubjectRights = [],
    dpiaRequired = false,
    dpiaReport,
  } = output;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* DPIA / RIPD Report Card */}
      {dpiaReport && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                Relatório de Impacto à Proteção de Dados (RIPD / DPIA)
              </h3>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <Badge variant="outline" size="xs" className="border-emerald-800 text-emerald-300">
                Obrigatório: {dpiaRequired ? "Sim" : "Dispensado"}
              </Badge>
              {dpiaReport.residualRisk && (
                <Badge variant="outline" size="xs" className="border-cyan-800 text-cyan-300">
                  Risco Residual: {dpiaReport.residualRisk}
                </Badge>
              )}
            </div>
          </div>

          {dpiaReport.summary && (
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--text-main)", lineHeight: 1.5 }}>
              {dpiaReport.summary}
            </p>
          )}
        </div>
      )}

      {/* Legal Bases Mapping Table */}
      {legalBases.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Scale size={16} className="text-violet-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-violet)" }}>
              Mapeamento de Bases Legais LGPD / GDPR ({legalBases.length})
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {legalBases.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                    {item.dataCategory || `Categoria de Dados #${idx + 1}`}
                  </span>
                  <Badge variant="outline" size="xs" className="border-violet-800 text-violet-300 font-mono">
                    Base: {item.legalBasis || "Execução de Contrato"}
                  </Badge>
                </div>

                {item.purpose && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                    <b>Finalidade:</b> {item.purpose}
                  </p>
                )}

                {item.retentionPeriod && (
                  <span style={{ fontSize: 11, color: "var(--accent-amber)" }}>
                    Prazo de Retenção: {item.retentionPeriod}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Subject Rights (DSR) & Frameworks Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {/* DSR Table */}
        {dataSubjectRights.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <UserCheck size={15} className="text-cyan-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-cyan)" }}>
                Direitos dos Titulares (DSR) ({dataSubjectRights.length})
              </h5>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {dataSubjectRights.map((r: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 4 }}>
                  <span style={{ color: "var(--text-main)", fontWeight: 500 }}>
                    {typeof r === "string" ? r : r.right}
                  </span>
                  {r.sla && (
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent-emerald)" }}>
                      SLA: {r.sla}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frameworks List */}
        {lgpdFrameworks.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <FileText size={15} className="text-emerald-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-emerald)" }}>
                Artigos & Diretrizes Vinculadas ({lgpdFrameworks.length})
              </h5>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 4 }}>
              {lgpdFrameworks.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
