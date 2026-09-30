import React, { Component, ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";
import "./index.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Agent Lab Client Error]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            background: "#09090b",
            color: "#f4f4f5",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: 28,
              borderRadius: 8,
              background: "#18181b",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              maxWidth: 640,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f87171" }}>
              Ocorreu um erro inesperado na interface do Agent Lab
            </div>
            <pre
              style={{
                background: "#09090b",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                fontFamily: "var(--font-mono, monospace)",
                color: "#fca5a5",
                whiteSpace: "pre-wrap",
                textAlign: "left",
                width: "100%",
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {this.state.error?.message || "Erro desconhecido"}
            </pre>
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                padding: "8px 18px",
                background: "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
