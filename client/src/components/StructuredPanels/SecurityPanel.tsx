import React from "react";
import { ShieldAlert, ShieldCheck, AlertOctagon, CheckCircle2, Lock, Key, FileCheck, Hash } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface SecurityPanelProps {
  output: any;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhuma análise de segurança disponível.
      </div>
    );
  }

  const decision = (output.decision || output.securityDecision || "APPROVED").toUpperCase();
  const summary = output.summary || output.rationale || "";
  const strideAnalysis: any[] = output.strideAnalysis || output.threats || [];
  const sbomApproved = output.sbomApproved ?? true;
  const sbomHash = output.sbomHash || output.hash || "";
  const blockingVulnerabilities: any[] = output.blockingVulnerabilities || output.vulnerabilities || [];

  const getDecisionBadge = () => {
    if (decision === "APPROVED") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "var(--radius-sm)" }}>
          <ShieldCheck size={18} className="text-emerald-400" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-emerald)", letterSpacing: "0.04em" }}>
            DECISÃO: APROVADO PARA PRODUÇÃO
          </span>
        </div>
      );
    }
    if (decision === "CONDITIONAL") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "var(--radius-sm)" }}>
          <ShieldAlert size={18} className="text-amber-400" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-amber)", letterSpacing: "0.04em" }}>
            DECISÃO: APROVAÇÃO CONDICIONAL
          </span>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "var(--radius-sm)" }}>
        <AlertOctagon size={18} className="text-rose-400" />
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-rose)", letterSpacing: "0.04em" }}>
          DECISÃO: BLOQUEADO POR SEGURANÇA
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Security Verdict Banner */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: summary ? 8 : 0 }}>
          {getDecisionBadge()}

          {/* SBOM Signature */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <FileCheck size={14} className={sbomApproved ? "text-emerald-400" : "text-rose-400"} />
            <span>SBOM: <b style={{ color: sbomApproved ? "var(--accent-emerald)" : "var(--accent-rose)" }}>{sbomApproved ? "Validado" : "Pendente"}</b></span>
            {sbomHash && (
              <span style={{ fontFamily: "var(--font-mono)", opacity: 0.7 }}>
                ({sbomHash.substring(0, 10)}...)
              </span>
            )}
          </div>
        </div>

        {summary && (
          <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "var(--text-main)", lineHeight: 1.5 }}>
            {summary}
          </p>
        )}
      </div>

      {/* STRIDE Threat Model Matrix */}
      {strideAnalysis.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Lock size={16} className="text-rose-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-rose)" }}>
              Matriz de Ameaças STRIDE ({strideAnalysis.length})
            </h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strideAnalysis.map((item: any, idx: number) => {
              const risk = item.riskLevel || item.risk || "Medium";
              const isHigh = risk.toLowerCase() === "high" || risk.toLowerCase() === "critical";

              return (
                <div key={idx} className="glass-card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--accent-violet)" }}>
                        [{item.category || "STRIDE"}]
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        {item.threat || item.title || `Ameaça #${idx + 1}`}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      size="xs"
                      className={`font-mono ${isHigh ? "border-rose-800 text-rose-300" : "border-amber-800 text-amber-300"}`}
                    >
                      {risk}
                    </Badge>
                  </div>

                  {item.mitigation && (
                    <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--accent-emerald)", lineHeight: 1.4 }}>
                      ↳ <b>Controle de Mitigação:</b> {item.mitigation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocking Vulnerabilities */}
      {blockingVulnerabilities.length > 0 && (
        <div className="glass-card" style={{ padding: 14, border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <AlertOctagon size={16} className="text-rose-400" />
            <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-rose)" }}>
              Vulnerabilidades Bloqueantes Identificadas ({blockingVulnerabilities.length})
            </h5>
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 4 }}>
            {blockingVulnerabilities.map((v: any, i: number) => (
              <li key={i}>{typeof v === "string" ? v : v.title || v.cve || JSON.stringify(v)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
