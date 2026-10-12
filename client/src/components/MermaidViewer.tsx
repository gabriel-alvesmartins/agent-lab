import React, { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import {
  AlertCircle,
  Loader2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Layers,
  Hand,
  MousePointer2,
  Move,
  Focus,
} from "lucide-react";
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
        fontSize: "14px",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
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
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Estados de Zoom e Pan
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [panModeActive, setPanModeActive] = useState<boolean>(false);

  const dragStartRef = useRef<{ clientX: number; clientY: number; initialPanX: number; initialPanY: number }>({
    clientX: 0,
    clientY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Renderização do Mermaid
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
          // Remove restrições de max-width que achatam e comprimem os nós do C4
          const cleanSvg = svg
            .replace(/style="max-width:[^"]*"/gi, "")
            .replace(/max-width:\s*[^;"]+;?/gi, "");

          setSvgContent(cleanSvg);
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

  // Teclado: Detecta tecla de Espaço (Space) para Pan e ESC para fechar modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsDragging(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isExpanded]);

  // Handlers de Zoom
  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 8.0));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.3));
  const handleReset = () => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
  };
  const handleCenter = () => {
    setPan({ x: 0, y: 0 });
  };

  // Zoom suave com a roda do mouse (Wheel)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(Number((prevZoom * zoomFactor).toFixed(2)), 0.3), 8.0);
      return nextZoom;
    });
  }, []);

  // Handlers de Pan (Arrastar segurando Espaço, Botão Direito ou Botão do Meio)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Permite iniciar pan se:
    // 1. Botão direito (e.button === 2)
    // 2. Botão do meio (e.button === 1)
    // 3. Barra de espaço pressionada + botão esquerdo (e.button === 0)
    // 4. Modo mãozinha ativo (panModeActive) + botão esquerdo (e.button === 0)
    const isRightClick = e.button === 2;
    const isMiddleClick = e.button === 1;
    const isLeftWithSpaceOrPanMode = e.button === 0 && (isSpacePressed || panModeActive);

    if (isRightClick || isMiddleClick || isLeftWithSpaceOrPanMode) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    setPan({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Determina o cursor do mouse
  const getCursor = () => {
    if (isDragging) return "grabbing";
    if (isSpacePressed || panModeActive) return "grab";
    return "default";
  };

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
      {/* ── VISUALIZAÇÃO INLINE NA PÁGINA ─────────────────────────────── */}
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
            padding: "6px 12px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(255, 255, 255, 0.02)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-subtle)" }}>
            <Layers size={13} className="text-indigo-400" />
            <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Visualização Gráfica Interativa
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Dica: Segure <b>Espaço</b> ou use o <b>Botão Direito</b> para navegar
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom(1.4);
                setPan({ x: 0, y: 0 });
                setIsExpanded(true);
              }}
              className="h-6 px-2 text-[11px] gap-1 text-cyan-300 border-cyan-800/60 bg-cyan-950/20 hover:bg-cyan-900/30"
              title="Expandir diagrama em tela cheia com navegação de alta resolução"
            >
              <Maximize2 size={11} className="text-cyan-400" />
              <span>Expandir em Tela Cheia</span>
            </Button>
          </div>
        </div>

        {/* Canvas inline com navegação e zoom */}
        <div
          style={{
            position: "relative",
            height: 380,
            overflow: "hidden",
            background: "#08080a",
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            cursor: getCursor(),
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Controles flutuantes de zoom no canto superior direito */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              background: "rgba(18, 18, 22, 0.85)",
              border: "1px solid var(--border-medium)",
              backdropFilter: "blur(8px)",
              borderRadius: "var(--radius-sm)",
              padding: "2px 4px",
              gap: 4,
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanModeActive((p) => !p)}
              className={`h-6 w-6 p-0 ${panModeActive ? "text-indigo-400 bg-indigo-950/50" : "text-zinc-400"}`}
              title={panModeActive ? "Desativar modo arrastar com clique esquerdo" : "Ativar modo arrastar com clique esquerdo"}
            >
              <Hand size={13} />
            </Button>
            <div style={{ width: 1, height: 14, background: "var(--border-subtle)" }} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-6 w-6 p-0 text-zinc-300"
              title="Diminuir zoom (-)"
            >
              <ZoomOut size={13} />
            </Button>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-main)",
                minWidth: 38,
                textAlign: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-6 w-6 p-0 text-zinc-300"
              title="Aumentar zoom (+)"
            >
              <ZoomIn size={13} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
              title="Restaurar posição e escala original"
            >
              <RotateCcw size={11} />
            </Button>
          </div>

          {/* Container do SVG com transformação 2D */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 80ms ease-out",
              willChange: "transform",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 800,
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>

      {/* ── POP-UP MODAL EXPANDIDO (TELA CHEIA) ───────────────────────── */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            background: "rgba(5, 5, 8, 0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            style={{
              width: "96vw",
              maxWidth: "1500px",
              height: "92vh",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-medium)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85)",
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
                padding: "10px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-elevated)",
                flexWrap: "wrap",
                gap: 8,
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
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                    {title}
                  </h3>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Canvas de Alta Resolução — Suporta até 800% de Zoom com Pan Livre
                  </span>
                </div>
              </div>

              {/* Controles de Navegação, Zoom & Fechar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Ferramenta de Arrastar (Mãozinha) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPanModeActive((p) => !p)}
                  className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                    panModeActive
                      ? "border-indigo-500 bg-indigo-950/60 text-indigo-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white"
                  }`}
                  title={panModeActive ? "Desativar modo arrastar com clique esquerdo" : "Ativar modo arrastar com clique esquerdo"}
                >
                  <Hand size={13} className={panModeActive ? "text-indigo-400" : "text-zinc-400"} />
                  <span>{panModeActive ? "Modo Arrastar Ativo" : "Modo Arrastar"}</span>
                </Button>

                <div style={{ height: 18, width: 1, background: "var(--border-subtle)" }} />

                {/* Seletor de Zoom */}
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
                    className="h-6 w-6 p-0 text-zinc-300"
                    title="Diminuir zoom (-)"
                  >
                    <ZoomOut size={13} />
                  </Button>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-main)",
                      padding: "0 6px",
                      minWidth: 46,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="h-6 w-6 p-0 text-zinc-300"
                    title="Aumentar zoom (+)"
                  >
                    <ZoomIn size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCenter}
                    className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                    title="Centralizar diagrama na tela"
                  >
                    <Focus size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                    title="Restaurar tamanho padrão (120%)"
                  >
                    <RotateCcw size={11} />
                  </Button>
                </div>

                {/* Presets Rápidos */}
                <div style={{ display: "flex", gap: 3 }}>
                  {[1.0, 1.5, 2.0, 3.0, 4.0].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setZoom(preset)}
                      className={`btn btn-xs ${Math.abs(zoom - preset) < 0.05 ? "btn-primary" : "btn-secondary"}`}
                      style={{ fontSize: 10, padding: "2px 6px" }}
                      title={`Zoom em ${preset * 100}%`}
                    >
                      {preset * 100}%
                    </button>
                  ))}
                </div>

                <div style={{ height: 18, width: 1, background: "var(--border-subtle)" }} />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-7 px-3 text-xs gap-1.5"
                  title="Fechar visualizador (Esc)"
                >
                  <X size={13} />
                  <span>Fechar</span>
                </Button>
              </div>
            </div>

            {/* Canvas Interativo Infinito */}
            <div
              ref={canvasRef}
              style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                background: "#08080a",
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                cursor: getCursor(),
                userSelect: "none",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Overlay de Ajuda Rápida no Centro Inferior */}
              {isSpacePressed && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 30,
                    background: "rgba(99, 102, 241, 0.2)",
                    border: "1px solid rgba(99, 102, 241, 0.5)",
                    borderRadius: "var(--radius-full)",
                    padding: "4px 14px",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 600,
                    pointerEvents: "none",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  🖐 Arraste com o botão esquerdo para mover
                </div>
              )}

              {/* Elemento do SVG transformado em 2D */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 60ms ease-out",
                  willChange: "transform",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 900,
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Rodapé Informativo */}
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
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span>
                  🖱 <b>Navegação:</b> Segure <kbd className="font-mono text-[10px] bg-zinc-800 px-1 py-0.5 rounded">Espaço</kbd> ou use o <b>Botão Direito do mouse</b> para arrastar
                </span>
                <span>
                  🔍 <b>Zoom:</b> Use a <b>Roda do mouse</b> ou botões acima (até 800%)
                </span>
              </div>
              <span>
                Pressione <kbd className="font-mono text-[10px] bg-zinc-800 px-1 py-0.5 rounded">Esc</kbd> para fechar
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
