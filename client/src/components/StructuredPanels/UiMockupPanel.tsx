import React, { useState } from "react";
import { Layout, Palette, Code2, Eye, Copy, Check, Sparkles, Monitor } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface UiMockupPanelProps {
  output: any;
}

export const UiMockupPanel: React.FC<UiMockupPanelProps> = ({ output }) => {
  const [activeProtoIndex, setActiveProtoIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copiedCode, setCopiedCode] = useState(false);

  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhuma especificação de interface gráfica (UI) disponível.
      </div>
    );
  }

  const prototypes: any[] = output.htmlPrototypes || output.prototypes || (output.html ? [{ name: "Protótipo", html: output.html, css: output.css }] : []);
  const designTokens = output.designTokens || output.tokens;
  const componentSpecs: any[] = output.componentSpecs || output.components || [];

  const currentProto = prototypes[activeProtoIndex] || null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Prototypes Interactive Card */}
      {prototypes.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Monitor size={18} className="text-pink-400" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                Protótipos de Interface (UI) ({prototypes.length})
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Screen Tabs */}
              {prototypes.length > 1 && (
                <div style={{ display: "flex", gap: 4 }}>
                  {prototypes.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveProtoIndex(idx)}
                      className={`btn btn-xs ${activeProtoIndex === idx ? "btn-primary" : "btn-secondary"}`}
                      style={{ fontSize: 11, padding: "2px 8px" }}
                    >
                      {p.name || `Tela ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* View Mode Toggle: Preview vs Code */}
              <div className="p16-tab-container">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`p16-tab-trigger ${viewMode === "preview" ? "active" : ""}`}
                  style={{ padding: "2px 8px", fontSize: 11 }}
                >
                  <Eye size={12} className={viewMode === "preview" ? "text-cyan-400" : "text-zinc-500"} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`p16-tab-trigger ${viewMode === "code" ? "active" : ""}`}
                  style={{ padding: "2px 8px", fontSize: 11 }}
                >
                  <Code2 size={12} className={viewMode === "code" ? "text-pink-400" : "text-zinc-500"} />
                  <span>HTML/CSS</span>
                </button>
              </div>

              {currentProto && (
                <button
                  onClick={() => handleCopyCode(currentProto.html || "")}
                  className="btn btn-secondary btn-xs"
                  style={{ fontSize: 11, padding: "2px 8px" }}
                  title="Copiar código HTML do protótipo"
                >
                  {copiedCode ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                  <span>{copiedCode ? "Copiado!" : "Copiar"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Prototype Content */}
          {currentProto && (
            <div>
              {viewMode === "preview" ? (
                <div
                  style={{
                    background: "#09090b",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    overflow: "hidden",
                    minHeight: 280,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {/* Browser-like window header */}
                  <div
                    style={{
                      background: "#18181b",
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      borderBottom: "1px solid #27272a",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ marginLeft: 8, fontSize: 11, color: "#71717a", fontFamily: "var(--font-mono)" }}>
                      fleetpulse://ui-preview/{currentProto.screenId || "prototype"}
                    </span>
                  </div>

                  <iframe
                    title={currentProto.name || "Protótipo UI"}
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8">
                        <style>
                          body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; }
                          ${currentProto.css || ""}
                        </style>
                      </head>
                      <body>
                        ${currentProto.html || ""}
                      </body>
                      </html>
                    `}
                    style={{
                      width: "100%",
                      height: 380,
                      border: "none",
                      display: "block",
                      background: "#0f172a",
                    }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                <pre
                  style={{
                    background: "var(--bg-surface-stage)",
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#f472b6",
                    maxHeight: 380,
                    overflowY: "auto",
                    margin: 0,
                  }}
                >
                  {currentProto.html}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Design Tokens Palette */}
      {designTokens && designTokens.colors && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Palette size={16} className="text-pink-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-pink)" }}>
              Paleta de Cores & Design Tokens
            </h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {Object.entries(designTokens.colors).map(([name, hex]: [string, any], idx: number) => {
              const hexValue = typeof hex === "string" ? hex : hex?.value || "#6366f1";
              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      height: 36,
                      borderRadius: "var(--radius-sm)",
                      background: hexValue,
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-main)", textTransform: "capitalize" }}>
                      {name}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-subtle)" }}>
                      {hexValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Component Specifications */}
      {componentSpecs.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Layout size={16} className="text-violet-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-violet)" }}>
              Especificações de Componentes ({componentSpecs.length})
            </h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
            {componentSpecs.map((c: any, idx: number) => (
              <div key={idx} style={{ padding: 10, background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                  {c.name || `Componente #${idx + 1}`}
                </span>
                {c.states && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {c.states.map((s: string, i: number) => (
                      <Badge key={i} variant="outline" size="xs" className="border-zinc-800 text-zinc-300">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
                {c.accessibility && (
                  <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "var(--accent-emerald)" }}>
                    ARIA: {c.accessibility}
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
