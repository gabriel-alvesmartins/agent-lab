import React, { useState } from "react";
import {
  Compass,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  Layers,
  Layout,
  Palette,
  Cpu,
  Database,
  Cloud,
  Lock,
  Scale,
  CheckCheck,
  Kanban,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import { AgentSummary } from "../types.js";

interface AgentSidebarProps {
  agents: AgentSummary[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass size={15} />,
  ShieldAlert: <ShieldAlert size={15} />,
  SlidersHorizontal: <SlidersHorizontal size={15} />,
  FileText: <FileText size={15} />,
  Layers: <Layers size={15} />,
  Layout: <Layout size={15} />,
  Palette: <Palette size={15} />,
  Cpu: <Cpu size={15} />,
  Database: <Database size={15} />,
  Cloud: <Cloud size={15} />,
  Lock: <Lock size={15} />,
  Scale: <Scale size={15} />,
  CheckCheck: <CheckCheck size={15} />,
  Kanban: <Kanban size={15} />,
  ShieldCheck: <ShieldCheck size={15} />,
};

const PHASE_NAMES: Record<number, string> = {
  1: "Fase 1 · Descoberta & Contexto",
  2: "Fase 2 · Triagem & PRD",
  3: "Fase 3 · Macro Design & UX",
  4: "Fase 4 · Engenharia & Modelagem",
  5: "Fase 5 · Qualidade & Governança",
};

const AgentSidebarComponent: React.FC<AgentSidebarProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
}) => {
  const [search, setSearch] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const phases = [1, 2, 3, 4, 5];

  return (
    <aside
      style={{
        width: 310,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        userSelect: "none",
      }}
    >
      {/* Search Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)" }}>
            Catálogo de Agentes
          </span>
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              padding: "1px 5px",
              borderRadius: "var(--radius-xs, 3px)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {filtered.length}/15
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <Search
            size={13}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-subtle)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou capacidade..."
            style={{
              width: "100%",
              padding: "6px 28px 6px 30px",
              fontSize: 12,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-stage)",
              color: "var(--text-main)",
              outline: "none",
              transition: "border-color var(--duration-quick) var(--ease-smooth-out)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-subtle)",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Agents List by Phase */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {phases.map((phase) => {
          const phaseAgents = filtered.filter((a) => a.phase === phase);
          if (phaseAgents.length === 0) return null;

          return (
            <div key={phase} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-subtle)",
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{PHASE_NAMES[phase]}</span>
                <span style={{ fontFamily: "var(--font-mono)", opacity: 0.7 }}>{phaseAgents.length}</span>
              </div>

              <div style={{ marginTop: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                {phaseAgents.map((agent) => {
                  const isSelected = agent.id === selectedAgentId;

                  return (
                    <button
                      key={agent.id}
                      onClick={() => onSelectAgent(agent.id)}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid",
                        borderColor: isSelected ? "var(--border-medium)" : "transparent",
                        background: isSelected ? "rgba(255, 255, 255, 0.07)" : "transparent",
                        boxShadow: isSelected ? "inset 0 1px 0 rgba(255, 255, 255, 0.06)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all var(--duration-quick) var(--ease-smooth-out)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {/* Active Indicator Bar */}
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 6,
                            bottom: 6,
                            width: 2.5,
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--accent-indigo)",
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "var(--radius-xs)",
                          background: isSelected ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border-subtle)",
                          color: isSelected ? "#ffffff" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {ICON_MAP[agent.icon] || <Cpu size={13} />}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: isSelected ? 600 : 500,
                              color: isSelected ? "#ffffff" : "var(--text-main)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {agent.name}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-subtle)",
                            }}
                          >
                            P{agent.phase}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: 1,
                          }}
                        >
                          {agent.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export const AgentSidebar = React.memo(AgentSidebarComponent);
