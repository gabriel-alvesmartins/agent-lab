# 🧪 Agent Lab — Laboratório de Testes de Agentes SDLC

> **Ambiente Independente de Avaliação e Testes Isolados dos 15 Agentes Canônicos da Plataforma AI-4SDLC.**  
> Desenvolvido no âmbito do CEIA/UFG para acelerar a validação de prompts, schemas, contratos de entrada e saída e comportamentos dos agentes sem necessidade de executar a esteira completa de ponta a ponta.

---

## 🎯 Por que o Agent Lab foi criado?

No ciclo de vida padrão do framework multi-agente (`feature.workflow.yml`), os 15 agentes estão encadeados ao longo de 5 fases e 8 gates HITL:

```
[Discovery] ──▶ [RiskElicitor] ──▶ [TierClassifier] ──▶ [PM] ──▶ [SolutionArchitect] ──▶ ... ──▶ [TechLead] ──▶ [Auditor]
```

Para avaliar um agente no final do pipeline (ex: `DevOps`, `QA`, `Compliance`, `TechLead` ou `SoftwareArchitect`), era obrigatório passar por todo o fluxo prévio. O **Agent Lab** resolve esse gargalo oferecendo:

1. **Execução 100% Isolada:** Teste qualquer agente unitariamente injetando inputs manuais ou presets prontos.
2. **Spec-Driven Awareness:** Inspeção visual de *Papel*, *De quem recebe (Upstream Reads)* e *Para quem produz (Downstream)*.
3. **Dual Execution Engine:**
   - **Modo Offline (Zero Custo):** Executa o fallback determinístico do agente em milissegundos sem gastar tokens nem depender de chaves de API.
   - **Modo LLM Real:** Disparo real contra Anthropic Claude, OpenAI, Google Gemini ou Ollama local.
4. **Comparação por Diff Lado a Lado:** Compare a saída obtida com a saída esperada (Golden Reference).
5. **Painéis Visuais Ricos:** Decisões ADRs formatadas, diagramas Mermaid C4 (Nível 1 e 2), DDL PostgreSQL, matrizes BDD e DAGs de tarefas.
6. **Gestão de Cenários Customizados:** Salve suas próprias entradas diretamente no `localStorage` do navegador para reutilização futura.
7. **Exportação com 1 Clique:** Baixe `input.json`, `output.json` e o artefato renderizado `artifact.md`.

---

## 🚀 Como Iniciar

No terminal, dentro da pasta `agent-lab`:

```bash
cd agent-lab
pnpm install
pnpm dev
```

O comando iniciará simultaneamente:
- **Backend Runner API:** `http://localhost:3333`
- **Frontend Web UI:** `http://localhost:5173`

Acesse `http://localhost:5173` no seu navegador.

---

## 📋 Catálogo dos 15 Agentes Cobertos

| # | Agente | Fase | Entrada Principal | Artefato Gerado |
|---|---|---|---|---|
| 1 | **Discovery** | 1. Descoberta | `brief` | `discovery_report` |
| 2 | **RiskElicitor** | 2. Triagem | `brief`, `problemStatement` | `risk_inventory` (Sinais R1 a R9) |
| 3 | **TierClassifier** | 2. Triagem | `riskInventory` | `tier_classification` (Minimal/Limited/High) |
| 4 | **PM** | 2. PRD | `brief`, `discoveryReport` | `spec` (`spec.md` canônica) |
| 5 | **SolutionArchitect** | 3. Macro Design | `specBody`, `discoveryReport` | `solution_architecture` (C4 L1-2, ADRs) |
| 6 | **UX** | 3. Macro Design | `specBody`, `solutionArchSummary` | `ux_design` (Jornadas e Wireframes) |
| 7 | **UI** | 3. Macro Design | `specBody`, `uxFlowsSummary` | `ui_mockups` (HTML/Tailwind) |
| 8 | **SoftwareArchitect** | 4. Engenharia | `specBody`, `solutionArchSummary` | `software_architecture` (C4 L3-4) |
| 9 | **DataArchitect** | 4. Engenharia | `specBody`, `solutionArchSummary` | `data_model` (DDL PostgreSQL, DER) |
| 10 | **DevOps** | 4. Engenharia | `specBody`, `softwareArchSummary` | `devops_spec` (IaC, SLO/SLI) |
| 11 | **Security** | 4. Engenharia | `specBody`, `architect` | `threat_model` (STRIDE) |
| 12 | **Compliance** | 4. Engenharia | `specBody`, `dataModelSummary` | `compliance_assessment` (LGPD/DPIA) |
| 13 | **QA** | 5. Qualidade | `specBody`, `acListFromSpec` | `test_strategy` (Cenários BDD) |
| 14 | **TechLead** | 5. Síntese | `specBody`, `architect` | `task_breakdown` (DAG de Tarefas) |
| 15 | **Auditor** | Todos os Gates | `collected_artifacts`, `gateTarget` | `audit_review` (Checklist de Qualidade) |

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Lucide Icons, Vite, Design System Vanilla CSS (Dark Mode com Glassmorphism).
- **Backend:** Express, TypeScript (tsx), CORS, Dotenv, Zod.
- **Engine de Agentes:** Importação e execução direta dos 15 agentes compilados em `@sdlc/agents` e `@sdlc/core`.
