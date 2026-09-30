import React, { useEffect, useState } from "react";
import {
  History,
  X,
  Trash2,
  Sparkles,
  Eye,
  ExternalLink,
} from "lucide-react";
import { ExperimentRecord } from "../types.js";
import { fetchExperiments, deleteExperiment } from "../lib/api.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { ExperimentDetailModal } from "./ExperimentDetailModal.js";

interface ExperimentsHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgentId: string;
  onSelectExperiment: (exp: ExperimentRecord) => void;
}

export const ExperimentsHistoryDrawer: React.FC<ExperimentsHistoryDrawerProps> = ({
  isOpen,
  onClose,
  currentAgentId,
  onSelectExperiment,
}) => {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [filterAgent, setFilterAgent] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedExperimentForModal, setSelectedExperimentForModal] = useState<ExperimentRecord | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchExperiments(filterAgent ? currentAgentId : undefined)
      .then((data) => setExperiments(data))
      .catch((err) => console.error("Erro ao carregar histórico:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, filterAgent, currentAgentId]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente excluir este experimento do histórico?")) {
      const ok = await deleteExperiment(id);
      if (ok) {
        setExperiments((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 9999,
          display: "flex",
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <div
          className="p3-drawer-enter"
          style={{
            width: "100%",
            maxWidth: 540,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
            borderLeft: "1px solid var(--border-medium)",
            padding: 0,
            background: "var(--bg-surface)",
            boxShadow: "-16px 0 48px rgba(0, 0, 0, 0.7)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-elevated)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <History size={16} className="text-zinc-300" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                Histórico de Experimentos A/B
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 rounded-full text-zinc-400 hover:text-white"
            >
              <X size={15} />
            </Button>
          </div>

          {/* Filter Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-stage)",
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--text-muted)" }}>
                <input
                  type="checkbox"
                  checked={filterAgent}
                  onChange={(e) => setFilterAgent(e.target.checked)}
                />
                <span>Apenas {currentAgentId}</span>
              </label>
            </div>
            <span style={{ color: "var(--text-subtle)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
              {experiments.length} rodadas salvas
            </span>
          </div>

          {/* List Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {loading && (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 12 }}>
                Carregando histórico do banco local...
              </div>
            )}

            {!loading && experiments.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                <Sparkles size={28} className="text-zinc-600 mx-auto mb-3 opacity-50" />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Nenhum experimento registrado ainda.</p>
                <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>
                  Ao executar o botão "Executar A/B", o resultado completo será gravado automaticamente aqui.
                </p>
              </div>
            )}

            {!loading &&
              experiments.map((exp) => {
                const dateStr = new Date(exp.createdAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={exp.id}
                    onClick={() => setSelectedExperimentForModal(exp)}
                    className="glass-card hover:border-zinc-500 transition-colors"
                    style={{
                      padding: 12,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Badge variant="outline" size="xs" className="border-zinc-700 text-zinc-400 font-mono">
                          {exp.agentId}
                        </Badge>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-subtle)" }}>{dateStr}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Eye size={11} className="text-cyan-400" />
                          <span>Ver</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(exp.id, e)}
                          className="h-6 w-6 text-zinc-500 hover:text-rose-400"
                          title="Excluir rodada"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                      {exp.title}
                    </div>

                    {/* Versões comparadas no teste A/B */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                        A: {exp.versionAName || "Oficial"}
                      </span>
                      <span style={{ color: "var(--text-subtle)", fontSize: 10 }}>⟷</span>
                      <span style={{ fontSize: 11, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                        B: {exp.versionBName || "Personalizado"}
                      </span>
                    </div>

                    {/* Badges de Customização Ativas */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      {exp.customConfig?.promptMode === "override" && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: "rgba(244, 63, 94, 0.15)",
                            color: "#fb7185",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                          }}
                        >
                          Prompt ✎
                        </span>
                      )}
                      {Boolean(exp.customConfig?.outputSchemaJson) && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#34d399",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          Output Schema ✎
                        </span>
                      )}
                      {Boolean(exp.customConfig?.inputSchemaJson) && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: "rgba(6, 182, 212, 0.15)",
                            color: "#22d3ee",
                            border: "1px solid rgba(6, 182, 212, 0.3)",
                          }}
                        >
                          Input Schema ✎
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      <span>{exp.modelId.replace("anthropic:", "")}</span>
                      <span>•</span>
                      <span>{exp.diffSummary?.diffLinesCount ?? 0} diffs</span>
                      <span>•</span>
                      <span style={{ color: exp.customResult.success ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                        {exp.customResult.success ? "Sucesso" : "Falhou"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Pop-up Central de Detalhes do Experimento (Input, Output, A/B, Prompts) */}
      {selectedExperimentForModal && (
        <ExperimentDetailModal
          experiment={selectedExperimentForModal}
          isOpen={Boolean(selectedExperimentForModal)}
          onClose={() => setSelectedExperimentForModal(null)}
          onLoadIntoWorkbench={(exp) => {
            onSelectExperiment(exp);
            setSelectedExperimentForModal(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
