import React from "react";
import {
  Scale,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { ABExecutionResult } from "../types.js";

interface ImpactAnalysisCardProps {
  abResult: ABExecutionResult;
}

export const ImpactAnalysisCard: React.FC<ImpactAnalysisCardProps> = ({
  abResult,
}) => {
  const { canonicalResult, customResult, diffSummary, agentName } = abResult;

  const msA = canonicalResult.elapsedMs || 0;
  const msB = customResult.elapsedMs || 0;
  const deltaMs = msB - msA;

  const linesA = diffSummary?.totalLinesA || 0;
  const linesB = diffSummary?.totalLinesB || 0;
  const deltaLines = linesB - linesA;

  const addedKeys = diffSummary?.structuralDiff?.addedKeys || [];
  const removedKeys = diffSummary?.structuralDiff?.removedKeys || [];
  const commonKeys = diffSummary?.structuralDiff?.commonKeys || [];

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: 16,
        marginBottom: 16,
        border: "1px solid rgba(56, 189, 248, 0.25)",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.5) 100%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              padding: 6,
              borderRadius: "var(--radius-sm)",
              background: "rgba(56, 189, 248, 0.15)",
              color: "var(--accent-cyan)",
            }}
          >
            <Scale size={18} />
          </div>
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Análise de Impacto Comparativo A/B
              <span
                className="badge"
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--accent-emerald)",
                  fontSize: 11,
                }}
              >
                {abResult.versionAName || "Oficial"} vs {abResult.versionBName || "Personalizado"}
              </span>
            </h4>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Avaliação sistemática: comparação entre {abResult.versionAName || "versão oficial"} e {abResult.versionBName || "versão personalizada"} ({agentName})
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--text-subtle)",
            }}
          >
            {diffSummary?.diffLinesCount ?? 0} linhas divergentes
          </span>
        </div>
      </div>

      {/* Grid de Métricas Comparativas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Métrica 1: Latência */}
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} /> Tempo de Execução
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: deltaMs > 0 ? "var(--accent-amber)" : "var(--accent-emerald)",
              }}
            >
              {deltaMs > 0 ? `+${deltaMs}ms` : `${deltaMs}ms`}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>
              {msA}ms <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>({abResult.versionAName || "Oficial"})</span>
            </span>
            <span style={{ color: "var(--text-subtle)" }}>→</span>
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
              {msB}ms <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>({abResult.versionBName || "Personalizado"})</span>
            </span>
          </div>
        </div>

        {/* Métrica 2: Volume / Tamanho */}
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <FileText size={12} /> Volume Gerado
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: deltaLines > 0 ? "var(--accent-cyan)" : "var(--accent-emerald)",
              }}
            >
              {deltaLines > 0 ? `+${deltaLines} linhas` : `${deltaLines} linhas`}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>
              {linesA} <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>({abResult.versionAName || "Lado A"})</span>
            </span>
            <span style={{ color: "var(--text-subtle)" }}>→</span>
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
              {linesB} <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>({abResult.versionBName || "Lado B"})</span>
            </span>
          </div>
        </div>

        {/* Métrica 3: Validação de Schema */}
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={12} /> Validação do Schema
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "var(--text-subtle)", fontSize: 11 }}>Oficial:</span>
              {canonicalResult.outputValid ? (
                <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle2 size={12} /> Válido
                </span>
              ) : (
                <span style={{ color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: 2 }}>
                  <AlertTriangle size={12} /> Inválido
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "var(--text-subtle)", fontSize: 11 }}>{abResult.versionBName || "Personalizado"}:</span>
              {customResult.outputValid ? (
                <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle2 size={12} /> Válido
                </span>
              ) : (
                <span style={{ color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: 2 }}>
                  <AlertTriangle size={12} /> Inválido
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alterações Estruturais no Schema / Chaves */}
      <div
        style={{
          background: "var(--bg-surface-input)",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={14} color="var(--accent-cyan)" />
          <span>Variação de Estrutura de Campos (Output Keys)</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {addedKeys.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                <PlusCircle size={13} /> Novos campos populados ({abResult.versionBName || "Personalizado"}):
              </span>
              {addedKeys.map((key) => (
                <code
                  key={key}
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--accent-emerald)",
                    padding: "1px 5px",
                    borderRadius: 3,
                    fontSize: 9.5,
                  }}
                >
                  +{key}
                </code>
              ))}
            </div>
          )}

          {removedKeys.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                <MinusCircle size={13} /> Campos omitidos ({abResult.versionBName || "Personalizado"}):
              </span>
              {removedKeys.map((key) => (
                <code
                  key={key}
                  style={{
                    background: "rgba(244, 63, 94, 0.15)",
                    color: "var(--accent-rose)",
                    padding: "1px 5px",
                    borderRadius: 3,
                    fontSize: 9.5,
                  }}
                >
                  -{key}
                </code>
              ))}
            </div>
          )}

          {addedKeys.length === 0 && removedKeys.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
              Nenhuma chave de primeiro nível foi adicionada ou removida. Todas as modificações ocorreram no conteúdo e detalhamento dos campos existentes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
