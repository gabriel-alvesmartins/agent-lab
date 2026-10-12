import React from "react";
import { Server, Activity, Gauge, Terminal, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";
import { Badge } from "../ui/badge.js";

interface DevOpsPanelProps {
  output: any;
}

export const DevOpsPanel: React.FC<DevOpsPanelProps> = ({ output }) => {
  if (!output || typeof output !== "object") {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)" }}>
        Nenhuma especificação de DevOps ou Infraestrutura disponível.
      </div>
    );
  }

  const {
    k8sDeployment,
    slos = [],
    observability,
    runbookHints = [],
    pipelineStages = [],
  } = output;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px" }}>
      {/* Kubernetes Topology Banner */}
      {k8sDeployment && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Server size={18} className="text-cyan-400" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
              Topologia de Implantação Kubernetes (K8s)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {k8sDeployment.topology && (
              <div style={{ padding: 10, background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Topologia</span>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>{k8sDeployment.topology}</p>
              </div>
            )}
            {k8sDeployment.replicas !== undefined && (
              <div style={{ padding: 10, background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Réplicas (HPA)</span>
                <p style={{ margin: "4px 0 0 0", fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                  {typeof k8sDeployment.replicas === "object" ? `${k8sDeployment.replicas.min}-${k8sDeployment.replicas.max}` : `${k8sDeployment.replicas} pods`}
                </p>
              </div>
            )}
            {k8sDeployment.resources && (
              <div style={{ padding: 10, background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Recursos por Pod</span>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  CPU: {k8sDeployment.resources.cpu || "500m"} | Mem: {k8sDeployment.resources.memory || "512Mi"}
                </p>
              </div>
            )}
          </div>

          {k8sDeployment.probes && (
            <div style={{ marginTop: 12, padding: 10, background: "rgba(0, 0, 0, 0.2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase" }}>Health Checks & Probes:</span>
              <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 12, color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>
                <span>Liveness: {k8sDeployment.probes.liveness || "/healthz"}</span>
                <span>Readiness: {k8sDeployment.probes.readiness || "/ready"}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SLOs & SLIs Matrix */}
      {slos.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Gauge size={18} className="text-emerald-400" />
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-emerald)" }}>
              Objetivos de Nível de Serviço (SLOs & SLIs) ({slos.length})
            </h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {slos.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>
                    {item.sli || item.metric || `SLI #${idx + 1}`}
                  </span>
                  <Badge variant="outline" size="xs" className="border-emerald-800 text-emerald-300 font-mono">
                    Meta: {item.target || "99.9%"}
                  </Badge>
                </div>
                {item.errorBudget && (
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Orçamento de Erro: <b style={{ color: "var(--accent-amber)" }}>{item.errorBudget}</b>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observability & Runbook Hints */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {/* Observability Stack */}
        {observability && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Activity size={15} className="text-violet-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-violet)" }}>
                Padrões de Observabilidade
              </h5>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--text-main)" }}>
              {observability.logs && (
                <div>
                  <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Logs: </span>
                  {observability.logs}
                </div>
              )}
              {observability.metrics && (
                <div>
                  <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Métricas: </span>
                  {observability.metrics}
                </div>
              )}
              {observability.tracing && (
                <div>
                  <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Tracing: </span>
                  {observability.tracing}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Runbook Hints */}
        {runbookHints.length > 0 && (
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Terminal size={15} className="text-cyan-400" />
              <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-cyan)" }}>
                Diretrizes de Runbook & Rollback ({runbookHints.length})
              </h5>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 4 }}>
              {runbookHints.map((hint: string, i: number) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
