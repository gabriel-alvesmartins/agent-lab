import React from "react";
import { Database, Copy, Table2, ShieldCheck, Check } from "lucide-react";

interface DataModelPanelProps {
  output: any;
}

export const DataModelPanel: React.FC<DataModelPanelProps> = ({ output }) => {
  const [copied, setCopied] = React.useState(false);

  if (!output || typeof output !== "object") {
    return <div style={{ padding: 16, color: "var(--text-muted)" }}>Nenhum modelo de dados disponível.</div>;
  }

  const { summary, ddl, entities = [], retentionPolicy, partitions } = output;

  const handleCopyDdl = () => {
    if (ddl) {
      navigator.clipboard.writeText(ddl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {summary && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)", marginBottom: 6 }}>
            Estratégia de Modelagem & Persistência
          </h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-main)" }}>{summary}</p>
        </div>
      )}

      {/* DDL SQL Block */}
      {ddl && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Database size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                Script DDL PostgreSQL
              </span>
            </div>
            <button onClick={handleCopyDdl} className="btn btn-secondary btn-sm">
              {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
              <span>{copied ? "Copiado!" : "Copiar SQL"}</span>
            </button>
          </div>
          <pre
            style={{
              background: "var(--bg-surface-input)",
              padding: 12,
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              maxHeight: 280,
              overflowY: "auto",
              color: "#38bdf8",
              lineHeight: 1.5,
            }}
          >
            {ddl}
          </pre>
        </div>
      )}

      {/* Retention Policy & LGPD */}
      {retentionPolicy && (
        <div className="glass-card" style={{ padding: 14, border: "1px solid var(--border-subtle)" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)", marginBottom: 4 }}>
            Política de Retenção & Expurgo (LGPD)
          </h4>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {typeof retentionPolicy === "string" ? retentionPolicy : JSON.stringify(retentionPolicy, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
};
