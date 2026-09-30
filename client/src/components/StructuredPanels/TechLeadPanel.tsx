import React from "react";
import { Kanban, GitCommit, Clock, CheckCircle2 } from "lucide-react";

interface TechLeadPanelProps {
  output: any;
}

export const TechLeadPanel: React.FC<TechLeadPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return <div style={{ padding: 16, color: "var(--text-muted)" }}>Nenhum plano de tasks disponível.</div>;
  }

  const { summary, tasks = [], parallelBatches = [] } = output;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {summary && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-amber)", marginBottom: 6 }}>
            Planejamento de Engenharia & DAG
          </h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-main)" }}>{summary}</p>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)", marginBottom: 8 }}>
            Tarefas Decompostas (DAG - {tasks.length})
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {tasks.map((task: any, idx: number) => {
              if (typeof task === "string") {
                return (
                  <div key={idx} className="glass-card" style={{ padding: "10px 12px", fontSize: 12 }}>
                    {task}
                  </div>
                );
              }

              return (
                <div key={idx} className="glass-card" style={{ padding: "12px 14px", borderTop: "2px solid var(--accent-amber)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-amber)" }}>
                      {task.id || `TASK-${idx + 1}`}
                    </span>
                    {task.estimate && (
                      <span className="badge" style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)", fontSize: 10 }}>
                        {task.estimate}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)", marginBottom: 4 }}>
                    {task.title || task.name}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                      {task.description}
                    </div>
                  )}
                  {task.deps && task.deps.length > 0 && (
                    <div style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                      Deps: {Array.isArray(task.deps) ? task.deps.join(", ") : String(task.deps)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
