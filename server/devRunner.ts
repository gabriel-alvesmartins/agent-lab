import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("       🧪 AGENT LAB — SDLC AGENT TESTING ENVIRONMENT    ");
console.log("========================================================\n");

// Inicia o Servidor Backend (Express na porta 3333 com live watch)
const serverProc = spawn("pnpm", ["exec", "tsx", "watch", "server/index.ts"], {
  cwd: ROOT,
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

serverProc.stdout?.on("data", (data) => {
  const line = data.toString().trim();
  if (line) console.log(`\x1b[36m[Backend API]\x1b[0m ${line}`);
});

serverProc.stderr?.on("data", (data) => {
  const line = data.toString().trim();
  if (line) console.error(`\x1b[31m[Backend Error]\x1b[0m ${line}`);
});

// Inicia o Frontend (Vite na porta 5173)
const clientProc = spawn("pnpm", ["exec", "vite", "client", "--port", "5173"], {
  cwd: ROOT,
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

clientProc.stdout?.on("data", (data) => {
  const line = data.toString().trim();
  if (line) console.log(`\x1b[35m[Frontend UI]\x1b[0m ${line}`);
});

clientProc.stderr?.on("data", (data) => {
  const line = data.toString().trim();
  if (line) console.error(`\x1b[31m[Frontend Error]\x1b[0m ${line}`);
});

// Limpeza de processos
const cleanup = () => {
  console.log("\n[Agent Lab] Encerrando processos...");
  try {
    serverProc.kill();
  } catch {}
  try {
    clientProc.kill();
  } catch {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
