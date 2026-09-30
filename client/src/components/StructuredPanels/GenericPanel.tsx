import React from "react";
import { Sparkles } from "lucide-react";

interface GenericPanelProps {
  output: any;
}

export const GenericPanel: React.FC<GenericPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return <div style={{ padding: 16, color: "var(--text-muted)" }}>{String(output)}</div>;
  }

  const entries = Object.entries(output);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px" }}>
      {entries.map(([key, value]) => {
        // Formatação inteligente por tipo de chave
        const isPrimitive = typeof value === "string" || typeof value === "number" || typeof value === "boolean";
        const isArray = Array.isArray(value);

        return (
          <div key={key} className="glass-card" style={{ padding: 16 }}>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--accent-cyan)",
                marginBottom: 8,
              }}
            >
              {key}
            </h4>

            {isPrimitive ? (
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-main)", whiteSpace: "pre-wrap" }}>
                {String(value)}
              </div>
            ) : isArray ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {value.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg-surface-elevated)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                      color: "var(--text-main)",
                    }}
                  >
                    {typeof item === "object" ? (
                      <pre style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#38bdf8", margin: 0 }}>
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    ) : (
                      String(item)
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre
                style={{
                  background: "var(--bg-surface-input)",
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "#94a3b8",
                  overflowX: "auto",
                  margin: 0,
                }}
              >
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
};
