import React from "react";
import { Cpu, Zap, Sparkles, CheckCircle2, AlertCircle, History, Layers, Plus } from "lucide-react";
import { ModelProvidersResponse } from "../types.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";

interface HeaderProps {
  mode: "fallback" | "llm";
  onModeChange: (mode: "fallback" | "llm") => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  modelProviders: ModelProvidersResponse | null;
  serverOnline: boolean;
  onOpenHistory?: () => void;
  onOpenLibrary?: (tab?: "agents" | "presets") => void;
  onOpenCreateAgent?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  selectedModel,
  onModelChange,
  modelProviders,
  serverOnline,
  onOpenHistory,
  onOpenLibrary,
  onOpenCreateAgent,
}) => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        zIndex: 50,
      }}
    >
      {/* Brand & Context */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <Cpu size={16} className="text-zinc-100" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-main)" }}>
              Agent Lab
            </h1>
            <Badge variant="outline" size="xs" className="font-mono tracking-wider border-zinc-700 text-zinc-400">
              SDLC 1.1
            </Badge>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: -2 }}>
            Laboratório de Avaliação Isolada e Teste A/B dos Agentes
          </p>
        </div>
      </div>

      {/* Engine Status & Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Criar Novo Agente Action */}
        {onOpenCreateAgent && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateAgent}
            className="h-7 gap-1.5 px-2.5 text-xs text-cyan-300 border-cyan-800/70 hover:border-cyan-600 bg-cyan-950/30 hover:bg-cyan-900/40"
            title="Criar novo agente personalizado a partir de qualquer um dos 15 agentes SDLC"
          >
            <Plus className="h-3 w-3 text-cyan-400" />
            <span>Novo Agente</span>
          </Button>
        )}

        {/* Biblioteca de Agentes & Cenários Action */}
        {onOpenLibrary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenLibrary("agents")}
            className="h-7 gap-1.5 px-2 text-xs text-indigo-300 border-indigo-900/60 hover:border-indigo-700 bg-indigo-950/25"
            title="Abrir biblioteca de agentes cadastrados, esquemas, prompts e cenários de teste"
          >
            <Layers className="h-3 w-3 text-indigo-400" />
            <span>Biblioteca</span>
          </Button>
        )}

        {/* Histórico Action */}
        {onOpenHistory && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="h-7 gap-1.5 px-2 text-xs text-zinc-300 border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
            title="Abrir histórico de experimentos A/B salvos (Ctrl + H)"
          >
            <History className="h-3 w-3 text-zinc-400" />
            <span>Histórico</span>
            <kbd
              style={{
                fontSize: 9,
                padding: "1px 3px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "3px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-subtle)",
              }}
            >
              Ctrl+H
            </kbd>
          </Button>
        )}

        {/* Server Online Status with Transitions.dev Pulse Dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            fontSize: 11,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: serverOnline ? "var(--accent-emerald)" : "var(--accent-rose)",
              boxShadow: serverOnline ? "0 0 6px rgba(16, 185, 129, 0.5)" : "none",
            }}
          />
          <span style={{ fontWeight: 500, color: serverOnline ? "var(--text-main)" : "var(--accent-rose)" }}>
            {serverOnline ? "Engine Online" : "Offline"}
          </span>
        </div>

        <div style={{ height: 20, width: 1, background: "var(--border-subtle)" }} />

        {/* Mode Switcher: Transitions.dev P16 Sliding Tabs Pill */}
        <div className="p16-tab-container">
          <button
            onClick={() => onModeChange("fallback")}
            className={`p16-tab-trigger ${mode === "fallback" ? "active" : ""}`}
            title="Modo Determinístico: Respostas sintéticas instantâneas com zero custo e sem chaves"
          >
            <Zap size={12} className={mode === "fallback" ? "text-amber-400" : "text-zinc-500"} />
            <span>Offline (Mock)</span>
          </button>
          <button
            onClick={() => onModeChange("llm")}
            className={`p16-tab-trigger ${mode === "llm" ? "active" : ""}`}
            title="Modo LLM Real: Invoca modelos de fronteira com raciocínio real (Anthropic, OpenAI, etc.)"
          >
            <Sparkles size={12} className={mode === "llm" ? "text-indigo-400" : "text-zinc-500"} />
            <span>LLM Real</span>
          </button>
        </div>

        {/* Model Selector when LLM mode is active */}
        {mode === "llm" && modelProviders && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              style={{
                background: "var(--bg-surface-stage)",
                color: "var(--text-main)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 8px",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                outline: "none",
                cursor: "pointer",
                height: 30,
              }}
            >
              {Object.entries(modelProviders.providers).map(([key, provider]) => (
                <optgroup key={key} label={`${provider.name} ${provider.available ? "(Chave OK)" : "(Sem Chave)"}`}>
                  {provider.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
