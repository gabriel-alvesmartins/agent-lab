import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./ui/button.js";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Excluir",
  cancelText = "Cancelar",
  variant = "danger",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 5, 8, 0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10050,
      }}
      onClick={onClose}
    >
      <div
        className="p7-modal-enter"
        style={{
          width: 440,
          padding: 24,
          background: "var(--bg-surface)",
          border:
            variant === "danger"
              ? "1px solid rgba(244, 63, 94, 0.35)"
              : "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              backgroundColor:
                variant === "danger"
                  ? "rgba(244, 63, 94, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
              border:
                variant === "danger"
                  ? "1px solid rgba(244, 63, 94, 0.3)"
                  : "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5 text-rose-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: 6,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded-full text-zinc-400 hover:text-white -mt-1 -mr-1"
          >
            <X size={15} />
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 22,
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-zinc-700 text-zinc-300 hover:text-white h-8 px-4 text-xs font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-500 text-white font-medium h-8 px-4 text-xs shadow-md shadow-rose-950/40"
                : "bg-amber-600 hover:bg-amber-500 text-white font-medium h-8 px-4 text-xs"
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
