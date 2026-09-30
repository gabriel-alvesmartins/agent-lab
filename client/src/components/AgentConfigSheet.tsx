import React, { useState, useEffect } from "react";
import { X, Sliders, Check, BookmarkPlus, Play, Lock, Copy, AlertCircle, Save, Edit3 } from "lucide-react";
import { AgentCharacteristicsConfig, AgentDetail, AgentSummary, SavedAgentVersion } from "../types.js";
import { AgentConfigPanel } from "./AgentConfigPanel.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { saveAgentVersion, updateAgentVersion, loadSavedAgentVersions } from "../lib/storage.js";
import { fetchAgentDetails } from "../lib/api.js";

interface AgentConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  agents?: AgentSummary[];
  agent: AgentDetail;
  config: AgentCharacteristicsConfig;
  onChange: (cfg: AgentCharacteristicsConfig) => void;
  onReset: () => void;
  onVersionSaved?: () => void;
  onSelectAgentForWorkbench?: (agentId: string, cfg: AgentCharacteristicsConfig) => void;
  initialTab?: "prompt" | "output_schema" | "input_schema" | "inference";
  initialSaveVersionOpen?: boolean;
}

export const AgentConfigSheet: React.FC<AgentConfigSheetProps> = ({
  isOpen,
  onClose,
  agents = [],
  agent,
  config,
  onChange,
  onReset,
  onVersionSaved,
  onSelectAgentForWorkbench,
  initialTab = "prompt",
  initialSaveVersionOpen = false,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agent.id);
  const [currentDetail, setCurrentDetail] = useState<AgentDetail>(agent);
  const [versionOption, setVersionOption] = useState<string>("canonical");
  const [sheetConfig, setSheetConfig] = useState<AgentCharacteristicsConfig>(config);
  const [savedVersions, setSavedVersions] = useState<SavedAgentVersion[]>([]);
  const [isSavingVersion, setIsSavingVersion] = useState(initialSaveVersionOpen);
  const [versionName, setVersionName] = useState("");
  const [versionDesc, setVersionDesc] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Sincroniza com o agente atual recebido por props ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedAgentId(agent.id);
      setCurrentDetail(agent);
      setSheetConfig(config);
      const vers = loadSavedAgentVersions(agent.id);
      setSavedVersions(vers);

      const isModified =
        config.promptMode !== "canonical" ||
        config.outputSchemaMode === "override" ||
        config.mode !== "standard" ||
        config.temperature !== 0.2 ||
        config.effort !== "medium";
      setVersionOption(isModified ? "active" : "canonical");
    }
  }, [isOpen, agent, config]);

  useEffect(() => {
    if (initialSaveVersionOpen && isOpen) {
      setVersionName(`${currentDetail.name} - Personalizado`);
      setVersionDesc("");
      setIsSavingVersion(true);
    }
  }, [initialSaveVersionOpen, isOpen, currentDetail.name]);

  if (!isOpen) return null;

  const isReadOnly = versionOption === "canonical";

  // Quando o usuário troca de Agente SDLC no dropdown
  const handleSwitchAgent = async (newAgentId: string) => {
    if (newAgentId === selectedAgentId) return;
    setSelectedAgentId(newAgentId);
    try {
      const detail = await fetchAgentDetails(newAgentId);
      setCurrentDetail(detail);
      const vers = loadSavedAgentVersions(newAgentId);
      setSavedVersions(vers);
      setVersionOption("canonical");
      setSheetConfig({
        promptMode: "canonical",
        promptOverride: detail.canonicalPrompt || "",
        promptAppend: "",
        outputSchemaMode: "canonical",
        outputSchemaOverride: undefined,
        inputSchemaMode: "canonical",
        inputSchemaOverride: undefined,
        mode: "standard",
        riskTier: "limited",
        temperature: 0.2,
        effort: "medium",
        enabledTools: detail.toolNames || [],
      });
    } catch (err) {
      console.error("Erro ao carregar detalhes do agente:", err);
    }
  };

  // Quando o usuário troca de versão (Canônico Oficial vs Customizado)
  const handleSwitchVersion = (newVerId: string) => {
    if (newVerId === "__create_custom__") {
      handleCloneToCustom();
      return;
    }
    setVersionOption(newVerId);
    if (newVerId === "canonical") {
      setSheetConfig({
        promptMode: "canonical",
        promptOverride: currentDetail.canonicalPrompt || "",
        promptAppend: "",
        outputSchemaMode: "canonical",
        outputSchemaOverride: undefined,
        inputSchemaMode: "canonical",
        inputSchemaOverride: undefined,
        mode: "standard",
        riskTier: "limited",
        temperature: 0.2,
        effort: "medium",
        enabledTools: currentDetail.toolNames || [],
      });
    } else if (newVerId === "active") {
      setSheetConfig(config);
    } else {
      const found = savedVersions.find((v) => v.id === newVerId);
      if (found) {
        setSheetConfig(found.config);
      }
    }
  };

  // Criar cópia personalizada a partir do oficial
  const handleCloneToCustom = () => {
    setVersionName(`${currentDetail.name} - Personalizado`);
    setVersionDesc("");
    setIsSavingVersion(true);
  };

  // Salvar versão customizada
  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;

    const newConfig: AgentCharacteristicsConfig = {
      ...sheetConfig,
      promptMode: "override",
      promptOverride: sheetConfig.promptOverride || currentDetail.canonicalPrompt || "",
    };

    const newVer = saveAgentVersion({
      agentId: currentDetail.id,
      name: versionName.trim(),
      description: versionDesc.trim() || undefined,
      config: newConfig,
    });

    const vers = loadSavedAgentVersions(currentDetail.id);
    setSavedVersions(vers);
    setVersionOption(newVer.id);
    setSheetConfig(newVer.config);
    if (selectedAgentId === agent.id) {
      onChange(newVer.config);
    }
    setSaveSuccessMessage(`Versão "${versionName.trim()}" criada com sucesso!`);
    setIsSavingVersion(false);
    if (onVersionSaved) onVersionSaved();
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Salvar alterações na versão customizada atualmente selecionada
  const isCustomSavedVersion = versionOption !== "canonical" && versionOption !== "active";
  const currentSavedVersion = savedVersions.find((v) => v.id === versionOption);

  const handleUpdateCurrentVersion = () => {
    if (!currentSavedVersion) return;
    const newConfig: AgentCharacteristicsConfig = {
      ...sheetConfig,
      promptMode: "override",
      promptOverride: sheetConfig.promptOverride || currentDetail.canonicalPrompt || "",
    };

    updateAgentVersion(currentSavedVersion.id, {
      config: newConfig,
    });

    const vers = loadSavedAgentVersions(currentDetail.id);
    setSavedVersions(vers);
    if (selectedAgentId === agent.id) {
      onChange(newConfig);
    }
    setSaveSuccessMessage(`Alterações salvas na versão "${currentSavedVersion.name}" com sucesso!`);
    if (onVersionSaved) onVersionSaved();
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Selecionar este agente para testar na bancada
  const handleSelectForWorkbench = () => {
    if (onSelectAgentForWorkbench) {
      onSelectAgentForWorkbench(selectedAgentId, sheetConfig);
    } else {
      onChange(sheetConfig);
      onClose();
    }
  };

  return (
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
        backgroundColor: "rgba(5, 5, 8, 0.85)",
      }}
      onClick={onClose}
    >
      <div
        className="p3-drawer-enter"
        style={{
          width: "100%",
          maxWidth: "min(1150px, 94vw)",
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
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Left: Icon, Title & Selectors */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-main)",
              }}
            >
              <Sliders size={16} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                  Configurações do Agente
                </h3>

                {/* Seletor de Agente SDLC */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)" }}>Agente:</span>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => handleSwitchAgent(e.target.value)}
                    style={{
                      background: "var(--bg-surface-stage)",
                      color: "var(--text-main)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-sm)",
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Fase {a.phase})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Versão */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)" }}>Versão:</span>
                  <select
                    value={versionOption}
                    onChange={(e) => handleSwitchVersion(e.target.value)}
                    style={{
                      background: isReadOnly ? "rgba(99, 102, 241, 0.15)" : "var(--bg-surface-stage)",
                      color: isReadOnly ? "var(--accent-indigo, #818cf8)" : "var(--text-main)",
                      border: isReadOnly ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-sm)",
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="canonical">🔒 Oficial SDLC (Canônico - Somente Leitura)</option>
                    <option value="active">✎ Configuração da Sessão (Personalizada)</option>
                    {savedVersions.length > 0 && (
                      <optgroup label="Versões Salvas deste Agente">
                        {savedVersions.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="__create_custom__">➕ Criar Nova Versão Personalizada...</option>
                  </select>
                </div>

                {/* Status Badge */}
                {isReadOnly ? (
                  <Badge variant="secondary" size="xs">
                    <Lock size={10} className="mr-1" /> Imutável (Oficial)
                  </Badge>
                ) : (
                  <Badge variant="warning" size="xs">
                    ✎ Editável (Personalizado)
                  </Badge>
                )}
              </div>

              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                {isReadOnly
                  ? `Visualizando parâmetros originais de ${currentDetail.name}. Prompts e schemas são protegidos.`
                  : `Personalize o prompt de sistema, schemas e hiperparâmetros de ${currentDetail.name}.`}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {saveSuccessMessage && (
              <span className="text-xs text-emerald-400 font-medium animate-fade-in mr-2">
                ✓ {saveSuccessMessage}
              </span>
            )}

            {/* BOTÃO PRINCIPAL: Selecionar este agente para testar inputs */}
            <Button
              size="sm"
              onClick={handleSelectForWorkbench}
              className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5"
              title="Carregar este agente e esta configuração na bancada de testes para enviar inputs"
            >
              <Play size={12} className="fill-white" />
              <span>Selecionar este Agente para Testar</span>
            </Button>

            {isReadOnly ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloneToCustom}
                className="h-8 text-xs border-indigo-700 text-indigo-300 hover:text-white bg-indigo-950/30"
                title="Criar cópia customizada editável a partir deste agente oficial"
              >
                <Copy size={12} className="mr-1.5 text-indigo-400" />
                <span>Personalizar Agente</span>
              </Button>
            ) : isCustomSavedVersion ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleUpdateCurrentVersion}
                  className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm"
                  title="Salvar alterações diretamente nesta versão personalizada sem criar uma nova"
                >
                  <Save size={12} className="mr-1.5" />
                  <span>Salvar Alterações</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVersionName(`${currentSavedVersion?.name || currentDetail.name} (Cópia)`);
                    setVersionDesc("");
                    setIsSavingVersion(true);
                  }}
                  className="h-8 text-xs border-cyan-800/60 text-cyan-300 hover:text-cyan-100 bg-cyan-950/20"
                  title="Salvar como uma nova versão independente"
                >
                  <BookmarkPlus size={12} className="mr-1.5 text-cyan-400" />
                  <span>Salvar Como Nova Versão</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVersionName(`${currentDetail.name} - Personalizado`);
                  setVersionDesc("");
                  setIsSavingVersion(true);
                }}
                className="h-8 text-xs border-cyan-800/60 text-cyan-300 hover:text-cyan-100 bg-cyan-950/20"
                title="Salvar esta configuração como uma versão nomeada do agente"
              >
                <BookmarkPlus size={12} className="mr-1.5 text-cyan-400" />
                <span>Salvar Nova Versão</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-zinc-400 hover:text-white"
              title="Fechar painel"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Inline Save Version Form Bar */}
        {isSavingVersion && (
          <div
            style={{
              padding: "12px 22px",
              background: "rgba(8, 145, 178, 0.12)",
              borderBottom: "1px solid rgba(8, 145, 178, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 6 }}>
                <BookmarkPlus size={14} className="text-cyan-400" />
                Salvar Configuração como Versão Customizada de {currentDetail.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSavingVersion(false)}
                className="h-6 w-6 p-0 text-zinc-400"
              >
                <X size={13} />
              </Button>
            </div>
            <form onSubmit={handleSaveVersion} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Nome da versão (ex: Strict BDD, FinOps, Edge IoT)"
                style={{
                  flex: "1 1 260px",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-surface-stage)",
                  border: "1px solid var(--border-medium)",
                  color: "var(--text-main)",
                  fontSize: 12,
                  outline: "none",
                }}
                autoFocus
              />
              <input
                type="text"
                value={versionDesc}
                onChange={(e) => setVersionDesc(e.target.value)}
                placeholder="Descrição opcional..."
                style={{
                  flex: "1 1 240px",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-surface-stage)",
                  border: "1px solid var(--border-medium)",
                  color: "var(--text-main)",
                  fontSize: 12,
                  outline: "none",
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!versionName.trim()}
                className="h-8 px-4 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Confirmar e Salvar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSavingVersion(false)}
                className="h-8 px-3 text-xs text-zinc-400"
              >
                Cancelar
              </Button>
            </form>
          </div>
        )}

        {/* Scrollable Body: Full size AgentConfigPanel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          <AgentConfigPanel
            agent={currentDetail}
            config={sheetConfig}
            onChange={(newCfg) => {
              if (!isReadOnly) {
                setSheetConfig(newCfg);
                if (selectedAgentId === agent.id && versionOption === "active") {
                  onChange(newCfg);
                }
              }
            }}
            onReset={() => {
              if (!isReadOnly) {
                handleSwitchVersion("canonical");
              }
            }}
            initialTab={initialTab}
            isReadOnly={isReadOnly}
            onRequestCloneToCustom={handleCloneToCustom}
          />
        </div>

        {/* Footer info bar */}
        <div
          style={{
            padding: "8px 22px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-stage)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-subtle)",
          }}
        >
          <span>Pressione <kbd className="font-mono text-[10px]">Esc</kbd> para fechar</span>
          <span>
            {isReadOnly
              ? "🔒 Agente Oficial SDLC: Modo de leitura protegido"
              : "✎ Agente Personalizado: Alterações salvas persistem localmente"}
          </span>
        </div>
      </div>
    </div>
  );
};
