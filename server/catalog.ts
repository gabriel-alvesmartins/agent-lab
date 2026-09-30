export interface AgentMetadata {
  id: string;
  name: string;
  phase: number;
  phaseName: string;
  category: string;
  description: string;
  role: string;
  icon: string;
  badgeColor: string;
  readsFrom: Array<{
    source: string;
    agent: string;
    description: string;
    required: boolean;
  }>;
  produces: {
    artifact: string;
    title: string;
    description: string;
    consumers: string[];
  };
  inputSchemaFields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  presets: Array<{
    id: string;
    title: string;
    description: string;
    input: Record<string, unknown>;
    expectedOutput?: Record<string, unknown>;
  }>;
}

export const AGENTS_CATALOG: Record<string, AgentMetadata> = {
  Discovery: {
    id: "Discovery",
    name: "Discovery",
    phase: 1,
    phaseName: "Fase 1: Descoberta",
    category: "Negócio & Elicitação",
    description: "Converte o briefing livre do usuário em declaração estruturada de problemas, personas e Jobs-To-Be-Done (JTBD).",
    role: "Identificação das dores de negócio, usuários-chave e objetivos antes da redação da especificação formal.",
    icon: "Compass",
    badgeColor: "#3b82f6",
    readsFrom: [
      {
        source: "Briefing Livre",
        agent: "Usuário / Stakeholder",
        description: "Texto em linguagem natural contendo a ideia, dores e necessidades do produto.",
        required: true,
      },
    ],
    produces: {
      artifact: "discovery_report",
      title: "Discovery Report (00-discovery/report.md)",
      description: "Problem statement, personas identificadas, JTBDs e perguntas em aberto.",
      consumers: ["PM", "RiskElicitor", "UX", "SolutionArchitect"],
    },
    inputSchemaFields: [
      { name: "brief", type: "string", required: true, description: "Briefing do produto em texto livre." },
      { name: "specId", type: "string", required: false, description: "Identificador preliminar (default: F-discovery-stage)." },
      { name: "parent", type: "string", required: false, description: "ID do épico ou produto pai (default: PROD-001)." },
    ],
    presets: [
      {
        id: "fleetpulse",
        title: "FleetPulse — Telemetria de Frotas IoT",
        description: "Cenário canônico de rastreamento veicular e ingestão massiva de eventos em tempo real.",
        input: {
          brief: "Precisamos de uma plataforma de telemetria veicular para frotas pesadas chamada FleetPulse. As transportadoras perdem até 18% em combustível e manutenção corretiva por falta de visibilidade em tempo real. O sistema precisa coletar dados de 50.000 caminhões a cada 5 segundos (picos de 15.000 eventos/s), emitir alertas em menos de 2 segundos para o navegador do despachante e sincronizar ordens de serviço com ERPs como SAP e TOTVS.",
          specId: "F-FLEET-001",
          parent: "PROD-LOGISTICS",
        },
      },
      {
        id: "fintech_pix",
        title: "Fintech MEI — Pix e Conciliação",
        description: "Plataforma de gestão financeira e liquidação Pix para microempreendedores individuais.",
        input: {
          brief: "Criar um sistema de conciliação bancária automática e gateway Pix para MEIs com faturamento de até R$ 81 mil/ano. O aplicativo deve categorizar despesas via IA, emitir cobranças com QR Code dinâmico e alertar sobre proximidade do teto tributário do Simples Nacional.",
          specId: "F-FINTECH-002",
          parent: "PROD-FINANCE",
        },
      },
    ],
  },

  RiskElicitor: {
    id: "RiskElicitor",
    name: "Risk Elicitor",
    phase: 2,
    phaseName: "Fase 2: Triagem & PRD",
    category: "Governança & Riscos",
    description: "Extrai 9 sinais objetivos de risco (R1 a R8 para dados pessoais, finanças, infraestrutura e R9 para envolvimento de IA).",
    role: "Mapeamento sistemático de superfície regulatória, privacidade e criticidade operacional para classificar o tier.",
    icon: "ShieldAlert",
    badgeColor: "#f59e0b",
    readsFrom: [
      {
        source: "Briefing Livre",
        agent: "Usuário",
        description: "Texto inicial com escopo.",
        required: true,
      },
      {
        source: "discovery_report",
        agent: "Discovery",
        description: "Sinais de personas, problem statement e restrições descobertas.",
        required: false,
      },
    ],
    produces: {
      artifact: "risk_inventory",
      title: "Inventário de Riscos (10-governance/risk-inventory.md)",
      description: "Catálogo dos 9 vetores de risco e sinais de sensibilidade para guiar a conformidade.",
      consumers: ["TierClassifier", "Auditor"],
    },
    inputSchemaFields: [
      { name: "brief", type: "string", required: true, description: "Briefing ou escopo da funcionalidade." },
      { name: "problemStatement", type: "string", required: false, description: "Problema sintetizado pelo Discovery." },
      { name: "personas", type: "string[]", required: false, description: "Lista de personas identificadas." },
      { name: "jobsToBeDone", type: "string[]", required: false, description: "Lista de JTBD mapeados." },
    ],
    presets: [
      {
        id: "fleetpulse_risks",
        title: "FleetPulse — Sinais de Risco IoT",
        description: "Sinais de risco para rastreamento contínuo de motoristas, dados de localização e alta disponibilidade.",
        input: {
          brief: "FleetPulse rastreia 50.000 caminhoneiros via OBD-II/GPS a cada 5 segundos com dados de localização geográfica contínua e telemetria de freios.",
          problemStatement: "Transportadoras perdem milhões com atrasos e acidentes devido à ausência de telemetria em tempo real com baixa latência.",
          personas: ["PER-1: Despachante Logístico", "PER-2: Motorista Rodoviário"],
          jobsToBeDone: ["JTBD-1: Monitorar status e anomalias de condução em tempo real"],
        },
      },
    ],
  },

  TierClassifier: {
    id: "TierClassifier",
    name: "Tier Classifier",
    phase: 2,
    phaseName: "Fase 2: Triagem & PRD",
    category: "Governança & Riscos",
    description: "Classifica o nível de risco do projeto (minimal, limited, high, high_risk) com base na ISO 27005 e regulações aplicáveis.",
    role: "Determina o rigor de governança, quantidade de perguntas bloqueantes e quais gates exigem confirmação estrita.",
    icon: "SlidersHorizontal",
    badgeColor: "#ef4444",
    readsFrom: [
      {
        source: "risk_inventory",
        agent: "RiskElicitor",
        description: "Sinais R1 a R9 mapeados.",
        required: true,
      },
    ],
    produces: {
      artifact: "tier_classification",
      title: "Classificação de Tier (10-governance/tier-assessment.md)",
      description: "Tier de risco justificado (minimal/limited/high/high_risk) e frameworks mandatórios.",
      consumers: ["PM", "Auditor", "Gates HITL"],
    },
    inputSchemaFields: [
      { name: "riskInventory", type: "object", required: true, description: "Objeto com o inventário de riscos e sinais R1-R9." },
      { name: "cwd", type: "string", required: false, description: "Diretório de trabalho do projeto." },
      { name: "complianceOfficer", type: "string", required: false, description: "Responsável de compliance opcional." },
    ],
    presets: [
      {
        id: "fleetpulse_tier",
        title: "FleetPulse — Triagem High Risk (LGPD + Telemetria Contínua)",
        description: "Classificação de risco elevado por monitoramento contínuo de pessoas naturais (motoristas CLT/PJ).",
        input: {
          riskInventory: {
            r1_personal_data: true,
            r2_financial_data: false,
            r3_vulnerability_surface: true,
            r4_critical_infrastructure: true,
            r5_scale_volume: true,
            r9_ai_involvement: true,
            justification: "Rastreamento geográfico contínuo constitui dado pessoal e dado de comportamento do trabalhador sob a LGPD.",
          },
        },
      },
    ],
  },

  PM: {
    id: "PM",
    name: "Product Manager (PM)",
    phase: 2,
    phaseName: "Fase 2: Triagem & PRD",
    category: "Produto & Especificação",
    description: "Redige a especificação canônica do produto (PRD / spec.md) com Requisitos Funcionais, Requisitos Não-Funcionais e Critérios de Aceitação com tags @test.",
    role: "Transforma a necessidade de negócio no documento de engenharia que serve de contrato para todos os arquitetos e desenvolvedores.",
    icon: "FileText",
    badgeColor: "#10b981",
    readsFrom: [
      {
        source: "discovery_report",
        agent: "Discovery",
        description: "Dores, personas e JTBD.",
        required: true,
      },
      {
        source: "tier_classification",
        agent: "TierClassifier",
        description: "Nível de risco para calibrar rigor de NFRs.",
        required: false,
      },
    ],
    produces: {
      artifact: "spec",
      title: "Canonical PRD (.specs/features/F-X/spec.md)",
      description: "Documento canônico contendo User Stories, ACs vinculados a testes e NFRs ISO 25010.",
      consumers: ["Todos os agentes das Fases 3, 4 e 5"],
    },
    inputSchemaFields: [
      { name: "brief", type: "string", required: true, description: "Briefing do produto ou feature." },
      { name: "discoveryReport", type: "string", required: false, description: "Conteúdo do Discovery Report gerado na fase 1." },
      { name: "riskTier", type: "string", required: false, description: "Nível de risco (minimal, limited, high, high_risk)." },
      { name: "parent", type: "string", required: false, description: "Identificador do épico pai (default: PROD-001)." },
      { name: "owners", type: "string[]", required: false, description: "Responsáveis pelo produto." },
    ],
    presets: [
      {
        id: "fleetpulse_prd",
        title: "FleetPulse — Especificação PRD",
        description: "Geração da PRD com RFs de telemetria, push WebSocket e integração ERP.",
        input: {
          brief: "Plataforma FleetPulse: telemetria veicular para 50.000 caminhões com latência < 2s e integração com SAP/TOTVS.",
          discoveryReport: "Problema: transportadoras perdem até 18% em combustível. Personas: Despachante Logístico e Motorista. JTBD: Alertas preventivos de colisão e superaquecimento.",
          riskTier: "high",
          parent: "PROD-LOGISTICS",
          owners: ["@joao.campista", "@ceia.ufg"],
        },
      },
    ],
  },

  SolutionArchitect: {
    id: "SolutionArchitect",
    name: "Solution Architect",
    phase: 3,
    phaseName: "Fase 3: Macro Design",
    category: "Arquitetura Macro",
    description: "Modela o C4 Nível 1 (System Context) e Nível 2 (Container), define ADRs macro (make/buy/reuse), barramentos e persistência de alto nível.",
    role: "Estabelece a fundação tecnológica macro, fronteiras de containers e padrões de integração externa antes do design visual e da engenharia detalhada.",
    icon: "Layers",
    badgeColor: "#8b5cf6",
    readsFrom: [
      {
        source: "spec",
        agent: "PM",
        description: "PRD canônica estruturada (specBody extraído do spec.md).",
        required: true,
      },
      {
        source: "discovery_report",
        agent: "Discovery",
        description: "Contexto de dores de negócio, personas e escala pretendida (summary_discovery).",
        required: false,
      },
    ],
    produces: {
      artifact: "solution_architecture",
      title: "Solution Architecture (30-architecture/solution-architecture.md)",
      description: "Diagramas C4 Nível 1 e 2 em Mermaid, ADRs macro, componentes macro e mitigação de riscos estruturais.",
      consumers: ["UX", "SoftwareArchitect", "DataArchitect", "TechLead", "Security", "Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo em Markdown da PRD (mínimo 20 caracteres)." },
      { name: "specId", type: "string", required: false, description: "ID da feature (default: F-unknown)." },
      { name: "parent", type: "string", required: false, description: "Produto pai (default: PROD-001)." },
      { name: "archMode", type: "string", required: false, description: "Modo do arquiteto: 'solution' (C4 1-2) ou 'software' (C4 3-4)." },
      { name: "discoveryReport", type: "string", required: false, description: "Resumo do Discovery upstream." },
      { name: "criticFeedback", type: "string", required: false, description: "Feedback de refino rejeitado em pre-gate/Auditor." },
    ],
    presets: [
      {
        id: "fleetpulse_canonical",
        title: "FleetPulse — Macro Arquitetura Canônica",
        description: "O exemplo canônico completo documentado na plataforma (MQTT + Kafka + TimescaleDB + WebSockets).",
        input: {
          specId: "F-FLEET-001",
          parent: "PROD-LOGISTICS",
          archMode: "solution",
          discoveryReport: "Dores identificadas: transportadoras perdem até 18% de combustível por rotas ineficientes e frenagens bruscas; alertas de manutenção preventiva chegam tarde demais gerando paradas não planejadas. Stakeholders exigem telemetria com latência máxima de ingestão de 2 segundos para frotas de até 50.000 veículos simultâneos.",
          specBody: "# PRD: FleetPulse — Telemetria de Frotas em Tempo Real\n\n## 1. Escopo e Objetivos\nMonitoramento contínuo de veículos de carga via módulos embarcados (OBD-II/GPS), ingestão contínua de telemetria, detecção de eventos críticos (excesso de velocidade, superaquecimento do motor) e dashboards operacionais em tempo real para despachantes de frotas.\n\n## 2. Requisitos Funcionais (RF)\n- RF-01: Ingestão de telemetria (GPS, velocidade, RPM, temperatura, dados do barramento CAN) a cada 5 segundos por veículo ativo.\n- RF-02: Emissão e exibição de alertas instantâneos no navegador do despachante quando parâmetros críticos forem violados.\n- RF-03: Integração para sincronização de custos de manutenção e odômetro com ERPs corporativos (SAP e TOTVS).\n\n## 3. Requisitos Não-Funcionais (RNF)\n- RNF-01: Suportar pico de 15.000 eventos/segundo na ingestão, garantindo retenção de histórico para auditoria por 1 ano.\n- RNF-02: Alta disponibilidade de 99.9% (SLA global da plataforma).\n- RNF-03: Latência ponta-a-ponta (do envio do pacote pelo rastreador à notificação na tela) menor que 2 segundos.",
        },
        expectedOutput: {
          summary: "Arquitetura orientada a eventos para ingestão massiva de telemetria veicular em alta escala (15k eps), combinando protocolo MQTT para borda, Apache Kafka para desacoplamento de fluxo, TimescaleDB para séries temporais e API Fastify/WebSockets para push em tempo real aos despachantes.",
          decisions: [
            "AD-1: Adoção do protocolo MQTT via EMQX para conexão de dispositivos embarcados | rationale: Redução drástica de overhead de rede em conexões móveis 2G/3G/4G instáveis em comparação ao HTTPS | quality_driver: reliability | build_vs_buy: buy | alternatives: HTTPS REST Gateway (rejeitada: overhead de handshake TLS); CoAP (rejeitada: ecossistema limitado) | reversible: true",
            "AD-2: Uso de Apache Kafka como backbone assíncrono particionado por vehicle_id | rationale: Garante ordenação estrita de eventos temporais por veículo e absorção de picos de até 15.000 eps sem backpressure | quality_driver: scalability | build_vs_buy: buy | alternatives: RabbitMQ (rejeitada: menor throughput de streaming); AWS SQS (rejeitada: falta de garantia de ordem) | reversible: false",
            "AD-3: TimescaleDB para armazenamento de telemetria histórica | rationale: Permite consultas analíticas de séries temporais com compressão nativa de 90% mantendo ecossistema SQL | quality_driver: performance | build_vs_buy: reuse | alternatives: InfluxDB (rejeitada: menor interoperabilidade SQL); MongoDB (rejeitada: CPU excessiva) | reversible: true",
            "AD-4: WebSocket dedicado com Push Gateway no Fastify para atualização da tela | rationale: Atende à latência ponta-a-ponta < 2s sem polling | quality_driver: performance | build_vs_buy: make | alternatives: SSE (rejeitada: comunicação estritamente unidirecional); Long Polling (rejeitada: latência imprevisível) | reversible: true",
          ],
          components: [
            "C-1: IoTMessageGateway | Broker MQTT para recepção dos dados dos veículos | deps: -",
            "C-2: IngestionEngine | Worker de alta performance para validação de checksum e descompressão | deps: IoTMessageGateway; EventStream",
            "C-3: EventStream | Barramento Kafka desacoplador de eventos de telemetria | deps: -",
            "C-4: RulesEngine | Processador de eventos complexos (CEP) e detecção de anomalias em tempo real | deps: EventStream; TelemetryStore",
            "C-5: CoreApi | API GraphQL e servidor WebSockets para despachantes | deps: EventStream; TransactionalDB; TelemetryStore",
            "C-6: FrontendDashboard | Interface web interativa para os operadores de logística | deps: CoreApi",
            "C-7: TelemetryStore | Banco de séries temporais de alta densidade | deps: -",
            "C-8: TransactionalDB | Banco relacional para dados de cadastro e segurança | deps: -",
          ],
          risks: [
            "R-1: Rajada de reconexões MQTT (thundering herd) em quedas de sinal 4G em túneis | high/high | mitigation: Jitter aleatório e rate-limiting no EMQX.",
            "R-2: Crescimento acelerado do volume em disco das séries temporais | medium/high | mitigation: Data retention automatizada com compressão após 30 dias.",
          ],
          open_questions: [
            "Qual o SLA de retenção em tier quente vs frio para os dados do barramento CAN?",
            "Será necessário suporte a protocolo legado OBD-II via SMS em áreas de sombra de conectividade?",
            "Qual a janela máxima tolerável de atraso na sincronização com os ERPs corporativos (SAP/TOTVS)?"
          ],
          c4Context: `C4Context
  title FleetPulse - Monitoramento de Frotas (Nível 1: Contexto de Sistema)
  Person(despachante, "Despachante Operacional", "Supervisiona a frota em tempo real via dashboard web")
  Person(motorista, "Motorista de Carga", "Conduz o veículo monitorado por telemetria")
  System(fleetpulse, "Plataforma FleetPulse", "Ingestão massiva de telemetria, detecção de anomalias e push de alertas")
  System_Ext(erp, "ERP Corporativo (SAP/TOTVS)", "Sincronização de custos de manutenção e odômetro")
  System_Ext(emqx, "Broker MQTT (EMQX)", "Terminação TLS e conexão contínua com os módulos OBD-II")
  Rel(motorista, fleetpulse, "Transmite telemetria CAN/GPS via módulo embarcado", "MQTT / 4G")
  Rel(fleetpulse, despachante, "Envia alertas e posições atualizadas < 2s", "WebSocket / TLS")
  Rel(fleetpulse, erp, "Sincroniza custos e odômetro", "HTTPS / REST")`,
          c4Container: `C4Container
  title FleetPulse - Arquitetura de Containers (Nível 2: Containers Macro)
  Person(despachante, "Despachante Operacional", "Visualiza mapas e alertas operacionais")
  Container(frontend, "Frontend Dashboard", "React + Tailwind + WebSockets", "Interface de monitoramento em tempo real")
  Container(gateway, "IoT Message Gateway", "EMQX Broker / Node", "Ingestão e descompressão de mensagens MQTT")
  Container(kafka, "Event Stream (Kafka)", "Apache Kafka", "Backbone assíncrono particionado por vehicle_id")
  Container(rules, "Rules Engine", "Go / Flink Worker", "Processamento de eventos complexos e alertas imediatos")
  Container(api, "Core API", "Fastify / Node.js", "API REST e servidor WebSockets para push")
  ContainerDb(timescale, "Telemetry Store", "TimescaleDB", "Banco de dados otimizado para séries temporais")
  ContainerDb(postgres, "Transactional DB", "PostgreSQL", "Dados cadastrais de frotas e credenciais")
  Rel(despachante, frontend, "Acessa dashboard", "HTTPS")
  Rel(frontend, api, "Conecta para receber push de eventos", "WSS / JSON")
  Rel(gateway, kafka, "Publica eventos brutos de telemetria", "Kafka Wire")
  Rel(kafka, rules, "Consome stream de eventos", "Kafka Consumer")
  Rel(kafka, timescale, "Persiste séries temporais", "Batch Insert")
  Rel(rules, api, "Dispara notificação de violação", "gRPC / Event")
  Rel(api, postgres, "Consulta metadados de veículos", "SQL")`
        },
      },
    ],
  },

  UX: {
    id: "UX",
    name: "UX Designer",
    phase: 3,
    phaseName: "Fase 3: Macro Design",
    category: "Design & Experiência",
    description: "Converte os requisitos e a arquitetura macro em jornadas humanas, fluxos de interação em diagramas Mermaid e wireframes textuais.",
    role: "Garante usabilidade, minimização de carga cognitiva do operador e alinhamento ergonômico com os requisitos antes do desenho das telas.",
    icon: "Layout",
    badgeColor: "#ec4899",
    readsFrom: [
      {
        source: "spec",
        agent: "PM",
        description: "User Stories e Requisitos Funcionais.",
        required: true,
      },
      {
        source: "discovery_report",
        agent: "Discovery",
        description: "Síntese de personas, JTBD e dores identificadas (summary_discovery).",
        required: false,
      },
      {
        source: "solution_architecture",
        agent: "SolutionArchitect",
        description: "Containers, canais WebSocket e protocolos disponíveis.",
        required: true,
      },
    ],
    produces: {
      artifact: "ux_design",
      title: "UX Flows & Wireframes (20-design/ux-flows.md)",
      description: "Diagramas de fluxo Mermaid, matriz de personas e wireframes textuais.",
      consumers: ["UI", "SoftwareArchitect", "DataArchitect"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "discoveryReport", type: "string", required: false, description: "Relatório de personas e dores." },
      { name: "solutionArchSummary", type: "string", required: false, description: "Resumo da arquitetura de containers da Solution." },
      { name: "focusAreas", type: "string[]", required: false, description: "Áreas de foco prioritárias para o fluxo." },
    ],
    presets: [
      {
        id: "fleetpulse_ux",
        title: "FleetPulse — Jornada do Despachante",
        description: "Fluxo de monitoramento de mapa ao vivo, recebimento de alerta sonoro/visual e despacho de socorro.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Despachante visualiza mapa com 50k caminhões. Em caso de superaquecimento, um alerta modal deve abrir em menos de 2s para autorizar parada de emergência.",
          solutionArchSummary: "Push via WebSockets dedicados a partir do Fastify; dados no TimescaleDB e Aurora PostgreSQL.",
          focusAreas: ["Dashboard Operador", "Alerta de Superaquecimento"],
        },
      },
    ],
  },

  UI: {
    id: "UI",
    name: "UI Designer",
    phase: 3,
    phaseName: "Fase 3: Macro Design",
    category: "Design & Experiência",
    description: "Produz protótipos de tela e design tokens utilizando HTML + Tailwind ou integração via Figma MCP.",
    role: "Materializa os wireframes do UX em componentes visuais polidos, com estados de hover, loading e empty states prontos.",
    icon: "Palette",
    badgeColor: "#d946ef",
    readsFrom: [
      {
        source: "ux_design",
        agent: "UX",
        description: "Fluxos de interação e wireframes aprovados.",
        required: true,
      },
      {
        source: "spec",
        agent: "PM",
        description: "Requisitos de tela e dados a exibir.",
        required: true,
      },
    ],
    produces: {
      artifact: "ui_mockups",
      title: "UI Mockups (20-design/ui-mockups.md)",
      description: "Protótipos de interface em código HTML/Tailwind ou links interativos do Figma.",
      consumers: ["SoftwareArchitect", "Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "uxFlowsSummary", type: "string", required: false, description: "Resumo dos fluxos de tela definidos pelo UX." },
      { name: "figmaEnabled", type: "boolean", required: false, description: "Flag para usar Figma MCP em vez de HTML/Tailwind." },
    ],
    presets: [
      {
        id: "fleetpulse_ui",
        title: "FleetPulse — Dashboard de Telemetria",
        description: "Mockup de interface para o despachante com painel lateral de alertas e mapa de calor veicular.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Tela dividida com mapa interativo central, sidebar de veículos em alerta e drawer de detalhes da telemetria.",
          uxFlowsSummary: "Fluxo 1: Despachante clica no veículo no mapa → abre drawer com gráficos de RPM e temperatura.",
          figmaEnabled: false,
        },
      },
    ],
  },

  SoftwareArchitect: {
    id: "SoftwareArchitect",
    name: "Software Architect",
    phase: 4,
    phaseName: "Fase 4: Engenharia & Detalhamento",
    category: "Engenharia & Código",
    description: "Modela o C4 Nível 3 (Componentes) e Nível 4 (Código), especificando interfaces de software, tratamento de exceções e design patterns internos.",
    role: "Decompõe os macro containers da Solution em módulos de código, rotas de API, middlewares e contratos tipados.",
    icon: "Cpu",
    badgeColor: "#06b6d4",
    readsFrom: [
      {
        source: "solution_architecture",
        agent: "SolutionArchitect",
        description: "Containers, tecnologias e barramentos definidos na Fase 3.",
        required: true,
      },
      {
        source: "ux_design",
        agent: "UX",
        description: "Jornadas e interações do usuário.",
        required: true,
      },
      {
        source: "ui_mockups",
        agent: "UI",
        description: "Telas e dados a serem alimentados pela API.",
        required: false,
      },
    ],
    produces: {
      artifact: "software_architecture",
      title: "Software Architecture (30-architecture/software-architecture.md)",
      description: "Diagramas C4 Nível 3-4, decomposição modular interna, schemas de classes e contratos de API.",
      consumers: ["DataArchitect", "DevOps", "QA", "TechLead", "Security"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "archMode", type: "string", required: false, description: "Sempre 'software' para C4 3-4." },
      { name: "solutionArchSummary", type: "string", required: true, description: "Resumo da Solution Architecture (C4 L1-2)." },
      { name: "uxFlowsSummary", type: "string", required: false, description: "Resumo dos fluxos do UX." },
      { name: "uiSummary", type: "string", required: false, description: "Resumo das telas do UI." },
    ],
    presets: [
      {
        id: "fleetpulse_software",
        title: "FleetPulse — Componentes Internos e Pipeline",
        description: "Decomposição interna do Ingestion Worker (Go) e do Fastify Gateway (Node.js).",
        input: {
          specId: "F-FLEET-001",
          archMode: "software",
          specBody: "Ingestão e push em tempo real de telemetria veicular para 50k caminhões simultâneos.",
          solutionArchSummary: "Container Go para ingestão MQTT; Kafka para ordenação por vehicle_id; Fastify com WebSockets para operadores.",
          uxFlowsSummary: "Despachante recebe alerta em menos de 2s no navegador com confirmação de leitura.",
        },
      },
    ],
  },

  DataArchitect: {
    id: "DataArchitect",
    name: "Data Architect",
    phase: 4,
    phaseName: "Fase 4: Engenharia & Detalhamento",
    category: "Engenharia & Dados",
    description: "Modela o Diagrama Entidade-Relacionamento (DER), gera scripts DDL para PostgreSQL, estratégias de particionamento e políticas de retenção/expurgo (LGPD).",
    role: "Define a estrutura física e relacional dos dados, índices de alta performance, particionamento temporal e regras de privacidade de dados.",
    icon: "Database",
    badgeColor: "#0284c7",
    readsFrom: [
      {
        source: "solution_architecture",
        agent: "SolutionArchitect",
        description: "Bancos de dados escolhidos (TimescaleDB, Aurora Postgres).",
        required: true,
      },
      {
        source: "software_architecture",
        agent: "SoftwareArchitect",
        description: "Entidades e contratos de software.",
        required: true,
      },
      {
        source: "ux_design",
        agent: "UX",
        description: "Fluxos de dados requeridos pelas jornadas e telas do usuário.",
        required: false,
      },
    ],
    produces: {
      artifact: "data_model",
      title: "Data Model & DDL (30-architecture/data-model.md)",
      description: "Scripts DDL SQL, diagramas de entidade-relacionamento (DER), índices e políticas de retenção.",
      consumers: ["DevOps", "Security", "Compliance", "QA", "Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "solutionArchSummary", type: "string", required: true, description: "Resumo da Solution Architecture." },
      { name: "softwareArchSummary", type: "string", required: false, description: "Resumo da Software Architecture." },
      { name: "persistenceType", type: "string", required: false, description: "Tipo de banco: 'rdbms', 'timeseries', etc." },
    ],
    presets: [
      {
        id: "fleetpulse_data",
        title: "FleetPulse — DDL TimescaleDB e Aurora",
        description: "Modelagem de hypertables para telemetria temporal (GPS/velocidade) e tabelas relacionais de frotas e motoristas.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Armazenamento de 15.000 eventos/segundo por 1 ano com retenção de dados brutos por 30 dias e agregados por 12 meses.",
          solutionArchSummary: "TimescaleDB para dados temporais particionados por tempo e vehicle_id; PostgreSQL relacional para cadastros.",
          persistenceType: "rdbms",
        },
      },
    ],
  },

  DevOps: {
    id: "DevOps",
    name: "DevOps Engineer",
    phase: 4,
    phaseName: "Fase 4: Engenharia & Detalhamento",
    category: "Infraestrutura & Operações",
    description: "Projeta a topologia de deployment, Infraestrutura como Código (Terraform/Kubernetes), métricas de observabilidade, SLOs e SLIs.",
    role: "Garante dimensionamento de cluster, auto-scaling horizontal de workers e estratégias de deployment sem indisponibilidade.",
    icon: "Cloud",
    badgeColor: "#6366f1",
    readsFrom: [
      {
        source: "software_architecture",
        agent: "SoftwareArchitect",
        description: "Componentes, dependências e portas de comunicação.",
        required: true,
      },
      {
        source: "data_model",
        agent: "DataArchitect",
        description: "Requisitos de armazenamento, réplicas e IOPS.",
        required: true,
      },
    ],
    produces: {
      artifact: "devops_spec",
      title: "DevOps & Infrastructure Spec (40-infrastructure/devops-spec.md)",
      description: "Manifestos Kubernetes, definições de pipelines CI/CD, métricas de observabilidade e orçamentos de erro (SLOs).",
      consumers: ["Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "softwareArchSummary", type: "string", required: true, description: "Resumo da arquitetura de software." },
      { name: "dataModelSummary", type: "string", required: false, description: "Resumo do modelo de dados." },
      { name: "targetEnvs", type: "string[]", required: false, description: "Ambientes-alvo (default: ['prod'])." },
    ],
    presets: [
      {
        id: "fleetpulse_devops",
        title: "FleetPulse — Topologia Kubernetes e Observabilidade",
        description: "Cluster EKS com HPA orientado por lag do Kafka, Prometheus, Grafana e cluster TimescaleDB multi-AZ.",
        input: {
          specId: "F-FLEET-001",
          specBody: "SLA de 99.9% de disponibilidade global com suporte a 15.000 requisições por segundo em picos.",
          softwareArchSummary: "Workers Go sem estado consumindo MQTT; Fastify com WebSockets; broker EMQX clusterizado.",
          dataModelSummary: "Hypertables no TimescaleDB com política de compressão e Aurora PostgreSQL com réplica de leitura.",
          targetEnvs: ["prod", "staging"],
        },
      },
    ],
  },

  Security: {
    id: "Security",
    name: "Security Engineer",
    phase: 4,
    phaseName: "Fase 4: Engenharia & Detalhamento",
    category: "Segurança da Informação",
    description: "Executa a modelagem formal de ameaças baseada na metodologia STRIDE, análise de superfícies de ataque e segurança da cadeia de suprimentos.",
    role: "Identifica potenciais vetores de invasão, spoofing, tampering, DDoS e define controles criptográficos e mitigatórios.",
    icon: "Lock",
    badgeColor: "#dc2626",
    readsFrom: [
      {
        source: "software_architecture",
        agent: "SoftwareArchitect / SolutionArchitect",
        description: "Contrato C4 completo dos containers e componentes de software.",
        required: true,
      },
      {
        source: "data_model",
        agent: "DataArchitect",
        description: "Tabelas e sensibilidade dos dados persistidos.",
        required: true,
      },
    ],
    produces: {
      artifact: "threat_model",
      title: "Threat Model & STRIDE (50-security/threat-model.md)",
      description: "Matriz de riscos STRIDE, superfícies de ataque mitigadas e requisitos de segurança.",
      consumers: ["Compliance", "Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "architect", type: "object", required: true, description: "Objeto C4 de arquitetura completo." },
      { name: "dataModelSummary", type: "string", required: false, description: "Resumo dos dados armazenados." },
    ],
    presets: [
      {
        id: "fleetpulse_security",
        title: "FleetPulse — Modelagem STRIDE para Ingestão IoT",
        description: "Prevenção contra falsificação de pacotes GPS (Spoofing), injeção maliciosa no barramento CAN e DDoS no broker MQTT.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Comunicação entre 50.000 módulos IoT embarcados e o broker em nuvem via redes móveis celulares.",
          architect: {
            summary: "Gateway EMQX com TLS mútua (mTLS) terminando no Ingestion Engine Go e Kafka.",
            components: ["C-1: Broker MQTT", "C-2: Ingestion Engine", "C-3: Kafka Event Stream"],
          },
          dataModelSummary: "Coordenadas GPS de frotas, identificação de motoristas e status de ignição.",
        },
      },
    ],
  },

  Compliance: {
    id: "Compliance",
    name: "Compliance Officer",
    phase: 4,
    phaseName: "Fase 4: Engenharia & Detalhamento",
    category: "Governança & Conformidade",
    description: "Avalia a aderência do sistema à LGPD/GDPR, enquadramento de bases legais, direitos dos titulares e Relatório de Impacto à Privacidade (DPIA).",
    role: "Garante que o design tecnológico respeite leis de privacidade, termos de consentimento, anonimização e retenção legal.",
    icon: "Scale",
    badgeColor: "#a855f7",
    readsFrom: [
      {
        source: "data_model",
        agent: "DataArchitect",
        description: "Modelo de tabelas, campos pessoais e políticas de retenção.",
        required: true,
      },
      {
        source: "threat_model",
        agent: "Security",
        description: "Ameaças de vazamento e controles de criptografia em repouso e trânsito.",
        required: true,
      },
    ],
    produces: {
      artifact: "compliance_assessment",
      title: "Compliance & DPIA (60-compliance/compliance-report.md)",
      description: "Enquadramento de bases legais LGPD, matriz de direitos dos titulares (DSR) e relatório DPIA.",
      consumers: ["Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "dataModelSummary", type: "string", required: true, description: "Resumo do modelo de dados e tabelas." },
      { name: "threatModelSummary", type: "string", required: true, description: "Resumo do relatório de ameaças do Security." },
      { name: "applicableFrameworks", type: "string[]", required: false, description: "Leis aplicáveis (ex: ['LGPD', 'GDPR', 'EU_AI_ACT'])." },
    ],
    presets: [
      {
        id: "fleetpulse_compliance",
        title: "FleetPulse — Enquadramento LGPD e DPIA",
        description: "Avaliação do rastreamento geográfico contínuo sob a base legal de Execução de Contrato e Legítimo Interesse com relatório DPIA.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Monitoramento de jornada de trabalho e rastreamento de veículos de transporte rodoviário de cargas.",
          dataModelSummary: "Tabela de telemetria guarda latitude, longitude e motorista_id com retenção de 12 meses.",
          threatModelSummary: "Criptografia TLS 1.3 em trânsito e AES-256 no banco com controle de acesso RBAC.",
          applicableFrameworks: ["LGPD"],
        },
      },
    ],
  },

  QA: {
    id: "QA",
    name: "QA Engineer",
    phase: 5,
    phaseName: "Fase 5: Qualidade & Síntese",
    category: "Qualidade & Testes",
    description: "Estrutura a estratégia completa de testes pós-G5 com cenários BDD (Given/When/Then), garantindo 100% de cobertura dos critérios de aceitação.",
    role: "Define suítes de testes unitários, testes de integração de mensageria e testes de carga para validar as metas de SLA e performance.",
    icon: "CheckCheck",
    badgeColor: "#14b8a6",
    readsFrom: [
      {
        source: "spec",
        agent: "PM",
        description: "Critérios de aceitação com tags @test da PRD.",
        required: true,
      },
      {
        source: "software_architecture",
        agent: "SoftwareArchitect",
        description: "Contratos de componentes e interfaces de API.",
        required: true,
      },
      {
        source: "data_model",
        agent: "DataArchitect",
        description: "Estruturas de tabelas para fixtures e migrações.",
        required: true,
      },
    ],
    produces: {
      artifact: "test_strategy",
      title: "Test Strategy & BDD (70-qa/test-strategy.md)",
      description: "Cenários BDD Given/When/Then vinculados a cada Critério de Aceitação da PRD e testes de carga.",
      consumers: ["Auditor"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "acListFromSpec", type: "string[]", required: true, description: "Lista dos Critérios de Aceitação extraídos da PRD." },
      { name: "softwareArchSummary", type: "string", required: false, description: "Resumo da arquitetura de software." },
      { name: "dataModelSummary", type: "string", required: false, description: "Resumo do modelo de dados." },
    ],
    presets: [
      {
        id: "fleetpulse_qa",
        title: "FleetPulse — Suíte BDD e Testes de Carga",
        description: "Cenários BDD para validação de latência < 2s, tolerância a desconexão 4G e integridade de ordens SAP.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Plataforma de telemetria veicular para 50k caminhões simultâneos com push WebSockets instantâneo.",
          acListFromSpec: [
            "AC-1: Dispositivo OBD envia telemetria e mensagem chega ao despachante em < 2 segundos",
            "AC-2: Falha de conexão 4G retém dados no buffer local e faz replay em ordem cronológica",
            "AC-3: Evento de superaquecimento dispara alerta sonoro no dashboard",
          ],
          softwareArchSummary: "Workers Go decodificam OBD e gravam no Kafka particionado por vehicle_id.",
          dataModelSummary: "Hypertables no TimescaleDB com particionamento de 1 dia.",
        },
      },
    ],
  },

  TechLead: {
    id: "TechLead",
    name: "Tech Lead",
    phase: 5,
    phaseName: "Fase 5: Qualidade & Síntese",
    category: "Gestão & Planejamento",
    description: "Decompõe toda a especificação e arquitetura em um Grafo Acíclico Dirigido (DAG) de tarefas atômicas de implementação com estimativa e paralelismo.",
    role: "Organiza a entrega de engenharia em lotes paralelos executáveis pelo time ou por agentes de codificação externos (como Claude Code).",
    icon: "Kanban",
    badgeColor: "#eab308",
    readsFrom: [
      {
        source: "software_architecture",
        agent: "SoftwareArchitect / SolutionArchitect",
        description: "Componentes a serem implementados e suas dependências.",
        required: true,
      },
      {
        source: "spec",
        agent: "PM",
        description: "Critérios de aceitação que balizam o término de cada tarefa.",
        required: true,
      },
    ],
    produces: {
      artifact: "task_breakdown",
      title: "Task Breakdown DAG (80-tasks/task-breakdown.md)",
      description: "Lista de tarefas atômicas (TASK-1, TASK-2...) com dependências (deps), complexidade e lotes paralelos.",
      consumers: ["Auditor", "Handoff Externo (Claude Code / Devs)"],
    },
    inputSchemaFields: [
      { name: "specBody", type: "string", required: true, description: "Corpo da PRD." },
      { name: "specId", type: "string", required: false, description: "Identificador da feature." },
      { name: "architect", type: "object", required: true, description: "Objeto C4 de arquitetura de software/solução." },
      { name: "solutionArchSummary", type: "string", required: false, description: "Resumo da Solution Architecture." },
    ],
    presets: [
      {
        id: "fleetpulse_techlead",
        title: "FleetPulse — Decomposição em Tasks (DAG)",
        description: "Planejamento de tarefas de engenharia: Broker MQTT, Worker de Ingestão Go, Tópicos Kafka, API Fastify e Dashboard React.",
        input: {
          specId: "F-FLEET-001",
          specBody: "Implementação completa da plataforma de telemetria veicular FleetPulse.",
          architect: {
            summary: "Arquitetura distribuída com Ingestion Engine (Go), barramento Kafka e API Fastify.",
            components: [
              "C-1: IoTMessageGateway (Broker MQTT)",
              "C-2: IngestionEngine (Go Worker)",
              "C-3: EventStream (Kafka)",
              "C-4: RulesEngine (Stream Processor)",
              "C-5: CoreApi (Fastify + WebSockets)",
              "C-6: FrontendDashboard (React SPA)",
            ],
          },
          solutionArchSummary: "Decisões principais: EMQX, Apache Kafka, TimescaleDB, Fastify WebSockets.",
        },
      },
    ],
  },

  Auditor: {
    id: "Auditor",
    name: "Auditor",
    phase: 5,
    phaseName: "Todos os Gates HITL",
    category: "Qualidade com Dentes",
    description: "Revisor formal de qualidade que atua antes de cada Gate HITL, checando conformidade INTRA-artefato (qualidade interna) e INTER-artefatos (coerência cruzada).",
    role: "Barreira mandatória de aprovação que impede avanço no pipeline se houver inconsistências críticas ou requisitos sem cobertura.",
    icon: "ShieldCheck",
    badgeColor: "#e11d48",
    readsFrom: [
      {
        source: "collected_artifacts",
        agent: "Todos os produtores da fase corrente",
        description: "Dicionário completo de artefatos produzidos até o momento do gate.",
        required: true,
      },
    ],
    produces: {
      artifact: "audit_review",
      title: "Audit Review Report (90-audit/audit-report.md)",
      description: "Checklist de aprovação (readyForGate: true/false), achados bloqueantes e recomendações.",
      consumers: ["Aprovadores HITL no Gate"],
    },
    inputSchemaFields: [
      { name: "specId", type: "string", required: true, description: "Identificador da feature auditada." },
      { name: "gateTarget", type: "string", required: true, description: "Gate alvo (ex: 'g1_problem_confirmed', 'g2_prd_approved', 'g3_macro_shape_approved', 'g5_ready_to_build')." },
      { name: "tier", type: "string", required: false, description: "Nível de risco da feature." },
      { name: "artifactPaths", type: "string[]", required: false, description: "Lista de caminhos de arquivos coletados." },
      { name: "artifactBodies", type: "object", required: false, description: "Conteúdo dos artefatos em texto/JSON." },
    ],
    presets: [
      {
        id: "fleetpulse_g3_audit",
        title: "FleetPulse — Auditoria do Gate G3 (Macro Design)",
        description: "Revisão cruzada entre a PRD do PM, a Arquitetura da Solution, os fluxos do UX e as telas do UI.",
        input: {
          specId: "F-FLEET-001",
          gateTarget: "g3_macro_shape_approved",
          tier: "high",
          artifactPaths: [
            ".specs/features/F-FLEET-001/spec.md",
            ".artifacts/features/F-FLEET-001/30-architecture/solution-architecture.md",
            ".artifacts/features/F-FLEET-001/20-design/ux-flows.md",
          ],
          artifactBodies: {
            "spec.md": "# PRD FleetPulse\nRF-01: Ingestão de telemetria\nRF-02: Latência < 2s\nRNF-01: 15.000 eps",
            "solution-architecture.md": "# Solution Architecture\nEMQX Broker + Kafka + TimescaleDB + WebSockets Fastify",
            "ux-flows.md": "# UX Flows\nJornada do despachante com alertas em tempo real",
          },
        },
      },
    ],
  },
};
