import React, { useState } from "react";
import { BookmarkPlus, X } from "lucide-react";
import { Button } from "./ui/button.js";
import { Input } from "./ui/input.js";

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  defaultTitle: string;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultTitle,
}) => {
  const [title, setTitle] = useState(defaultTitle);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 5, 8, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="p7-modal-enter"
        style={{
          width: 440,
          padding: 22,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookmarkPlus size={16} className="text-zinc-300" />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>Salvar Cenário Customizado</h3>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>
              Nome do Cenário
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: FleetPulse - Teste de Carga 50k"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface-stage)",
                color: "var(--text-main)",
                outline: "none",
              }}
            />
            <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 6 }}>
              O cenário será gravado no armazenamento local (localStorage) deste navegador.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="border-zinc-700 text-zinc-300">
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-white font-medium">
              Salvar Cenário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
