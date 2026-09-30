import React, { useMemo } from "react";
import { FileDiff, CheckCircle2, AlertTriangle, ArrowLeftRight } from "lucide-react";

interface DiffViewerProps {
  actual: unknown;
  expected: unknown;
  actualTitle?: string;
  expectedTitle?: string;
  actualBadge?: string;
  expectedBadge?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  actual,
  expected,
  actualTitle = "Saída Real Gerada pelo Agente",
  expectedTitle = "Saída Esperada de Referência (Golden)",
  actualBadge = "Gerada",
  expectedBadge = "Referência",
}) => {
  const actualStr = useMemo(() => {
    try {
      return JSON.stringify(actual, null, 2) || "";
    } catch {
      return String(actual ?? "");
    }
  }, [actual]);

  const expectedStr = useMemo(() => {
    try {
      return JSON.stringify(expected, null, 2) || "";
    } catch {
      return String(expected ?? "");
    }
  }, [expected]);

  const isIdentical = actualStr.trim() === expectedStr.trim();

  // Comparação linha por linha simples
  const actualLines = actualStr.split("\n");
  const expectedLines = expectedStr.split("\n");
  const maxLines = Math.max(actualLines.length, expectedLines.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      {/* Diff Status Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: isIdentical ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
          border: `1px solid ${isIdentical ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: isIdentical ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
          {isIdentical ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          <span>
            {isIdentical
              ? "Conformidade Total: Ambas as saídas são idênticas!"
              : "Diferenças Detectadas entre a versão canônica e a versão alternativa."}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
          {actualLines.length} linhas vs {expectedLines.length} linhas
        </span>
      </div>

      {/* Side-by-Side View */}
      <div className="diff-container" style={{ flex: 1, minHeight: 400 }}>
        {/* Left: Actual Output */}
        <div className="diff-side">
          <div className="diff-header" style={{ borderBottom: "1px solid var(--border-subtle)", padding: "8px 12px" }}>
            <span style={{ fontWeight: 600 }}>{actualTitle}</span>
            <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "var(--accent-cyan)" }}>
              {actualBadge}
            </span>
          </div>
          <div className="diff-content">
            {actualLines.map((line, idx) => {
              const matchesExpected = expectedLines[idx] === line;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    background: matchesExpected ? "transparent" : "rgba(56, 189, 248, 0.12)",
                    padding: "1px 4px",
                    borderRadius: 2,
                  }}
                >
                  <span style={{ width: 32, userSelect: "none", color: "var(--text-subtle)", textAlign: "right", paddingRight: 8 }}>
                    {idx + 1}
                  </span>
                  <span style={{ color: matchesExpected ? "var(--text-main)" : "#7dd3fc" }}>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Expected Output */}
        <div className="diff-side">
          <div className="diff-header" style={{ borderBottom: "1px solid var(--border-subtle)", padding: "8px 12px" }}>
            <span style={{ fontWeight: 600 }}>{expectedTitle}</span>
            <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-emerald)" }}>
              {expectedBadge}
            </span>
          </div>
          <div className="diff-content">
            {expectedLines.map((line, idx) => {
              const matchesActual = actualLines[idx] === line;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    background: matchesActual ? "transparent" : "rgba(16, 185, 129, 0.12)",
                    padding: "1px 4px",
                    borderRadius: 2,
                  }}
                >
                  <span style={{ width: 32, userSelect: "none", color: "var(--text-subtle)", textAlign: "right", paddingRight: 8 }}>
                    {idx + 1}
                  </span>
                  <span style={{ color: matchesActual ? "var(--text-main)" : "#86efac" }}>{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
