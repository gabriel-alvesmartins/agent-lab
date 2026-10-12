/**
 * server/agentEnricher.ts
 *
 * Provê enriquecimento determinístico de alta fidelidade para todos os 15 agentes
 * canônicos do SDLC durante execuções no Agent Lab (modo offline/fallback e smoke).
 * Garante que cada agente produza artefatos completos, diagramas Mermaid, ADRs,
 * contratos e tabelas representativas para o cenário canônico FleetPulse.
 */

export function enrichFallbackOutput(
  agentName: string,
  output: any,
  input: any,
  isCustomV2: boolean = false
): any {
  switch (agentName) {
    case "Discovery": {
      return {
        summary: isCustomV2
          ? "Discovery aprofundado (v2 Customizado) para FleetPulse: Plataforma de Telemetria e Monitoramento de Frotas IoT em Tempo Real com IA de Rota Preditiva."
          : "Discovery canônico para FleetPulse: Plataforma de Telemetria e Monitoramento de Frotas IoT em Tempo Real. Identificadas dores de até 18% em perda de combustível, falta de visibilidade e paradas não planejadas.",
        problemStatement:
          "Transportadoras de cargas pesadas sofrem com perda de até 18% em custos de combustível e quebras mecânicas catastróficas devido à ausência de monitoramento contínuo em tempo real de telemetria veicular (temperatura, RPM, frenagens e dados do barramento CAN).",
        personas: [
          "PER-1: Despachante Operacional | Supervisão de 50.000 veículos em tempo real | pains: Sobrecarga cognitiva, alertas falsos, lentidão de atualização | context: Dashboard web desktop em turno 24/7",
          "PER-2: Motorista Rodoviário | Condução segura e cumprimento de jornada | pains: Falta de aviso prévio de falhas mecânicas, sinal celular intermitente em estradas | context: Cabine de caminhão pesado com módulo embarcado OBD-II",
          ...(isCustomV2
            ? ["PER-3: Gerente de Frotas Corporativo | Otimização de custo operacional (TCO) | pains: Falta de relatórios agregados de consumo | context: Dashboard analítico executivo"]
            : []),
        ],
        jobsToBeDone: [
          "JTBD-1: Monitorar status e anomalias de condução em tempo real | trigger: Ignição ligada ou violação de parâmetros de telemetria | outcome: Notificação no dashboard em menos de 2 segundos | alts: Rastreamento manual via rádio/telefone",
          "JTBD-2: Prevenir falhas mecânicas graves através de telemetria preventiva do barramento CAN | trigger: Superaquecimento do motor ou anomalia no freio | outcome: Interrupção planejada de rota antes do travamento do motor",
          "JTBD-3: Sincronizar dados de odômetro e consumo com ERP corporativo (SAP/TOTVS) | trigger: Fechamento de rota ou fim do expediente | outcome: Ordens de manutenção e conciliação de custos atualizadas automaticamente",
        ],
        assumptions: [
          "Veículos possuem módulos IoT homologados Anatel com conectividade multi-operadora (2G/3G/4G)",
          "Broker MQTT na nuvem absorve até 15.000 eventos/s com latência de rede média de 350ms em estradas federais",
        ],
        openQuestions: [
          "Qual o SLA de retenção em tier quente vs frio para os dados brutos de CAN?",
          "Será necessário suporte a fallback por satélite para frotas que transitam em regiões remotas?",
        ],
        successSignals: [
          "Redução comprovada de pelo menos 12% em paradas não programadas em 90 dias de piloto",
          "Latência de ponta a ponta inferior a 2 segundos mantida em 99,5% dos eventos",
        ],
        clarificationsNeeded: [],
      };
    }

    case "RiskElicitor": {
      return {
        inventory_version: "0.1.0",
        data: ["pii_basic", "pii_address"],
        users: [
          {
            profile: "b2b",
            vulnerable: ["none"],
          },
        ],
        integrations: ["regulated_fiscal_api"],
        effects: ["regulated_output_fiscal"],
        jurisdiction: {
          data_residency: "brasil_obrigatorio",
          countries_served: ["BR"],
          regulators_applicable: ["ANPD", "ANATEL"],
        },
        failure_costs: ["fine_lgpd_anpd"],
        scoring: {
          likelihood_max: 4,
          impact_max: 4,
          score_max: 16,
        },
        notes: isCustomV2
          ? "Inventário de riscos v2: Cobertura estendida de monitoramento contínuo com geolocalização pessoal sob a LGPD (Art. 7º) e conformidade telemática ANATEL/CONTRAN."
          : "Rastreamento geográfico contínuo constitui dado pessoal e dado de comportamento do trabalhador sob a LGPD (Art. 7º, V e IX).",
      };
    }

    case "TierClassifier": {
      return {
        assessment_version: "2.1.0",
        tier: "high",
        method: "risk_matrix_iso27005",
        score_max_li: 16,
        tier_from_score: "high",
        tier_from_frameworks: "high",
        frameworks: [
          {
            id: "LGPD",
            applicable: true,
            articles: ["Art. 7º, V", "Art. 7º, IX", "Art. 46"],
            notes: "Rastreamento contínuo de condutores de frotas exige enquadramento legal e DPIA.",
          },
          {
            id: "ISO_27001",
            applicable: true,
            articles: ["A.8.24", "A.8.28"],
            notes: "Criptografia de ponta a ponta e gestão de chaves em trânsito e repouso.",
          },
          {
            id: "ISO_25010",
            applicable: true,
            articles: ["Performance Efficiency", "Reliability"],
            notes: "SLA de 99.9% de disponibilidade com latência < 2s.",
          },
        ],
        risks: [
          "Monitoramento de geolocalização em tempo real de motoristas de carga",
          "Alta volumetria de ingestão IoT (15.000 eps) com superfície de ataque em conexões de borda",
          "Integração bidirecional com sistemas contábeis ERP críticos (SAP/TOTVS)",
        ],
        controls_required: [
          "C-01: Criptografia TLS 1.3 obrigatória em todos os canais MQTT e WebSockets",
          "C-02: Mascaramento e anonimização de dados de geolocalização histórica após 30 dias",
          "C-03: Relatório de Impacto à Proteção de Dados Pessoais (DPIA) formalizado",
          "C-04: Gate G3 e Gate G5 com aprovação HITL obrigatória de Segurança e Compliance",
        ],
        justification: isCustomV2
          ? "Tier HIGH (v2 Calibrado): Classificação mandatória devido ao monitoramento ininterrupto de pessoas físicas, tráfego telemático de alta criticidade e integração com ERP corporativo."
          : "Tier classificado como HIGH devido ao monitoramento contínuo de geolocalização pessoal (LGPD), impacto em infraestrutura de transporte e criticidade de disponibilidade com 15k eps.",
        classifier_version: "2.1.0",
        kb_versions: { "regulatory-kb": "2026.10", "iso-27005": "2022" },
        input_hash: "hash-fleetpulse-tier-001",
        assessed_at: new Date().toISOString(),
        compliance_officer: "@compliance.officer",
      };
    }

    case "PM": {
      const body = `# Especificação Canônica (PRD): FleetPulse — Telemetria Veicular em Tempo Real

## 1. Visão Geral e Problema
A FleetPulse monitora continuamente veículos de transporte rodoviário pesado via módulos embarcados OBD-II/GPS, processando até 15.000 eventos/s para prevenir falhas mecânicas e reduzir em até 18% o consumo de combustível.

## 2. Personas & User Stories
- **US-01 (Despachante Operacional)**: Como despachante de frota, quero visualizar todos os caminhões em mapa ao vivo para ser alertado em menos de 2s quando houver anomalia mecânica ou desvio de rota.
- **US-02 (Motorista de Carga)**: Como motorista rodoviário, quero receber alertas preventivos na cabine antes que ocorra um superaquecimento do motor.

## 3. Requisitos Funcionais (RF)
- **RF-01**: Ingestão de pacotes de telemetria telemática (coordenadas GPS, RPM, temperatura, pressão de freios) a cada 5 segundos por veículo ativo.
- **RF-02**: Transmissão em tempo real (< 2s) de notificações de emergência para a interface web do despachante via WebSockets.
- **RF-03**: Sincronização automatizada de odômetro e custos de manutenção com ERPs corporativos (SAP S/4HANA e TOTVS).

## 4. Requisitos Não-Funcionais (RNF — ISO 25010)
- **RNF-01 (Performance Efficiency)**: Suportar pico de 15.000 eventos/segundo na ingestão com latência P99 ponta-a-ponta inferior a 2.000ms.
- **RNF-02 (Reliability)**: SLA de disponibilidade global de 99.9% com tolerância a quedas temporárias de rede celular via buffer local.
- **RNF-03 (Security & Privacy)**: Criptografia TLS 1.3 compulsória em trânsito e conformidade estrita com a LGPD para localização contínua de condutores.

## 5. Critérios de Aceitação com Validação (@test)
- **AC-1**: Dispositivo OBD envia telemetria e mensagem chega ao despachante em < 2 segundos @test
- **AC-2**: Falha de conexão 4G retém dados no buffer local e faz replay em ordem cronológica sem duplicatas @test
- **AC-3**: Evento de superaquecimento dispara alerta sonoro no dashboard e modal de intervenção emergencial @test
`;
      return {
        frontmatter: {
          id: "F-FLEET-001",
          title: "FleetPulse — Telemetria de Frotas IoT",
          risk_tier: "high",
          parent: "PROD-LOGISTICS",
          owners: ["@joao.campista", "@ceia.ufg"],
          version: "1.1.0",
        },
        body,
        modelVersion: "claude-sonnet-5-5",
        source: "canonical_sdlc",
        input_hash: "hash-fleetpulse-pm-prd-001",
        specObject: {
          title: "FleetPulse — Telemetria de Frotas IoT",
          userStories: [
            { id: "US-01", asA: "Despachante", iWant: "Mapa ao vivo com alertas < 2s", soThat: "Prevenir quebras" },
            { id: "US-02", asA: "Motorista", iWant: "Alertas preventivos na cabine", soThat: "Evitar acidentes" },
          ],
          functionalRequirements: [
            { id: "RF-01", description: "Ingestão de telemetria a cada 5 segundos por veículo ativo" },
            { id: "RF-02", description: "Emissão de alertas no navegador do despachante via WebSockets < 2s" },
            { id: "RF-03", description: "Sincronização de custos e odômetro com ERPs (SAP e TOTVS)" },
          ],
          nonFunctionalRequirements: [
            { id: "RNF-01", description: "Pico de 15.000 eventos/s com latência P99 < 2s (ISO 25010)" },
            { id: "RNF-02", description: "Disponibilidade de 99.9% com buffer offline local" },
            { id: "RNF-03", description: "Criptografia TLS 1.3 e conformidade LGPD para geolocalização" },
          ],
          acceptanceCriteria: [
            "AC-1: Dispositivo OBD envia telemetria e mensagem chega ao despachante em < 2 segundos @test",
            "AC-2: Falha de conexão 4G retém dados no buffer local e faz replay em ordem cronológica @test",
            "AC-3: Evento de superaquecimento dispara alerta sonoro no dashboard @test",
          ],
        },
      };
    }

    case "SolutionArchitect": {
      const baseDecisions = [
        "AD-1: Adoção do protocolo MQTT via EMQX para conexão de dispositivos embarcados | rationale: Redução drástica de overhead de rede em conexões móveis 2G/3G/4G instáveis em comparação ao HTTPS | quality_driver: reliability | build_vs_buy: buy | alternatives: HTTPS REST Gateway (rejeitada: overhead de handshake TLS); CoAP (rejeitada: ecossistema limitado) | reversible: true",
        "AD-2: Uso de Apache Kafka como backbone assíncrono particionado por vehicle_id | rationale: Garante ordenação estrita de eventos temporais por veículo e absorção de picos de até 15.000 eps sem backpressure | quality_driver: scalability | build_vs_buy: buy | alternatives: RabbitMQ (rejeitada: menor throughput de streaming); AWS SQS (rejeitada: falta de garantia de ordem) | reversible: false",
        "AD-3: TimescaleDB para armazenamento de telemetria histórica | rationale: Permite consultas analíticas de séries temporais com compressão nativa de 90% mantendo ecossistema SQL | quality_driver: performance | build_vs_buy: reuse | alternatives: InfluxDB (rejeitada: menor interoperabilidade SQL); MongoDB (rejeitada: CPU excessiva) | reversible: true",
        "AD-4: WebSocket dedicado com Push Gateway no Fastify para atualização da tela | rationale: Atende à latência ponta-a-ponta < 2s sem polling | quality_driver: performance | build_vs_buy: make | alternatives: SSE (rejeitada: comunicação estritamente unidirecional); Long Polling (rejeitada: latência imprevisível) | reversible: true",
      ];
      if (isCustomV2) {
        baseDecisions.push(
          "AD-5 (v2 Custom): Buffer em memória Redis Cluster para sessões ativas | rationale: Redução de 40% na carga de consulta instantânea aos despachantes | quality_driver: performance | build_vs_buy: buy | reversible: true"
        );
      }
      return {
        summary: isCustomV2
          ? "Arquitetura orientada a eventos otimizada (v2 Customizada) para ingestão massiva de telemetria (15k eps), integrando MQTT/EMQX, Apache Kafka, TimescaleDB e caching em memória com WebSockets."
          : "Arquitetura orientada a eventos para ingestão massiva de telemetria veicular em alta escala (15k eps), combinando protocolo MQTT para borda, Apache Kafka para desacoplamento de fluxo, TimescaleDB para séries temporais e API Fastify/WebSockets para push em tempo real aos despachantes.",
        decisions: baseDecisions,
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
          "Qual a janela máxima de tolerância para sincronização assíncrona com os ERPs SAP e TOTVS?",
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
  Rel(api, postgres, "Consulta metadados de veículos", "SQL")`,
      };
    }

    case "UX": {
      return {
        summary: isCustomV2
          ? "Jornadas operacionais refinadas (v2 Custom) com minimização de cliques e suporte a atalhos de teclado para centros de controle logísticos 24/7."
          : "Jornadas de interação ergonômicas e fluxos operacionais para monitoramento de 50.000 veículos pelo despachante em sala de controle 24/7.",
        userFlows: [
          "FLOW-1: Monitoramento Contínuo → Despachante abre mapa global com agregação em clusters (50k veículos) → Clica em cluster para desagregar → Seleciona veículo para inspecionar telemetria ao vivo (< 2s atualização).",
          "FLOW-2: Recepção de Alerta Crítico → Evento de superaquecimento ou freio violado recebido via WebSocket → Notificação sonora de 80dB + Modal de intervenção na tela → Operador autoriza 'Ordem de Parada' ou 'Despachar Socorro'.",
          "FLOW-3: Telemetria Forense e Replay → Filtro por placa e período de data → Gráficos de dispersão de velocidade, RPM e temperatura com replay de trajeto no mapa.",
        ],
        wireframes: [
          "SCREEN-1: Dashboard Principal (Desktop 1920x1080)\n+-------------------------------------------------------------+\n| FleetPulse | [Busca Placa/ID]   [Filtro: Alertas Ativos]   👤 Despachante |\n+-----------------------------+-------------------------------+\n| VEÍCULOS EM ALERTA (14)     | MAPA VETORIAL AO VIVO         |\n| [!] CAM-0491 | Superaquec.  |  ( ) [Pin: CAM-0491 ALERTA]    |\n| [!] CAM-1288 | Freio Press. |  ( ) [Pin: CAM-2201 OK]        |\n| [*] CAM-7712 | Rota Desvio  |                               |\n+-----------------------------+-------------------------------+\n| TELEMETRIA VEÍCULO SELECIONADO: CAM-0491                     |\n| RPM: 3.400 [Alto] | Temp: 104°C [CRÍTICO] | Velocidade: 92km/h|\n| [ Botão: Ordenar Parada Imediata ] [ Botão: Contatar Rádio ] |\n+-------------------------------------------------------------+",
          "SCREEN-2: Modal de Alerta de Emergência\n+-------------------------------------------------------------+\n| ⚠️ ALERTA DE SEGURANÇA CRÍTICA — VEÍCULO CAM-0491             |\n| Motorista: Roberto Silveira | Km: 142.300 | Rodovia: BR-153  |\n| Temperatura do Motor: 108°C (Limite de Tolerância: 95°C)    |\n| Posição: Lat -16.6869, Lon -49.2648                         |\n|-------------------------------------------------------------|\n| Ações Imediatas:                                            |\n| [X] Disparar Notificação na Cabine (Display OBD)            |\n| [X] Acionar Ponto de Apoio Mecânico Próximo                 |\n| [ Confirmar Intervenção (Enter) ]  [ Descartar Alarme ]     |\n+-------------------------------------------------------------+",
        ],
        designSystemNotes:
          "Tokens de alto contraste para sala de operações: Dark mode padrão (#09090b); Cores semânticas rígidas: Vermelho (#ef4444) para falha mecânica/vida; Âmbar (#f59e0b) para atenção preventiva; Esmeralda (#10b981) para operação nominal.",
        accessibilityConsiderations: [
          "WCAG 2.2 AA: Contraste de cor mínimo de 4.5:1 para marcadores e valores de telemetria.",
          "Alertas sonoros acompanhados invariavelmente de pistas visuais pulsantes e banner fixo na tela para operadores com deficiência auditiva.",
          "Atalhos de teclado (Alt+A para atender alerta, Alt+P para ordenar parada) operáveis sem necessidade de mouse.",
        ],
        clarifications: [],
      };
    }

    case "UI": {
      return {
        summary: isCustomV2
          ? "Design de interface polido (v2 Custom) com mapa vetorial, drawer de telemetria expansível e design tokens completos em Tailwind CSS."
          : "Protótipos de tela em alta fidelidade e design tokens para o FleetPulse Dashboard com mapa ao vivo e drawer de telemetria.",
        mode: "html_fallback",
        frames: [
          "FRAME-1: Live Dashboard — Tela principal de monitoramento com mapa vetorial e feed de eventos em tempo real.",
          "FRAME-2: Telemetry Inspector — Drawer lateral com gauges de telemetria (RPM, temperatura, freios) e log de pacotes CAN.",
          "FRAME-3: Incident Action Modal — Diálogo de intervenção rápida para despacho de ordem de parada e contato com motorista.",
        ],
        designTokens: [
          "color:background=#09090b",
          "color:surface=#18181b",
          "color:border=#27272a",
          "color:primary=#3b82f6",
          "color:danger=#ef4444",
          "color:warning=#f59e0b",
          "color:success=#10b981",
          "color:text-main=#fafafa",
          "color:text-muted=#a1a1aa",
          "typography:font-sans=Inter, sans-serif",
          "typography:font-mono=JetBrains Mono, monospace",
          "radii:card=8px",
          "radii:badge=9999px",
        ],
        fallbackHtml: `<div class="bg-zinc-950 text-zinc-100 min-h-[420px] rounded-lg border border-zinc-800 p-4 font-sans flex flex-col gap-4">
  <header class="flex items-center justify-between border-b border-zinc-800 pb-3">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">FP</div>
      <div>
        <h2 class="text-sm font-semibold tracking-tight text-white">FleetPulse — Centro de Despacho</h2>
        <p class="text-xs text-zinc-400">50.000 veículos monitorados • Ingestão: 14.820 eps</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        WebSocket Online (&lt; 2s)
      </span>
      <button class="px-3 py-1 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors shadow-sm">
        14 Alertas Ativos
      </button>
    </div>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
    <div class="bg-zinc-900/60 rounded-md border border-zinc-800/80 p-3 flex flex-col gap-2">
      <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Veículos Críticos</span>
      <div class="space-y-2 overflow-y-auto max-h-56">
        <div class="p-2.5 rounded bg-red-950/40 border border-red-800/50 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-red-200">CAM-0491 • Scania R450</div>
            <div class="text-[11px] text-red-400">Motor: 108°C • RPM: 3.400</div>
          </div>
          <span class="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded font-mono">PARADA</span>
        </div>
        <div class="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-amber-200">CAM-1288 • Volvo FH540</div>
            <div class="text-[11px] text-amber-400">Pressão Freio: 62 PSI</div>
          </div>
          <span class="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono">ATENÇÃO</span>
        </div>
      </div>
    </div>

    <div class="md:col-span-2 bg-zinc-900/40 rounded-md border border-zinc-800/80 p-4 flex flex-col justify-between relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div class="relative z-10 flex items-center justify-between">
        <span class="text-xs font-semibold text-zinc-300">Mapa Operacional Rodoviário (BR-153 / BR-060)</span>
        <span class="text-[11px] text-zinc-500 font-mono">Lat: -16.6869, Lon: -49.2648</span>
      </div>
      <div class="relative z-10 my-8 flex items-center justify-center">
        <div class="p-3 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
          <div>
            <div class="text-xs font-bold text-white">Veículo CAM-0491 Detectado em Superaquecimento</div>
            <div class="text-[11px] text-zinc-400">Km 142 • Motorista: Roberto Silveira • Velocidade: 92 km/h</div>
          </div>
          <button class="ml-2 px-2.5 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-500 transition-colors">
            Intervir
          </button>
        </div>
      </div>
      <div class="relative z-10 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800 pt-2">
        <span>Clusters: 18.420 Nordeste • 22.100 Centro-Sul • 9.480 Sudeste</span>
        <span class="text-zinc-400 font-medium">Sincronização SAP: OK</span>
      </div>
    </div>
  </div>
</div>`,
        clarifications: [],
      };
    }

    case "SoftwareArchitect": {
      return {
        summary: isCustomV2
          ? "Arquitetura de software detalhada (C4 Níveis 3 e 4 v2 Custom) com workers assíncronos Go de alta performance e pipeline desacoplado no Kafka."
          : "Arquitetura de software detalhada (C4 Nível 3 - Componentes e Nível 4 - Código) para os containers de Ingestão Go e API Fastify.",
        decisions: [
          "AD-1: Ingestion Worker em Go com goroutines e pool de buffers estáticos | rationale: Eliminação de pausas de Garbage Collection sob taxa de 15.000 eps | quality_driver: performance | build_vs_buy: make | reversible: false",
          "AD-2: Serialização compacta Protocol Buffers (Protobuf) v3 no Kafka | rationale: Redução de 65% no overhead de rede em relação a JSON nos tópicos 'telemetry.raw' | quality_driver: efficiency | build_vs_buy: buy | reversible: true",
          "AD-3: WebSocket Gateway com Fastify + uWebSockets.js | rationale: Suporta 10.000 conexões de despachantes simultâneas com menos de 200MB de RAM | quality_driver: scalability | build_vs_buy: make | reversible: true",
          "AD-4: Circuit Breaker nos conectores de saída ERP (SAP/TOTVS) via Resilience4j pattern | rationale: Isolamento contra indisponibilidades do ERP impedindo retenção de buffer no worker | quality_driver: reliability | build_vs_buy: make | reversible: true",
        ],
        components: [
          "C-301: MqttPacketConsumer | Goroutine pool que lê do EMQX e executa deserialização Protobuf | deps: EMQX Broker",
          "C-302: ChecksumAndValidationFilter | Valida assinatura digital de integridade e descarta pacotes fora do range físico | deps: MqttPacketConsumer",
          "C-303: KafkaPartitionProducer | Publica em tópicos 'telemetry.raw.v1' com chave de partição vehicle_id | deps: Kafka Cluster",
          "C-304: CEPAnomaliesEngine | Worker que analisa janelas deslizantes de 15s para detectar picos térmicos e frenagens | deps: Kafka Event Stream",
          "C-305: RealtimeDispatcherHub | Hub de broadcast WebSocket filtrado por empresa/frota do despachante autenticado | deps: Redis PubSub; CoreApi",
          "C-306: TimescaleBatchWriter | Worker em lote que faz COPY em chunks de 5.000 linhas na hypertable de telemetria | deps: TimescaleDB",
        ],
        risks: [
          "Gargalo de I/O em disco no cluster Kafka sob backpressure prolongado do TimescaleDB | mitigation: Buffer temporário NVMe no nó worker com compressão zstd.",
        ],
        open_questions: [
          "Qual versão de Protocol Buffers (v2 ou v3) será adotada nos dispositivos embarcados legados?",
        ],
        c4Context: `C4Component
  title FleetPulse - Ingestion Engine (Nível 3: Componentes Internos)
  Container(emqx, "Broker EMQX", "MQTT", "Recebe pacotes dos caminhões")
  Component(consumer, "MqttPacketConsumer", "Go Goroutine Pool", "Lê e descompacta pacotes Protobuf")
  Component(validator, "ChecksumAndValidationFilter", "Go Filter", "Verifica HMAC e limites de telemetria")
  Component(producer, "KafkaPartitionProducer", "Go Kafka Client", "Grava com partition key = vehicle_id")
  ContainerDb(kafka, "Apache Kafka", "Kafka Wire", "Tópico telemetry.raw particionado")
  Rel(emqx, consumer, "Entrega mensagens MQTT", "TCP/TLS")
  Rel(consumer, validator, "Repassa bytes brutos", "In-Memory Channel")
  Rel(validator, producer, "Entrega evento validado", "In-Memory Channel")
  Rel(producer, kafka, "Publica eventos em batch", "Kafka Wire")`,
        c4Container: `C4Component
  title FleetPulse - Realtime Dispatcher Hub (Nível 4: Fluxo de Push)
  Container(kafka, "Kafka telemetry.alerts", "Kafka Wire", "Eventos de anomalia")
  Component(cep, "CEPAnomaliesEngine", "Flink / Go", "Calcula janelas de 15s")
  Component(hub, "RealtimeDispatcherHub", "Fastify + WebSockets", "Filtra por frota do operador")
  Person(despachante, "Despachante Operacional", "Visualiza alerta no navegador")
  Rel(kafka, cep, "Consome stream", "Kafka Wire")
  Rel(cep, hub, "Notifica evento crítico", "gRPC / WSS")
  Rel(hub, despachante, "Envia modal e som < 2s", "WebSocket TLS")`,
        clarifications: [],
      };
    }

    case "DataArchitect": {
      return {
        summary: isCustomV2
          ? "Modelo relacional e de séries temporais otimizado (v2 Custom) em PostgreSQL 16 + TimescaleDB 2.14 com particionamento temporal diário e políticas de retenção estritas."
          : "Modelo relacional e de séries temporais em PostgreSQL 16 + TimescaleDB 2.14 com particionamento temporal, hypertables e DDL completo.",
        entities: [
          "E-1: fleets (UUID-PK): id:uuid:!:idx, company_name:varchar(120):!, cnpj:varchar(14):!:idx, created_at:timestamp:!",
          "E-2: drivers (UUID-PK): id:uuid:!:idx, fleet_id:uuid:->fleets.id, name:varchar(120):!, cnh:varchar(11):!:pii, cpf:varchar(11):!:pii, is_active:boolean:!",
          "E-3: vehicles (UUID-PK): id:uuid:!:idx, fleet_id:uuid:->fleets.id, plate:varchar(7):!:idx, model:varchar(60):!, obd_device_id:varchar(32):!:idx",
          "E-4: telemetry_events (Hypertable): recorded_at:timestamptz:!:idx, vehicle_id:uuid:->vehicles.id:!:idx, driver_id:uuid:->drivers.id, lat:numeric(9,6):!, lon:numeric(9,6):!, speed_kmh:smallint:!, rpm:smallint:!, engine_temp_c:smallint:!, brake_pressure_psi:smallint, alerts_triggered:text[]",
          "E-5: maintenance_orders (UUID-PK): id:uuid:!:idx, vehicle_id:uuid:!, erp_sync_status:varchar(20):!, erp_reference_id:varchar(40), cost_cents:bigint",
        ],
        relationships: [
          "fleets ||--o{ drivers : 'emprega'",
          "fleets ||--o{ vehicles : 'possui'",
          "vehicles ||--o{ telemetry_events : 'emite'",
          "vehicles ||--o{ maintenance_orders : 'gera'",
        ],
        ddl: `-- 1. Habilita TimescaleDB e Extensões UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- 2. Tabela de Frotas e Empresas Clientes
CREATE TABLE fleets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(120) NOT NULL,
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Motoristas (com campos PII auditados)
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  cnh VARCHAR(11) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Veículos e Dispositivos OBD
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  plate VARCHAR(7) NOT NULL UNIQUE,
  model VARCHAR(60) NOT NULL,
  obd_device_id VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Séries Temporais de Telemetria (Hypertable TimescaleDB)
CREATE TABLE telemetry_events (
  recorded_at TIMESTAMPTZ NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  lat NUMERIC(9,6) NOT NULL,
  lon NUMERIC(9,6) NOT NULL,
  speed_kmh SMALLINT NOT NULL,
  rpm SMALLINT NOT NULL,
  engine_temp_c SMALLINT NOT NULL,
  brake_pressure_psi SMALLINT,
  alerts_triggered TEXT[] DEFAULT '{}'
);

-- Converte para Hypertable particionada por recorded_at em chunks de 1 dia
SELECT create_hypertable('telemetry_events', 'recorded_at', chunk_time_interval => INTERVAL '1 day');

-- Criação de Índices de Alta Performance
CREATE INDEX idx_telemetry_vehicle_time ON telemetry_events (vehicle_id, recorded_at DESC);
CREATE INDEX idx_telemetry_brin_time ON telemetry_events USING BRIN (recorded_at);

-- Política de Compressão Nativa após 7 dias
ALTER TABLE telemetry_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'vehicle_id',
  timescaledb.compress_orderby = 'recorded_at DESC'
);
SELECT add_compression_policy('telemetry_events', INTERVAL '7 days');

-- Política de Retenção de Dados Brutos (Expurgo após 90 dias)
SELECT add_retention_policy('telemetry_events', INTERVAL '90 days');`,
        retentionPolicy: [
          "RP-1: Dados brutos de telemetry_events comprimidos com zstd após 7 dias (compress_chunk_interval = '7 days')",
          "RP-2: Expurgo automático de telemetry_events brutos após 90 dias (drop_chunks older_than = '90 days')",
          "RP-3: Manutenção de agregados horários (telemetry_hourly_rollup) por 365 dias para auditoria e histórico de consumo",
        ],
        indexes: [
          { entity: "telemetry_events", fields: ["vehicle_id", "recorded_at DESC"], kind: "btree", unique: false },
          { entity: "telemetry_events", fields: ["recorded_at"], kind: "brin", unique: false },
          { entity: "vehicles", fields: ["plate"], kind: "btree", unique: true },
          { entity: "vehicles", fields: ["obd_device_id"], kind: "btree", unique: true },
        ],
        clarifications: [],
      };
    }

    case "DevOps": {
      return {
        summary: isCustomV2
          ? "Especificação DevOps & Infraestrutura v2 Custom com autoscaling baseado em KEDA orientado por lag do Kafka e observabilidade OTel completa."
          : "Topologia de deployment Kubernetes (EKS), pipeline CI/CD GitOps com ArgoCD, especificações de observabilidade OpenTelemetry e SLOs.",
        deploymentTopology:
          "Topologia de produção em cluster AWS EKS 1.30 multi-AZ:\n- Ingress: AWS Network Load Balancer (NLB) terminando TLS 1.3 nos brokers EMQX clusterizados (3 réplicas).\n- Ingestion Workers: Deployment Go stateless com HPA baseado em métrica customizada de lag do tópico Kafka 'telemetry.raw'.\n- Event Stream: Strimzi Apache Kafka Operator em nós dedicados com storage EBS io2 (15.000 eps distribuídos em 32 partições).\n- API & WebSockets: Deployment Fastify com réplicas auto-escaláveis (3 a 12 pods) sob ALB com HTTP/2 e WebSocket enabled.\n- Storage: Cluster TimescaleDB gerenciado com réplica de leitura em AZ secundária e backups automatizados via pgBackRest para S3.",
        slos: [
          "SLO-1: Disponibilidade global da API e gateway de ingestão >= 99.9% calculada mensalmente",
          "SLO-2: Latência de entrega ponta-a-ponta (do broker MQTT ao navegador do despachante) <= 2.000ms no percentil P99",
          "SLO-3: Taxa de erro de escrita no Kafka < 0.001% (menos de 1 evento perdido a cada 100.000 pacotes recebidos)",
        ],
        slis: [
          "SLI-1: sum(rate(http_requests_total{status=~'2..|3..'}[5m])) / sum(rate(http_requests_total[5m]))",
          "SLI-2: histogram_quantile(0.99, sum(rate(telemetry_e2e_latency_seconds_bucket[5m])) by (le))",
          "SLI-3: rate(kafka_producer_failed_records_total[5m]) / rate(kafka_producer_sent_records_total[5m])",
        ],
        observabilitySpec:
          "Observabilidade total com OpenTelemetry (OTel):\n- Tracing distribuído injetado no header do pacote MQTT propagado até o Fastify e banco.\n- Prometheus metrics: métricas RED para serviços HTTP e métricas USE para os nós de streaming.\n- Grafana Dashboards operacionais: 'FleetPulse - Realtime Ingestion Throughput' e 'Kafka Consumer Lag by Partition'.\n- Centralização de logs estruturados (JSON) no Loki com correlação automática por trace_id e vehicle_id.",
        runbookHints: [
          "RB-1 (Kafka Lag Alto): Escalar réplicas do Deployment ingestion-worker e verificar IOPS do EBS no nó broker.",
          "RB-2 (Queda de Conexões MQTT): Checar logs do EMQX para identificar thundering herd e verificar certificado mTLS.",
          "RB-3 (Falha no Sync SAP): Isolar fila dead-letter 'erp.sap.deadletter' e disparar reprocessamento via script 'scripts/replay-sap-orders.sh'.",
        ],
        clarifications: [],
      };
    }

    case "Security": {
      return {
        summary: isCustomV2
          ? "Modelagem de ameaças formal STRIDE v2 Custom com matriz de mitigação em IoT e conformidade de cadeia de suprimentos SBOM verificada."
          : "Modelagem de ameaças formal baseada na metodologia STRIDE, análise de superfícies de ataque em IoT e cadeia de suprimentos.",
        threats: [
          {
            id: "T-01",
            strideCategory: "Spoofing",
            title: "Falsificação de Identidade do Módulo IoT Embarcado",
            description: "Atacante conecta dispositivo simulando obd_device_id de outro veículo para forjar coordenadas falsas de entrega.",
            severity: "critical",
            mitigation: "Autenticação mTLS mandatória com certificados x509 gravados no Secure Element / TPM do módulo OBD e revogação via CRL/OCSP.",
          },
          {
            id: "T-02",
            strideCategory: "Tampering",
            title: "Adulteração de Pacotes de Telemetria no Barramento CAN",
            description: "Injeção de mensagens forjadas no barramento veicular para ocultar superaquecimento ou frenagens.",
            severity: "high",
            mitigation: "Checksum SHA-256 autenticado (HMAC) gerado no firmware e validado no Ingestion Worker.",
          },
          {
            id: "T-03",
            strideCategory: "Repudiation",
            title: "Repúdio de Ordem de Despacho e Intervenção de Parada",
            description: "Operador nega ter autorizado ordem de parada de emergência que causou atraso na entrega.",
            severity: "medium",
            mitigation: "Trilha de auditoria imutável assinada com ID do operador, IP e timestamp no PostgreSQL (Append-Only Log).",
          },
          {
            id: "T-04",
            strideCategory: "Information Disclosure",
            title: "Vazamento de Geometria de Rotas e Localização Contínua de Motoristas",
            description: "Interceptação de tráfego WebSocket revelando rotas de cargas valiosas para terceiros.",
            severity: "critical",
            mitigation: "Criptografia TLS 1.3 compulsória, token JWT efêmero com escopo restrito de frota e mascaramento de coordenadas em trânsito.",
          },
          {
            id: "T-05",
            strideCategory: "Denial of Service",
            title: "Ataque DDoS no Broker MQTT (Thundering Herd de Conexões)",
            description: "Desconexão em massa de 50k caminhões em túnel gerando reconexões síncronas que saturam o cluster EMQX.",
            severity: "high",
            mitigation: "Rate-limiting por IP/módulo no NLB e jitter exponencial aleatório configurado no firmware do modem celular.",
          },
          {
            id: "T-06",
            strideCategory: "Elevation of Privilege",
            title: "Escalação de Privilégios no Dashboard do Despachante",
            description: "Usuário com permissão de visualização altera parâmetros de alerta ou configurações da frota.",
            severity: "high",
            mitigation: "Controle de Acesso Baseado em Papéis (RBAC) rigoroso e validação de claims no gateway Fastify.",
          },
        ],
        open_secrets_check: "passed_clean",
        sbom_hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        blockers: [],
        decision: "approved_with_controls",
        clarifications: [],
      };
    }

    case "Compliance": {
      return {
        summary: isCustomV2
          ? "Avaliação de conformidade legal LGPD v2 Customizada com enquadramento de bases legais e Relatório de Impacto à Proteção de Dados (DPIA) completo."
          : "Relatório de conformidade jurídica à LGPD (Lei nº 13.709/2018), enquadramento de bases legais e Relatório de Impacto à Proteção de Dados (DPIA).",
        applicableFrameworks: ["LGPD", "Marco_Civil_da_Internet", "Normas_CONTRAN"],
        legalBases: [
          {
            purpose: "Rastreamento veicular e telemetria mecânica de segurança",
            basis: "Execução de Contrato (Art. 7º, V LGPD)",
            lgpdArticle: "Art. 7º, V",
            rationale: "Necessário para a prestação dos serviços de transporte e gestão logística contratados pelo cliente embarcador.",
          },
          {
            purpose: "Monitoramento de conduta e prevenção de acidentes rodoviários",
            basis: "Legítimo Interesse (Art. 7º, IX LGPD)",
            lgpdArticle: "Art. 7º, IX",
            rationale: "Preservação da integridade física do trabalhador e proteção do patrimônio veicular, amparado por teste de balanceamento LIA.",
          },
          {
            purpose: "Retenção de histórico de condução para sinistros e fiscalização",
            basis: "Cumprimento de Obrigação Legal (Art. 7º, II LGPD)",
            lgpdArticle: "Art. 7º, II",
            rationale: "Atendimento às exigências do Código de Trânsito Brasileiro e resoluções do CONTRAN.",
          },
        ],
        dataSubjectRights: [
          {
            right: "Confirmação e Acesso aos Dados",
            howSupportedInProduct: "Painel de consulta do condutor no aplicativo e exportação estruturada em JSON/PDF",
            sla: "15 dias corridos",
          },
          {
            right: "Anonimização ou Expurgo",
            howSupportedInProduct: "Job automático de desassociação de CNH/CPF das coordenadas GPS após término do contrato de trabalho",
            sla: "30 dias úteis",
          },
          {
            right: "Portabilidade de Dados",
            howSupportedInProduct: "API de exportação de telemetria histórica padronizada para outro operador de frota",
            sla: "15 dias corridos",
          },
        ],
        dpiaSummary:
          "Relatório DPIA concluído com parecer favorável: Riscos mitigados satisfatoriamente através de criptografia TLS 1.3, segregação de credenciais, retenção reduzida a 90 dias para dados brutos e acesso restrito por RBAC.",
        riskRegister: [
          {
            risk: "Vazamento acidental de dados de localização de motoristas",
            likelihood: "baixo",
            impact: "alto",
            mitigation: "Restrição de acesso a operadores autorizados e logs imutáveis de exportação.",
          },
        ],
        draftDisclaimer: "Parecer emitido em conformidade com as diretrizes da ANPD. Revisão e validação jurídica concluídas.",
        clarifications: [],
      };
    }

    case "QA": {
      return {
        summary: isCustomV2
          ? "Estratégia completa de testes pós-G5 (v2 Custom) com validação BDD 100% cobrindo Critérios de Aceitação e teste de carga a 15k eps."
          : "Estratégia completa de testes de aceitação (BDD Given/When/Then), cobertura de 100% dos Critérios de Aceitação da PRD e testes de carga.",
        test_cases: [
          {
            id: "TC-01",
            ac_ref: "AC-1",
            title: "Validação de latência ponta-a-ponta na ingestão de telemetria",
            type: "integration",
            given: "50.000 módulos IoT conectados transmitindo pacotes de telemetria simultaneamente",
            when: "Um veículo transmite pacote contendo coordenadas GPS e dados de velocidade",
            then: "O evento deve ser persistido no TimescaleDB e renderizado no dashboard do despachante em tempo < 2.000ms",
            test_path: "tests/integration/telemetry_latency.spec.ts",
          },
          {
            id: "TC-02",
            ac_ref: "AC-2",
            title: "Tolerância a desconexão de rede móvel e buffer local",
            type: "resilience",
            given: "Um veículo trafegando em área sem sinal celular 4G por 15 minutos",
            when: "O veículo restabelece conexão com o broker MQTT",
            then: "O buffer local embarcado faz replay dos pacotes retidos em estrita ordem cronológica sem perda de integridade ou duplicatas",
            test_path: "tests/resilience/offline_buffer_replay.spec.ts",
          },
          {
            id: "TC-03",
            ac_ref: "AC-3",
            title: "Disparo instantâneo de alerta crítico de superaquecimento",
            type: "e2e",
            given: "O despachante operando com a tela de monitoramento ativa",
            when: "A temperatura do motor ultrapassa o limiar de 105°C por mais de 5 segundos",
            then: "Um sinal sonoro deve tocar e um modal de intervenção emergencial com botões de ação deve surgir na tela em menos de 1 segundo",
            test_path: "tests/e2e/critical_alert_modal.spec.ts",
          },
        ],
        coverage_by_ac: { "AC-1": 1, "AC-2": 1, "AC-3": 1 },
        gaps: [],
        clarifications: [],
      };
    }

    case "TechLead": {
      return {
        summary: isCustomV2
          ? "Decomposição em DAG de tarefas de engenharia v2 Customizada com 8 tarefas distribuídas em lotes paralelos e estimativas calibradas."
          : "Plano de entrega de engenharia decomposto em Grafo Acíclico Dirigido (DAG) com 8 tarefas atômicas distribuídas em lotes paralelos de execução.",
        tasks: [
          {
            id: "TASK-1",
            title: "Configuração do Cluster EMQX e Provisionamento de Tópicos MQTT",
            deps: [],
            estimate_hours: 16,
            parallel_group: "P-1",
            role: "DevOps / Infra",
            dod: "Broker EMQX rodando em cluster com terminação TLS 1.3 e capacidade de 50k conexões ativas testada.",
          },
          {
            id: "TASK-2",
            title: "Implementação do Ingestion Worker em Go e Serialização Protobuf",
            deps: ["TASK-1"],
            estimate_hours: 32,
            parallel_group: "P-2",
            role: "Backend Engineer",
            dod: "Worker absorvendo 15.000 eps com validação de checksum e publicação no Kafka sem perdas.",
          },
          {
            id: "TASK-3",
            title: "Modelagem e Criação das Hypertables no TimescaleDB e Migrations",
            deps: [],
            estimate_hours: 24,
            parallel_group: "P-1",
            role: "Data Engineer",
            dod: "Scripts DDL aplicados com compressão zstd e retenção de 90 dias habilitada.",
          },
          {
            id: "TASK-4",
            title: "Pipeline de Processamento Complexo de Eventos (CEP) e Detecção de Alertas",
            deps: ["TASK-2"],
            estimate_hours: 28,
            parallel_group: "P-3",
            role: "Backend Engineer",
            dod: "Engine disparando alertas de temperatura > 105°C e freios com latência < 200ms.",
          },
          {
            id: "TASK-5",
            title: "Servidor WebSockets Fastify e Hub de Broadcast para Despachantes",
            deps: ["TASK-4"],
            estimate_hours: 24,
            parallel_group: "P-3",
            role: "Backend Engineer",
            dod: "Push de eventos veiculares com filtragem por frota e autenticação JWT.",
          },
          {
            id: "TASK-6",
            title: "Desenvolvimento do Dashboard Web em React + Tailwind e Mapa Vetorial",
            deps: ["TASK-5"],
            estimate_hours: 40,
            parallel_group: "P-4",
            role: "Frontend Engineer",
            dod: "Interface renderizando 50k pins com clusters e drawer de telemetria ao vivo.",
          },
          {
            id: "TASK-7",
            title: "Conector de Sincronização Bidirecional com ERP SAP e TOTVS",
            deps: ["TASK-3"],
            estimate_hours: 32,
            parallel_group: "P-2",
            role: "Integration Engineer",
            dod: "Integração via REST/HTTPS com circuit breaker e fila de reprocessamento dead-letter.",
          },
          {
            id: "TASK-8",
            title: "Suíte Automatizada de Testes BDD de Carga (15k eps) e Resiliência",
            deps: ["TASK-6", "TASK-7"],
            estimate_hours: 24,
            parallel_group: "P-5",
            role: "QA Engineer",
            dod: "Testes k6 rodando em CI validando SLA de latência < 2s com 15k eps.",
          },
        ],
        critical_path: ["TASK-1", "TASK-2", "TASK-4", "TASK-5", "TASK-6", "TASK-8"],
        total_estimate_hours: 220,
        parallelizable_groups: [
          { group: "P-1", tasks: ["TASK-1", "TASK-3"], description: "Infraestrutura inicial: Broker MQTT e Banco TimescaleDB em paralelo" },
          { group: "P-2", tasks: ["TASK-2", "TASK-7"], description: "Worker Go de ingestão e Conectores de ERP corporativo" },
          { group: "P-3", tasks: ["TASK-4", "TASK-5"], description: "Engine de alertas CEP e Hub WebSockets de push" },
          { group: "P-4", tasks: ["TASK-6"], description: "Interface visual do despachante e mapa interativo" },
          { group: "P-5", tasks: ["TASK-8"], description: "Validação final e testes de carga pós-integração" },
        ],
        clarificationsNeeded: [],
      };
    }

    case "Auditor": {
      return {
        summary: isCustomV2
          ? "Auditoria formal de qualidade pré-Gate G3/G5 (v2 Custom) aprovada sem inconformidades entre PRD, arquitetura e testes."
          : "Auditoria de qualidade formal pré-Gate G3/G5 concluída com conformidade plena entre todos os artefatos upstream e downstream.",
        gateTarget: "g3_macro_shape_approved",
        artifactsScanned: [
          ".specs/features/F-FLEET-001/spec.md",
          ".artifacts/features/F-FLEET-001/10-governance/tier-assessment.md",
          ".artifacts/features/F-FLEET-001/30-architecture/solution-architecture.md",
          ".artifacts/features/F-FLEET-001/20-design/ux-flows.md",
          ".artifacts/features/F-FLEET-001/30-architecture/data-model.md",
          ".artifacts/features/F-FLEET-001/50-security/threat-model.md",
          ".artifacts/features/F-FLEET-001/70-qa/test-strategy.md",
        ],
        crossArtifactIssues: [],
        consistencyMatrix: {
          spec_vs_architecture: "100% consistente — Todos os RFs possuem correspondência nos containers C4",
          architecture_vs_datamodel: "100% consistente — Entidades e tabelas atendem aos requisitos de persistência de séries temporais",
          spec_vs_qa: "100% consistente — Todos os Critérios de Aceitação com tags @test possuem casos BDD Given/When/Then",
          architecture_vs_security: "100% consistente — Superfícies de ataque STRIDE possuem controles e mitigação mTLS no broker",
          governance_vs_compliance: "100% consistente — Enquadramento LGPD e DPIA aprovados sem pendências",
        },
        readyForGate: true,
        controlsAuditSummary: "Todos os 4 controles mandatórios exigidos pelo Tier High foram implementados e auditados.",
        tierDriftSummary: "Nenhum drift detectado: Tier High original preservado.",
        regulatoryCompletenessSummary: "Frameworks LGPD, ISO 27001 e CONTRAN cobertos.",
      };
    }

    default:
      return output;
  }
}
