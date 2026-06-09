# DOCUMENTAÇÃO MASTER: ECOSSISTEMA HEMERA

---

## 1. Documentação de Produto (A Visão Macro do Ecossistema)

### Visão Geral da Plataforma

O **Ecossistema Hemera** é um Sistema Operacional Educacional (End-to-End) de última geração, concebido para governar 100% da jornada acadêmica, administrativa, científica e cívica de uma instituição. Abandonando a ideia de sistemas isolados, o Hemera opera como uma constelação de submódulos interconectados. Toda a malha roda sobre a infraestrutura da **PentaIA**, sendo orquestrada cognitivamente pelo **ZIOS** (o núcleo de inteligência proativo).

O ecossistema anula o antigo projeto *Lumenios* e estabelece um novo padrão editorial, minimalista e hiper-integrado.

### O Mapa de Módulos (Topografia do Sistema)

Cada módulo foi desenhado para resolver um domínio específico, garantindo que o núcleo não se torne um monólito intransponível:

1. **Hemera OS (O Núcleo):** O portal de entrada e gestão acadêmica (K-12). Gerencia diários de classe, notas, turmas e perfis multilocatários (Aluno, Professor, Família).
2. **Hemera Séshat (O Acervo):** A biblioteca inteligente. Módulo de armazenamento (DAM) que processa PDFs e vídeos usando IA para extrair resumos, *tags* e permitir busca semântica em materiais didáticos.
3. **Hemera Lyceum (A Extensão):** Plataforma assíncrona para cursos complementares e trilhas de capacitação (modelo Udemy). Suporta *streaming* de vídeo (HLS) e controle de progresso.
4. **Hemera Pólis (A Comunidade):** O hub social e cívico seguro. Abriga fóruns moderados por IA, o sistema de votação irrevogável (**Ágora**) para grêmios, e plataformas de mídia estudantil (como a rádio *Vozes do CEEPs*).
5. **Hemera Héfesto (O Laboratório):** Ambiente de Aprendizagem Baseada em Projetos (PBL). Um portfólio e diário de campo científico em formato PWA/Offline para os alunos documentarem experimentos (Agroecologia, circuitos, etc.).
6. **Hemera Olimpo (O Motor de Engajamento):** Camada transversal de gamificação invisível. Transforma ações de todos os outros módulos em XP, insígnias e placares de líderes em tempo real.
7. **Hemera Hermes (O Back-office):** O ERP financeiro. Lida com cobranças, Pix, inadimplência e o repasse (split) de pagamentos dos cursos do Lyceum, isolado dos coordenadores pedagógicos.
8. **Hemera Moodle (A Ponte de Conformidade):** O motor de legado. Fica invisível no *back-end* para hospedar, rodar e rastrear pacotes SCORM e LTI impostos pelo MEC ou por terceiros.
9. **HemeraLM (O Oráculo Pedagógico):** O cérebro especializado da instituição. Um agente *RAG (Retrieval-Augmented Generation)* que constrói provas, avaliações e checa arquiteturas de código baseando-se única e exclusivamente nos documentos oficiais carregados pela escola, com tolerância zero à alucinação.

---

## 2. Documentação Técnica e de Arquitetura (A Malha)

### Arquitetura Global Integrada

O ecossistema adota uma arquitetura de microsserviços desacoplada, orientada a eventos, com o Python no centro do *back-end* e o ecossistema React/Vite no *front-end*.

* **O Barramento Nervoso (Mercúrio):** Nenhuma comunicação transversal ocorre via requisições HTTP travadas. Se o Héfesto (Lab) precisa dar pontos ao aluno, ele emite um evento no *Mercúrio*. O Olimpo (Gamificação) "escuta" e credita os pontos sem derrubar a rede.
* **A Fronteira Zero Trust (Heimdall):** Nenhum módulo possui banco de senhas próprio. A autenticação, tokens JWT, permissões e segredos de API são centralizados pelo Heimdall, que emite permissões baseadas no escopo do módulo.
* **Armazenamento de Múltiplos Paradigmas:**
  * **Relacional (PostgreSQL):** Transações financeiras (Hermes) e dados estruturados (Hemera OS).
  * **Vetorial (pgvector/Pinecone):** Busca semântica e ancoragem do LLM (HemeraLM e Séshat).
  * **Em Memória (Redis):** Sessões em tempo real (Pólis) e Placares de Gamificação de alta velocidade (Olimpo).

### O Loop de Inteligência (PentaIA + ZIOS)

A IA não é uma tela separada; ela respira dentro do código. A inteligência central é dividida em **5 subsistemas principais (PentaIA)** e monitorada via painel administrativo `/admin/pentaia`:

* **[PENTAIA (O Cérebro Mestre)](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/pentaia/README.md):** Camada de processamento cognitivo, orquestração e gestão de personas (Gisele Oliveira).
* **[ZIOS (Life OS)](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/pentaia/ZIOS.md):** Sistema operacional de vida que gerencia o fluxo diário, família (Iuza, Benjamim, Benício), cronogramas CEEPS e a Segunda Mente.
* **[IRIS (Insight & Visão)](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/pentaia/IRIS.md):** Observação de métricas, auditoria de UI/UX, e análise de sentimento.
* **[TAS (Total Analysis System)](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/pentaia/TAS.md):** Motor de recomendação baseado em uma arquitetura bio-inspirada que modula sensações (Tálamo), dopamina/retenção (Accubens) e foco de atenção (SARA) com ressonância regional (Bahia/Brasil).
* **[MERCÚRIO (Messenger & Bus)](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/pentaia/MERCURIO.md):** Protocolo de transporte de dados e barramento nervoso que orquestra o app de mensagens criptografado **Gorjeio**.
* **[HEIMDALL (Segurança & Guardião)](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/pentaia/HEIMDALL.md):** Sentinela de autenticação IAM, backups com Snapshot Recovery para Hortus Innocentiae/NioCortex, e alertas com Gjallarhorn.

---

## 3. Documentação de Desenvolvimento (Padrões do Ecossistema)

### Stack Fundamental de Engenharia

Qualquer novo desenvolvedor ingressando no projeto Hemera deve dominar a base tecnológica:

* **APIs & Back-end:** Python, `FastAPI`, `SQLAlchemy`, `asyncpg`, Celery.
* **Front-end & UI:** React, Vite, Tailwind CSS, *Service Workers* (para PWAs como o Héfesto).
* **Mídia:** `FFmpeg` (para converter vídeos do Lyceum em HLS) e APIs Web Audio (para a Pólis).
* **IA & LLMs:** `LangChain`, ferramentas de *Embeddings*, e forte manipulação de dicionários para extração semântica.

### Dicionário de Eventos (Event Payloads)

O barramento global exige padronização estrita. Qualquer ação do aluno (matricular, completar módulo, votar, pagar) deve emitir um JSON imutável:

```json
{
  "event_uuid": "...",
  "origin_module": "hemera-hefesto",
  "action": "empirical_data_logged",
  "user_id": "1234",
  "data_payload": { "project_type": "agroecology" },
  "timestamp": "2026-06-02T10:30:11-03:00"
}
```

### Regras de Contribuição e Engenharia de Prompt (HemeraLM)

1. Mudanças de arquitetura precisam refletir nos documentos Markdown estáticos.
2. Esses documentos devem ser imediatamente ingeridos (upload) no HemeraLM.
3. Se um código no *FastAPI* for atualizado e a documentação no HemeraLM não for, o oráculo ficará obsoleto e as integrações podem falhar por falta de referência.

---

## 4. Documentação de Operações (Manutenção e FinOps)

### Gestão de Custos e Infraestrutura (FinOps)

Gerir a malha Hemera é gerir a economia de nuvem. Os administradores do sistema têm três focos de alerta máximo:

1. **Tráfego Egress (Lyceum):** Monitorar *Terabytes* transmitidos pelas videoaulas via CDN/HLS.
2. **Uso de Tokens (HemeraLM e Séshat):** Geração de resumos, transcrição de áudios (Pólis) e inferência em provas consomem chamadas de API (OpenAI/Ollama). Alarmes no *Datadog/Grafana* devem disparar caso o limite orçamentário mensal se aproxime.
3. **Storage (Séshat e Héfesto):** Arquivos brutos devem ter rotinas de compressão de mídia antes de baterem nos *Buckets* do Supabase.

### Deploy e Escalabilidade

* O Hemera opera com Integração Contínua (CI/CD). Branchs da `main` disparam builds do Docker.
* A separação modular permite escalabilidade direcionada: se hoje é dia de eleição para o Grêmio, o orquestrador (Kubernetes ou Edge Functions) aloca o triplo de RAM e CPU unicamente para o microsserviço eleitoral (Ágora/Pólis), mantendo o Hermes (Financeiro) inalterado.

### Monitoramento de Negócio (Auditoria)

* **Auditoria Acadêmica:** Diários não podem sofrer alterações sem registro. O Hemera OS deve salvar *logs* estritos de notas sobrescritas.
* **Auditoria Financeira:** O Hemera Hermes bloqueia *updates* em valores transacionados. Todo ajuste é feito via técnica de *Event Sourcing* (emissão de registros compensatórios em banco).
