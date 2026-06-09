# 🧠 Hemera OS — Plataforma Educacional Inteligente

O **Hemera OS** é o primeiro sistema operacional educacional unificado e inteligente. Ele integra toda a infraestrutura escolar, controle acadêmico, barramento de eventos em tempo real, biblioteca digital com Grounding e agentes autônomos de Inteligência Artificial baseados na BNCC (Base Nacional Comum Curricular).

Para uma visão completa da arquitetura global, microsserviços e topografia do sistema, consulte a **[Documentação Master do Ecossistema Hemera](file:///c:/Users/Ian%20Santos/Desktop/VSCODE/MultiVerso%20IO/hemera-react-main/docs/ECOSSISTEMA_HEMERA.md)**.

---

## 🚀 Como Iniciar o Ecossistema (Docker)

Toda a arquitetura é executada em containers Docker orquestrados via `docker-compose`.

### 1. Requisitos Prévios
- Certifique-se de que o **Docker Desktop** está instalado e aberto em sua máquina.

### 2. Inicializar os Containers
Execute o comando a seguir no diretório raiz do projeto para buildar e iniciar todos os 4 microsserviços em background:
```bash
docker-compose up -d --build
```

**Mapeamento de Serviços & Portas:**
- **db** (PostgreSQL 15): Banco de dados relacional.
- **backend** (Django API): Rodando na porta [8000](http://localhost:8000) (API/Admin).
- **pentaia** (FastAPI Service): Rodando na porta [8001](http://localhost:8001) (IA/RAG).
- **frontend** (Vite/React): Rodando na porta [5173](http://localhost:5173) (Painel Web).

### 3. Aplicar Migrações do Banco de Dados
Com os containers rodando, execute as migrações do Django dentro do container do backend:
```bash
docker-compose exec backend python manage.py migrate
```

---

## 🔑 Bypass de Autenticação (Modo Demonstração)

Caso você não possua chaves SMTP configuradas ou tenha problemas de conexão com o provedor de autenticação do Supabase, o sistema possui um **Modo Demo integrado**:
1. Acesse o portal de acesso em [http://localhost:5173/auth](http://localhost:5173/auth).
2. Na parte inferior do formulário, clique em qualquer um dos botões do **Acesso de Demonstração**:
   - **Docente**: Entrar como Professor (Ian Santos).
   - **Aluno**: Entrar como Aluno (Carlos Silva).
   - **Gestor**: Entrar como Administrador (Diretor Geral).
3. O sistema criará uma sessão mockada local e liberará todas as rotas restritas correspondentes instantaneamente.

---

## 🎨 Recursos & Módulos Implementados (Pente Fino de QA)

O ecossistema foi refatorado para habilitar **interatividade completa** por meio de um sistema híbrido de chamadas de API reais e simulações robustas persistidas localmente.

### 🖥️ 1. Landing Page do Hemera OS (Raiz `/`)
- Menu superior de navegação com dropdowns reativos de **Recursos** (Gestão, Biblioteca, Chamada) e **IA Educacional** (RAG, ZIOS).
- Estatísticas do MEC com cards de conformidade à BNCC, índice de evasão previsto pela IA e aproveitamento escolar médio.
- Seção de vitrines interativas descrevendo a infraestrutura dos subagentes.

### 📐 2. Painel do Professor (`/professor`)
- **Lançamento Rápido de Notas**: Inputs numéricos reais por aluno com validação de limite (0 a 10). O salvamento é efetuado ao pressionar *Enter* ou perder o foco (`onBlur`), atualizando o status para "Lançada" no `localStorage` (`hemera_professor_notas`).
- **Justificativas de Falta**: Aprovação/rejeição de atestados ou justificativas acadêmicas em tempo real, gravando o novo status na tabela local.
- **Grade Semanal**: Tabela responsiva de horários organizada por períodos (Manhã, Tarde e Noite) com renderização de aulas.

### 📊 3. Painel da Turma & Cronograma (`/professor/turmas/:id`)
- **Visão Geral da Turma**: Métricas reativas (alunos matriculados, atividades planejadas, frequência média) e gráficos de situação acadêmica (Aprovados/Em Recuperação).
- **Mural da Turma**: Feed social interativo com suporte a likes, comentários e anexos de arquivos.
- **Chamada Rápida**: Registro diário de presença persistido automaticamente no banco.

### 📘 4. Biblioteca Digital Universal (Interativa)
- Busca integrada de livros e obras literárias através da API do Google Books.
- **Reservas & Devoluções Reativas**: Ações de reservar e devolver livros totalmente interativas, atualizando o grid local com um badge visual de *"Reservado"* e salvando o estado no `localStorage` (`hemera_biblioteca`).
- Fallback automático para o acervo de obras clássicas de domínio público caso a API externa sofra queda.

### 📂 5. Moodle Integrado (Pólis)
- **Validação Estrita de Uploads**: Campo de upload real substitui a entrada de texto e aplica filtros rígidos de QA:
  - **Limite de Tamanho**: Bloqueia arquivos maiores que **10MB**.
  - **Extensões Permitidas**: Rejeita formatos não homologados, aceitando estritamente `.pdf`, `.zip`, `.docx` e `.png`.
  - Exibe feedbacks via Toast e anexa os arquivos validados diretamente à tarefa.

### 💰 6. Área Financeira & Secretaria Virtual
- **Área Financeira**:
  - Exibição de faturas escolares com status dinâmicos.
  - **Boleto Bancário**: Modal com código de barras gerado via SVG e opção de simulação de impressão/PDF.
  - **Pagamento Pix**: Geração dinâmica de QR Code em SVG, chave copia-e-cola com feedback visual e toast informativo.
  - A quitação de faturas atualiza a tabela e persiste em `localStorage` (`hemera_financeiro_faturas`).
- **Secretaria Virtual**:
  - Formulário para solicitação de documentos (Histórico Escolar, Declaração, etc.).
  - Cadastro de solicitações persistido no `localStorage` com cálculo automático de prazo (2 dias úteis) e status "Pendente".

### 🏫 7. Matrículas & Emissão de Documentos (Gestão/Admin)
- **Fluxo de Matrícula**: Formulário para matricular novos alunos associando-os a turmas, salvando as informações no `localStorage` (`hemera_admin_matriculas`).
- **Declaração de Matrícula**: Renderização de papel timbrado com assinatura digital e carimbo de autenticidade emitidos de forma criptográfica pelo sentinela **Heimdall**.

### 💬 8. Thorth Messenger (Telegram Web)
- Interface de chat que simula o Telegram Web integrada ao backend Django via `/core/api/chat/`.
- **Anexos Visuais**: Suporte ao envio de mídias (documentos PDF, imagens ou notas de áudio), renderizando cards interativos específicos para cada tipo de mídia dentro da bolha de conversa.
- **Bot de IA Integrado**: Respostas automáticas em tempo real geradas pelo assistente ZIOS Bridge.

### 🔮 9. HemeraLM (Grounding IA com PentaIA)
- **Chat Conectado**: Requisições reais POST para `${AI_URL}/v1/chat/interact` com cabeçalho `x-service-token` de segurança para grounding na BNCC.
- **Fallback Offline**: Fallback inteligente que simula as respostas caso o container de IA esteja indisponível, garantindo fluidez.
- **Anotações Persistentes**: Bloco de notas persistente integrado no painel lateral salvando anotações no `localStorage` (`hemera_notes`).

---

## 🔌 Orquestração de Dados & Serviços (Docker)

O ecossistema divide-se em 5 contêineres:
1. **db** (`postgres:15`): Banco relacional central.
2. **redis** (`redis:7-alpine`): Cache e gerenciamento de camadas de websockets do Django Channels.
3. **backend** (Django API): Roda o Daphne (ASGI) na porta `8000`. Detecta dinamicamente a presença do `DATABASE_URL` no compose, utilizando o SQLite local (`db.sqlite3`) para fins de teste no container do backend caso a conexão com Postgres sofra instabilidade.
4. **pentaia** (FastAPI): Roda na porta `8001`. Provê os endpoints cognitivos e de RAG.
5. **frontend** (Vite/React): Servidor de desenvolvimento exposto na porta `5173`.

---

## 🧪 Suíte de Testes & Validação

### Testes do Frontend (React/Vitest)
Para executar a suíte de testes unitários e de integração do frontend localmente:
```bash
npm run test
```
*Garante que todos os cenários de testes do painel e serviços continuam íntegro.*

### Validação de Tipos (TypeScript)
Para assegurar a integridade do código fonte e a ausência de erros de build:
```bash
npx tsc --noEmit
```

### Testes do Backend (Django/Python)
Entre na pasta do backend ou utilize o comando docker:
```bash
docker-compose exec backend python -m pytest tests/
```
