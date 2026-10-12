# 🧪 Agent Lab — SDLC Agent Workbench & Evaluation Lab

> **Ambiente Independente de Avaliação Isolada, Testes A/B e Engenharia de Prompts dos 15 Agentes Canônicos da Plataforma AI-4SDLC.**  
> Desenvolvido no âmbito do CEIA/UFG para acelerar a calibração de prompts, validação de contratos Zod, ajuste de hiperparâmetros e auditoria de comportamento dos agentes sem necessidade de disparar a esteira completa de ponta a ponta.

---

## 🎯 Por que o Agent Lab foi criado?

No ciclo de vida padrão do framework multi-agente (`feature.workflow.yml`), os 15 agentes operam de forma encadeada ao longo de 5 fases e múltiplos gates de aprovação humana (*Human-in-the-Loop* - HITL):

```
[Discovery] ──▶ [RiskElicitor] ──▶ [TierClassifier] ──▶ [PM] ──▶ [SolutionArchitect] ──▶ ... ──▶ [TechLead] ──▶ [Auditor]
```

Para avaliar o comportamento de agentes das fases finais (como `DevOps`, `QA`, `Compliance`, `TechLead` ou `SoftwareArchitect`), antes era necessário executar todo o pipeline prévio. O **Agent Lab** resolve esse gargalo fornecendo um laboratório de testes completo:

1. **Execução 100% Isolada:** Teste unitariamente qualquer agente fornecendo inputs manuais ou carregando cenários prontos com 1 clique.
2. **Comparativo A/B Flexível:** Compare qualquer versão do agente lado a lado (Oficial SDLC, Configuração Atual ou Versões Customizadas Salvas) com análise estruturada de impacto e diff semântico.
3. **Dual Execution Engine:**
   - **Modo Offline (Mock Determinístico):** Resposta imediata em milissegundos sem consumo de tokens nem dependência de chaves de API.
   - **Modo LLM Real:** Execução real contra provedores líderes (Anthropic Claude, OpenAI, Google Gemini ou modelos locais via Ollama).
4. **Inspeção de Contratos & Schemas Zod:** Validação estrita em tempo de execução contra os esquemas de entrada (`inputSchema`) e saída (`outputSchema`).
5. **Trilha de Auditoria & Governança SDLC:** Registro em tempo real de eventos emitidos pelo ciclo de vida do agente (`auditEvents`).
6. **Alta Performance (Zero Lag):** Arquitetura desacoplada com estado local no editor, sincronização por debounce, memoização completa e aceleração gráfica limpa.

---

## ✨ Principais Funcionalidades

### 1. Workbench de Entrada e Saída
- **Editor de Input com Resposta Instantânea:** Digitação fluida e sem travamentos, com contagem de linhas e caracteres em tempo real e atalhos rápidos (`Ctrl+Enter` para executar, `Ctrl+⇧+Enter` para A/B).
- **Formatador e Validador Integrados:** Formatação automática com indentação padronizada e checagem de erros de schema com destaque dos caminhos inválidos.
- **Seletor Unificado de Cenários & Presets:** Entradas vazias por padrão para experimentação limpa, permitindo carregar cenários oficiais de teste ou salvar novas entradas personalizadas no `localStorage`.
- **Modo Ampliar (Pop-up de Alta Resolução):** Botões `↗ Ampliar` fixados nos cantos superiores para expandir tanto o editor de entrada quanto o visualizador de saída em pop-ups amplos, ideais para diagramas C4 e payloads extensos.

### 2. Painel de Saída Multifacetado
- **Aba Estruturado:** Visualização rica e contextual por especialidade de agente:
  - *Solution/Software Architect:* Diagramas Mermaid interativos (C4 Nível 1 Context e Nível 2 Container) com modal de zoom e cópia de código Mermaid, ADRs estruturadas (make/buy/reuse) e barramentos.
  - *Data Architect:* DDL PostgreSQL completo com syntax highlighting e catálogo de tabelas/índices.
  - *QA:* Matrizes de teste BDD (Given/When/Then), cobertura de cenários e casos de borda.
  - *TechLead:* DAG de quebra de tarefas (WBS), dependências e estimativas de esforço.
  - *PM:* Visão estruturada de visão de produto, requisitos funcionais (RF) e regras de negócio.
- **Aba JSON:** JSON bruto formatado para inspeção e cópia direta.
- **Aba Artefato .md:** Visualização do artefato markdown gerado pelo agente para a documentação do repositório.
- **Aba Auditoria (Governança):** Trilha de auditoria estruturada exibindo os eventos do ciclo de vida (`agent.input`, `ARCHITECTURE_DEFINED`, etc.) com payloads e timestamps para rastreabilidade.
- **Aba Comparativo A/B:** Ativada automaticamente em execuções A/B, exibindo o cartão de **Análise de Impacto** e o **Diff Semântico** entre Lado A e Lado B, com opção de *Adotar como Referência*.

### 3. Telemetria e Métricas em Tempo Real
Na barra de telemetria superior de cada execução:
- **Latência:** Tempo de resposta em milissegundos (`ms`).
- **Modo:** Indicação clara entre `Offline (Mock)` e `LLM Real`.
- **Schema Zod:** Status de conformidade (`Validado` ou `Inválido`).
- **Tamanho da Saída:** Peso do payload em `KB` e contagem total de caracteres.
- **Tokens Estimados:** Estimativa instantânea de consumo de tokens (`~X tokens`).

### 4. Customização e Gestão de Agentes
- **Painel de Configurações do Agente:** Ajuste detalhado de:
  - *Modo de Prompt:* Canônico, Append (adicionar regras) ou Override (substituição integral).
  - *Modo de Raciocínio:* Standard, Reasoning ou Deep Thought.
  - *Nível de Risco (Risk Tier):* Minimal, Limited ou High.
  - *Hiperparâmetros:* Temperatura (0.0 a 1.0) e Esforço de Raciocínio (low, medium, high).
  - *Ferramentas Ativas:* Habilitação e desabilitação de ferramentas da esteira.
  - *Overrides de Schema:* Customização de schemas Zod de entrada e saída.
- **Edição Direta de Agentes Salvos:** Altere versões customizadas existentes diretamente pelo botão **Editar Agente**, sem necessidade de clonar ou criar novos registros.
- **Diálogos de Confirmação Seguros In-App:** Exclusão e confirmações através de modais seguros e integrados ao design system, eliminando pop-ups nativos do navegador.

---

## ⌨️ Atalhos de Teclado Globais

| Atalho | Ação |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>↵ Enter</kbd> | Executar o agente com a entrada e configuração ativa |
| <kbd>Ctrl</kbd> + <kbd>⇧ Shift</kbd> + <kbd>↵ Enter</kbd> | Executar o Teste Comparativo A/B |
| <kbd>Ctrl</kbd> + <kbd>H</kbd> | Abrir o Histórico de Experimentos |
| <kbd>Esc</kbd> | Fechar modais, gavetas de configuração e pop-ups ampliados |

---

## 🚀 Como Iniciar

### Pré-requisitos
- **Node.js** >= 18.0.0
- **pnpm** (recomendado) ou **npm**

### Instalação e Execução

No terminal, a partir da pasta raiz do `agent-lab`:

```bash
# 1. Instalar as dependências
pnpm install

# 2. Iniciar o ambiente de desenvolvimento completo
pnpm dev
```

O comando iniciará simultaneamente:
- **Backend API Runner:** `http://localhost:3333` (com watch automático de arquivos)
- **Frontend Workbench UI:** `http://localhost:5173` (Vite HMR)

Abra `http://localhost:5173` no seu navegador para utilizar o laboratório.

### Configuração de Provedores LLM (Opcional)

Para utilizar o **Modo LLM Real**, configure suas chaves de API criando um arquivo `.env` na raiz do `agent-lab` (ou utilizando as variáveis globais do sistema):

```env
# Provedores de Modelos de Linguagem
ANTHROPIC_API_KEY=sua_chave_anthropic
OPENAI_API_KEY=sua_chave_openai
GEMINI_API_KEY=sua_chave_google

# Configurações do Runner
PORT=3333
```

> **Nota:** No modo `Offline (Mock)`, nenhuma chave de API é necessária. O runner utiliza respostas determinísticas pré-calibradas para desenvolvimento com custo zero.

---

## 📋 Catálogo dos 15 Agentes Canônicos

| # | Agente | Fase SDLC | Entrada Principal (Input) | Artefato Produzido (Output) |
|:---:|---|---|---|---|
| **01** | **Discovery** | 1. Descoberta & Contexto | `brief` | `discovery_report` |
| **02** | **RiskElicitor** | 2. Triagem & PRD | `brief`, `problemStatement` | `risk_inventory` (Sinais R1 a R9) |
| **03** | **TierClassifier** | 2. Triagem & PRD | `riskInventory` | `tier_classification` (Minimal / Limited / High) |
| **04** | **PM** | 2. Triagem & PRD | `brief`, `discoveryReport` | `spec` (`spec.md` canônica e RFs) |
| **05** | **SolutionArchitect** | 3. Macro Design & UX | `specBody`, `discoveryReport` | `solution_architecture` (C4 L1-2, ADRs) |
| **06** | **UX Designer** | 3. Macro Design & UX | `specBody`, `solutionArchSummary` | `ux_design` (Jornadas e Wireframes) |
| **07** | **UI Designer** | 3. Macro Design & UX | `specBody`, `uxFlowsSummary` | `ui_mockups` (Componentes e Design Tokens) |
| **08** | **SoftwareArchitect** | 4. Engenharia & Modelagem | `specBody`, `solutionArchSummary` | `software_architecture` (C4 L3-4, Design Patterns) |
| **09** | **DataArchitect** | 4. Engenharia & Modelagem | `specBody`, `solutionArchSummary` | `data_model` (DDL PostgreSQL, DER, Índices) |
| **10** | **DevOps** | 4. Engenharia & Modelagem | `specBody`, `softwareArchSummary` | `devops_spec` (IaC, CI/CD, SLO/SLI) |
| **11** | **Security** | 4. Engenharia & Modelagem | `specBody`, `architect` | `threat_model` (Análise STRIDE, Mitigações) |
| **12** | **Compliance** | 4. Engenharia & Modelagem | `specBody`, `dataModelSummary` | `compliance_assessment` (LGPD, DPIA, Governança) |
| **13** | **QA** | 5. Qualidade & Governança | `specBody`, `acListFromSpec` | `test_strategy` (Cenários BDD Given/When/Then) |
| **14** | **TechLead** | 5. Qualidade & Governança | `specBody`, `architect` | `task_breakdown` (DAG de Tarefas e WBS) |
| **15** | **Auditor** | Todos os Gates | `collected_artifacts`, `gateTarget` | `audit_review` (Checklist de Conformidade de Gate) |

---

## 🏛️ Arquitetura do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT LAB FRONTEND (Vite)                       │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │     AgentSidebar       │  │           AgentSpecBanner            │  │
│  │   Catálogo de Fases    │  │  Papel, Upstream/Downstream & Tags   │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │       InputEditor (Memo)        │  │     OutputViewer (Memo)     │  │
│  │ - Local State (Zero Lag)        │  │ - Painéis C4 / DDL / BDD    │  │
│  │ - Debounce de Sincronização     │  │ - Comparativo A/B & Diff    │  │
│  │ - Cenários & Presets Unificados │  │ - Trilha de Auditoria SDLC  │  │
│  │ - Botão Ampliar (Pop-up)        │  │ - Métricas (KB, chars, tok) │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP REST (JSON)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT LAB BACKEND RUNNER                        │
│  ┌──────────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │   Express API :3333  │  │  Catalog Loader │  │ Zod Schema Engine │  │
│  │   /api/agents        │  │  15 Agentes     │  │ Validação Estrita │  │
│  │   /api/run & run-ab  │  │  Presets Padrão │  │ de Contratos      │  │
│  └──────────────────────┘  └─────────────────┘  └───────────────────┘  │
│                         │                     │                        │
│            ┌────────────┴──────────┐          │                        │
│            ▼                       ▼          ▼                        │
│   ┌─────────────────┐    ┌──────────────────────────────────────────┐  │
│   │ Modo Offline    │    │ Modo LLM Real                            │  │
│   │ Fallbacks Rápidos│   │ Claude / OpenAI / Gemini / Ollama Local  │  │
│   └─────────────────┘    └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias e Bibliotecas

- **Frontend:**
  - **Core:** React 19, TypeScript 5.8, Vite 6.
  - **Componentes & Ícones:** Radix UI primitives, Lucide Icons, class-variance-authority (CVA).
  - **Visualização de Diagramas:** Mermaid.js 12 (renderização gráfica de arquitetura C4).
  - **Estilização:** Vanilla CSS com design tokens modernos (Dark Mode, paleta HSL Obsidian/Zinc, micro-animações performáticas e aceleração gráfica limpa).
- **Backend:**
  - **Servidor:** Node.js, Express, TypeScript via `tsx` (live reload com zero compilation delay).
  - **Validação:** Zod 3.24 (tipagem e validação em tempo de execução).
- **Persistência Local:** `localStorage` do navegador para cenários, versões customizadas e histórico de experimentos.

---

## 📄 Licença e Créditos

Desenvolvido para a plataforma **AI-4SDLC** pelo **CEIA / UFG** (Centro de Excelência em Inteligência Artificial da Universidade Federal de Goiás).  
Uso interno e acadêmico para aceleração da engenharia de software orientada a agentes inteligentes.
