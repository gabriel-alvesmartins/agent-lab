import React, { useState } from "react";
import { ArrowRight, FileCode2, ChevronDown, ChevronUp, PackageCheck, Info, Sliders } from "lucide-react";
import { AgentDetail } from "../types.js";
import { Badge } from "./ui/badge.js";

interface AgentSpecBannerProps {
  agent: AgentDetail;
  onOpenConfig?: () => void;
  isConfigModified?: boolean;
}

export const AgentSpecBanner: React.FC<AgentSpecBannerProps> = ({
  agent,
  onOpenConfig,
  isConfigModified,
}) => {
  const [showSchema, setShowSchema] = useState(false);

  return (
    <div
      style={{
        padding: "10px 16px",
        marginBottom: "10px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Top row: Title, badges and toggle schema */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-main)" }}>
              {agent.name}
            </h2>
            <Badge variant="outline" size="xs" className="border-zinc-700 text-zinc-400">
              {agent.phaseName}
            </Badge>
            <span
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                padding: "1px 5px",
                borderRadius: "var(--radius-xs, 3px)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "var(--text-subtle)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {agent.category}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, maxWidth: "850px" }}>
            {agent.description}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {onOpenConfig && (
            <button
              onClick={onOpenConfig}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: isConfigModified ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-subtle)",
                background: isConfigModified ? "rgba(245, 158, 11, 0.12)" : "rgba(255, 255, 255, 0.04)",
                color: isConfigModified ? "var(--accent-amber, #f59e0b)" : "var(--text-main)",
                cursor: "pointer",
                height: 26,
                transition: "all var(--duration-quick) var(--ease-smooth-out)",
              }}
              title="Abrir configurações do agente: prompt, schemas, hiperparâmetros e versões"
            >
              <Sliders size={12} className="text-amber-400" />
              <span>Configurações do Agente</span>
              {isConfigModified && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-amber, #f59e0b)",
                  }}
                />
              )}
            </button>
          )}

          <button
            onClick={() => setShowSchema(!showSchema)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 500,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--text-muted)",
              cursor: "pointer",
              height: 26,
              transition: "all var(--duration-quick) var(--ease-smooth-out)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "var(--border-medium)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <FileCode2 size={12} className="text-zinc-400" />
            <span>{showSchema ? "Ocultar Contrato Zod" : "Ver Contrato Zod"}</span>
            {showSchema ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {/* Upstream & Downstream Flow Diagram */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 14px",
          background: "var(--bg-surface-stage)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Left: De quem recebe (Upstream) */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-amber)", marginBottom: 4 }}>
            De quem recebe (Upstream)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {agent.readsFrom.length > 0 ? (
              agent.readsFrom.map((rf, idx) => (
                <div key={idx} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>[{rf.agent}]</span>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{rf.source}</span>
                  {rf.required && <span style={{ fontSize: 9, color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>*req</span>}
                </div>
              ))
            ) : (
              <span style={{ fontSize: 11, color: "var(--text-subtle)", fontStyle: "italic" }}>
                Ponto de entrada inicial (Sem dependências upstream)
              </span>
            )}
          </div>
        </div>

        {/* Center: Arrow Divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", opacity: 0.5 }}>
          <ArrowRight size={16} />
        </div>

        {/* Right: Para quem produz (Downstream) */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)", marginBottom: 4 }}>
            O que produz & Consumidores
          </div>
          <div style={{ fontSize: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PackageCheck size={13} className="text-emerald-400" />
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{agent.produces.title}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>
              Consumido por: <span style={{ color: "var(--text-muted)" }}>{agent.produces.consumers.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Zod Schema Inspector */}
      {showSchema && (
        <div
          style={{
            marginTop: 10,
            padding: "12px",
            background: "var(--bg-surface-stage)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
            animation: "p7-modal-reveal var(--duration-fast) var(--ease-smooth-out)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={13} className="text-indigo-400" />
            <span>Campos do inputSchema (Validação Zod)</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 6 }}>
            {agent.inputSchemaFields.map((field) => (
              <div
                key={field.name}
                style={{
                  background: "var(--bg-surface)",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-main)" }}>
                    {field.name}
                  </span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: field.required ? "var(--accent-rose)" : "var(--text-subtle)" }}>
                    {field.required ? "obrigatório" : "opcional"}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {field.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
