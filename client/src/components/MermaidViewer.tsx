import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertCircle, Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, X, Layers } from "lucide-react";
import { Button } from "./ui/button.js";

interface MermaidViewerProps {
  chart: string;
  id?: string;
  title?: string;
}

let mermaidInitialized = false;

function initMermaid() {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0d0d10",
        mainBkg: "#18181c",
        lineColor: "#6366f1",
        textColor: "#f4f4f5",
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      securityLevel: "loose",
    });
    mermaidInitialized = true;
  }
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  chart,
  id = "mermaid-chart",
  title = "Diagrama Arquitetural Mermaid",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    initMermaid();

    const renderChart = async () => {
      if (!chart || !chart.trim()) {
        if (isMounted) {
          setSvgContent("");
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      // Clean diagram content
      let cleanChart = chart.trim();
      if (cleanChart.startsWith("```mermaid")) {
        cleanChart = cleanChart.replace(/^```mermaid\s*/, "").replace(/\s*```$/, "");
      } else if (cleanChart.startsWith("```")) {
        cleanChart = cleanChart.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      try {
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Erro ao renderizar Mermaid:", err.message);
          setError(err.message || "Erro na sintaxe Mermaid do diagrama C4");
          setSvgContent("");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Listener para fechar com tecla ESC quando o pop-up estiver aberto
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.2).toFixed(1)), 3.0));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.2).toFixed(1)), 0.4));
  const handleResetZoom = () => setZoom(1);

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "var(--text-muted)",
          fontSize: 12,
          background: "var(--bg-surface-stage)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <Loader2 size={16} className="animate-spin text-indigo-400" />
        <span>Renderizando diagrama C4 Mermaid...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "12px",
          background: "rgba(239, 68, 68, 0.08)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fca5a5",
          fontSize: 11,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <AlertCircle size={14} className="mt-0.5 text-rose-400 shrink-0" />
        <div>
          <span style={{ fontWeight: 600 }}>Aviso de renderização gráfica do diagrama:</span>
          <p style={{ marginTop: 2, fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.9 }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!svgContent) return null;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface-stage)",
          overflow: "hidden",
        }}
      >
        {/* Barra superior de controle do Mermaid inline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-subtle)" }}>
            <Layers size={13} className="text-indigo-400" />
            <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Visualização Gráfica
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setZoom(1);
              setIsExpanded(true);
            }}
            className="h-6 px-2 text-[11px] gap-1"
            title="Expandir diagrama em tela cheia (Pop-up)"
          >
            <Maximize2 size={11} className="text-zinc-400" />
            <span>Expandir Diagrama</span>
          </Button>
        </div>

        {/* Visualização inline do SVG */}
        <div
          ref={containerRef}
          style={{
            padding: "16px",
            overflowX: "auto",
            display: "flex",
            justifyContent: "center",
            maxHeight: 460,
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      {/* ── POP-UP MODAL EXPANDIDO ────────────────────────────────────── */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            background: "rgba(5, 5, 8, 0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            style={{
              width: "95vw",
              maxWidth: "1400px",
              height: "90vh",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-medium)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Pop-up */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-elevated)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-indigo)",
                  }}
                >
                  <Layers size={15} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                    {title}
                  </h3>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Visualização de Alta Resolução do Diagrama Mermaid
                  </span>
                </div>
              </div>

              {/* Controles de Zoom & Fechar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2px 4px",
                    gap: 4,
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="h-6 w-6 p-0"
                    title="Diminuir zoom (-)"
                  >
                    <ZoomOut size={13} />
                  </Button>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      padding: "0 6px",
                      minWidth: 42,
                      textAlign: "center",
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="h-6 w-6 p-0"
                    title="Aumentar zoom (+)"
                  >
                    <ZoomIn size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetZoom}
                    className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                    title="Restaurar tamanho original (100%)"
                  >
                    <RotateCcw size={11} />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-7 px-3 text-xs gap-1.5"
                  title="Fechar pop-up (Esc)"
                >
                  <X size={13} />
                  <span>Fechar</span>
                </Button>
              </div>
            </div>

            {/* Canvas do Pop-up com Pan/Scroll e Zoom Dinâmico */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                background: "#08080a",
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px",
              }}
            >
              <div
                ref={modalContainerRef}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 150ms ease-out",
                  display: "flex",
                  justifyContent: "center",
                  maxWidth: "100%",
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Rodapé informativo */}
            <div
              style={{
                padding: "8px 20px",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-stage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--text-subtle)",
              }}
            >
              <span>Use os botões de zoom ou role o canvas para inspecionar nós e conexões</span>
              <span>Pressione <kbd className="font-mono text-[10px]">Esc</kbd> para fechar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
