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

## 🎨 Recursos & Módulos Implementados

### 🖥️ 1. Landing Page do Hemera OS (Raiz `/`)
- Menu superior de navegação com dropdowns reativos de **Recursos** (Gestão, Biblioteca, Chamada) e **IA Educacional** (RAG, ZIOS).
- Estatísticas do MEC com cards de conformidade à BNCC, índice de evasão prevido pela IA e aproveitamento escolar médio.
- Seção de vitrines interativas descrevendo a infraestrutura dos subagentes.

### 📐 2. Painel do Professor (`/professor`)
- **Barra Lateral Esquerda**: Perfil docente do professor logado (foto, cargo, matrícula), widget com clima em tempo real em Seabra - BA (26°C, Nublado) e quadro de lembretes/prazos urgentes.
- **Acesso Rápido**: Atalhos em grid de alta legibilidade para *Lançar Notas*, *Registrar Chamada*, *Plano de Aula*, *Gerador de Provas* e *Biblioteca Digital*.
- **Grade Semanal**: Tabela responsiva de horários organizada por períodos (Manhã, Tarde e Noite) com renderização de aulas de cada turma.

### 📊 3. Painel da Turma & Cronograma (`/professor/turmas/:id`)
- **Visão Geral da Turma**:
  - **Métricas**: Cards contendo total de alunos matriculados, número de atividades planejadas e taxa de frequência média.
  - **Situação Acadêmica**: Gráfico donut circular estilizado mostrando a relação de alunos Aprovados (80%), Em Recuperação (15%) e Reprovados (5%).
  - **Coluna de Alunos (Esquerda)**: Lista interativa com as médias gerais e frequência de cada estudante.
  - **Coluna do Cronograma (Direita)**: Linha do tempo vertical animada contendo tarefas escolares, simulados e provas bimestrais com status ("Concluído", "Pendente" ou "Agendado").
- **Mural da Turma**: Feed social com avisos do professor, likes, comentários e suporte a anexos de arquivos.
- **Chamada Rápida**: Controle de presença diário com persistência automática no banco.
- **Diário de Classe**: Registro do que foi lecionado em cada aula com base no cronograma BNCC.

### 📚 4. Biblioteca Digital Universal
- Busca integrada de livros e obras literárias de domínio público.
- Tratamento robusto de erros e sanitização da API do Google Books com encadeamento opcional para evitar quebras de visual.
- Fallback automático para o acervo de obras nacionais (Machado de Assis, Aluísio Azevedo, etc.) caso a API externa sofra restrição ou queda.

---

## 🧪 Suíte de Testes & Validação

### Testes do Frontend (React/Vitest)
Para executar a suíte de testes unitários e de integração do frontend localmente:
```bash
npm run test
```
*Garante que todos os 20 cenários de testes do painel continuam íntegros.*

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
