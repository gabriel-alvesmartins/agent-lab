import React from "react";
import { FileText, Layers, ShieldAlert, Sparkles, Tag, CheckCircle2, Info } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface StructuredInputPanelProps {
  inputJson: string;
}

export const StructuredInputPanel: React.FC<StructuredInputPanelProps> = ({ inputJson }) => {
  let parsed: Record<string, any> = {};
  let parseError: string | null = null;

  try {
    parsed = JSON.parse(inputJson || "{}");
  } catch (err: any) {
    parseError = err.message;
  }

  if (parseError) {
    return (
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ color: "var(--accent-rose)", fontSize: 13, fontWeight: 600 }}>
          JSON de Entrada Malformado
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          Não foi possível estruturar a entrada devido ao erro de sintaxe: {parseError}
        </p>
      </div>
    );
  }

  const { specId, parent, archMode, riskTier, discoveryReport, specBody, ...otherFields } = parsed;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Meta Bar */}
      <div
        className="glass-card"
        style={{
          padding: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-subtle)", display: "block" }}>
            Spec ID / Feature
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>
            {specId || "Não especificado"}
          </span>
        </div>

        <div>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-subtle)", display: "block" }}>
            Produto Pai
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
            {parent || "PROD-LOGISTICS"}
          </span>
        </div>

        {riskTier && (
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-subtle)", display: "block" }}>
              Tier de Risco
            </span>
            <Badge variant={riskTier === "high" || riskTier === "high_risk" ? "warning" : "secondary"} size="xs" className="mt-0.5">
              {riskTier}
            </Badge>
          </div>
        )}

        {archMode && (
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-subtle)", display: "block" }}>
              Modo de Arquitetura
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-indigo)" }}>
              {archMode}
            </span>
          </div>
        )}
      </div>

      {/* Discovery Context */}
      {discoveryReport && (
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Sparkles size={14} className="text-amber-400" />
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-main)" }}>
              Contexto do Discovery Upstream
            </h4>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {discoveryReport}
          </p>
        </div>
      )}

      {/* Spec Body (PRD Markdown) */}
      {specBody && (
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
            <FileText size={14} className="text-indigo-400" />
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-main)" }}>
              Especificação de Requisitos (PRD)
            </h4>
          </div>
          <pre
            style={{
              background: "var(--bg-surface-stage)",
              padding: 12,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              color: "var(--text-main)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowX: "auto",
              margin: 0,
            }}
          >
            {specBody}
          </pre>
        </div>
      )}

      {/* Other Fields */}
      {Object.keys(otherFields).length > 0 && (
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Info size={14} className="text-zinc-400" />
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-main)" }}>
              Outros Parâmetros de Entrada
            </h4>
          </div>
          <pre
            style={{
              background: "var(--bg-surface-stage)",
              padding: 12,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              lineHeight: 1.5,
              overflowX: "auto",
              margin: 0,
            }}
          >
            {JSON.stringify(otherFields, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
