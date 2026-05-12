import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProfessorLayout from "./layouts/ProfessorLayout";
import AlunoLayout from "./layouts/AlunoLayout";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/professor/Dashboard";
import IntelligenceDashboard from "./pages/professor/IntelligenceDashboard";
import Turmas from "./pages/professor/Turmas";
import TurmaForm from "./pages/professor/TurmaForm";
import TurmaDetalhe from "./pages/professor/TurmaDetalhe";
import * as P from "./pages/professor/MockPages";
import * as A from "./pages/aluno/MockPages";
import * as Ad from "./pages/admin/MockPages";
import * as S from "./pages/shared/SharedPages";
import GradebookReal from "./pages/professor/GradebookReal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/professor" element={<ProfessorLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="intelligence" element={<IntelligenceDashboard />} />
              <Route path="turmas" element={<Turmas />} />
              <Route path="turmas/nova" element={<TurmaForm />} />
              <Route path="turmas/:id" element={<TurmaDetalhe />} />
              <Route path="turmas/:id/editar" element={<TurmaForm />} />
              <Route path="disciplinas" element={<P.ProfDisciplinas />} />
              <Route path="disciplinas/nova" element={<P.ProfDisciplinaForm />} />
              <Route path="disciplinas/:id" element={<P.ProfDisciplinaDetalhe />} />
              <Route path="avaliacoes" element={<P.ProfAvaliacoes />} />
              <Route path="avaliacoes/nova" element={<P.ProfAvaliacaoForm />} />
              <Route path="avaliacoes/:id" element={<P.ProfAvaliacaoDetalhe />} />
              <Route path="notas/lancamento" element={<P.ProfLancamentoNotas />} />
              <Route path="notas/revisao" element={<P.ProfRevisaoNotas />} />
              <Route path="gradebook" element={<GradebookReal />} />
              <Route path="gradebook/turma/:id" element={<GradebookReal />} />
              <Route path="gradebook/aluno/:id" element={<P.ProfGradebookAluno />} />
              <Route path="frequencia" element={<P.ProfFrequencia />} />
              <Route path="frequencia/chamada" element={<P.ProfChamada />} />
              <Route path="frequencia/justificativas" element={<P.ProfJustificativas />} />
              <Route path="planejamento" element={<P.ProfPlanejamento />} />
              <Route path="planejamento/aula" element={<P.ProfPlanoAula />} />
              <Route path="planejamento/ensino" element={<P.ProfPlanoEnsino />} />
              <Route path="ia/atividades" element={<P.ProfGeradorIA />} />
              <Route path="ia/prova" element={<P.ProfGeradorProva />} />
              <Route path="ia/rubrica" element={<P.ProfGeradorRubrica />} />
              <Route path="ia/historico" element={<P.ProfHistoricoIA />} />
              <Route path="mural" element={<P.ProfMural />} />
              <Route path="mensagens" element={<P.ProfMensagens />} />
              <Route path="comunicados" element={<P.ProfComunicados />} />
              <Route path="relatorios" element={<P.ProfRelatorios />} />
              <Route path="relatorios/turma/:id" element={<P.ProfRelatorioTurma />} />
              <Route path="relatorios/aluno/:id" element={<P.ProfRelatorioAluno />} />
              <Route path="perfil" element={<P.ProfPerfil />} />
              <Route path="configuracoes" element={<P.ProfConfiguracoes />} />
            </Route>

            <Route path="/aluno" element={<AlunoLayout />}>
              <Route index element={<A.AlunoDashboard />} />
              <Route path="turmas" element={<A.AlunoTurmas />} />
              <Route path="turmas/:id" element={<A.AlunoTurmaDetalhe />} />
              <Route path="disciplinas/:id" element={<A.AlunoDisciplinaDetalhe />} />
              <Route path="atividades" element={<A.AlunoAtividades />} />
              <Route path="atividades/:id" element={<A.AlunoAtividadeDetalhe />} />
              <Route path="entregas" element={<A.AlunoEntregas />} />
              <Route path="avaliacoes" element={<A.AlunoAvaliacoes />} />
              <Route path="notas" element={<A.AlunoNotas />} />
              <Route path="notas/:id" element={<A.AlunoNotaDetalhe />} />
              <Route path="frequencia" element={<A.AlunoFrequencia />} />
              <Route path="materiais" element={<A.AlunoMateriais />} />
              <Route path="mural" element={<A.AlunoMural />} />
              <Route path="mensagens" element={<A.AlunoMensagens />} />
              <Route path="calendario" element={<A.AlunoCalendario />} />
              <Route path="biblioteca" element={<S.BibliotecaLista basePath="/aluno/biblioteca" />} />
              <Route path="biblioteca/:id" element={<S.BibliotecaDetalhe />} />
              <Route path="cursos" element={<S.CursosLista basePath="/aluno/cursos" />} />
              <Route path="cursos/:id" element={<S.CursoDetalhe />} />
              <Route path="area-escolar" element={<S.AreaEscolarPainel />} />
              <Route path="area-escolar/eventos" element={<S.AreaEscolarEventos />} />
              <Route path="area-escolar/secretaria" element={<S.AreaEscolarSecretaria />} />
              <Route path="area-escolar/financeiro" element={<S.AreaEscolarFinanceiro />} />
              <Route path="vazio/turmas" element={<S.VazioTurmas />} />
              <Route path="vazio/materiais" element={<S.VazioMateriais />} />
              <Route path="perfil" element={<A.AlunoPerfil />} />
              <Route path="configuracoes" element={<A.AlunoConfiguracoes />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Ad.AdminDashboard />} />
              <Route path="usuarios" element={<Ad.AdminUsuarios />} />
              <Route path="usuarios/novo" element={<Ad.AdminUsuarioForm />} />
              <Route path="usuarios/:id" element={<Ad.AdminUsuarioDetalhe />} />
              <Route path="turmas" element={<Ad.AdminTurmas />} />
              <Route path="turmas/nova" element={<Ad.AdminTurmaForm />} />
              <Route path="disciplinas" element={<Ad.AdminDisciplinas />} />
              <Route path="matriculas" element={<Ad.AdminMatriculas />} />
              <Route path="ano-letivo" element={<Ad.AdminAnoLetivo />} />
              <Route path="relatorios" element={<Ad.AdminRelatorios />} />
              <Route path="auditoria" element={<Ad.AdminAuditoria />} />
              <Route path="configuracoes" element={<Ad.AdminConfiguracoes />} />
              <Route path="integracoes" element={<Ad.AdminIntegracoes />} />
              <Route path="biblioteca" element={<S.BibliotecaLista basePath="/admin/biblioteca" accent="accent" />} />
              <Route path="biblioteca/:id" element={<S.BibliotecaDetalhe accent="accent" />} />
              <Route path="cursos" element={<S.CursosLista basePath="/admin/cursos" accent="accent" />} />
              <Route path="cursos/:id" element={<S.CursoDetalhe accent="accent" />} />
              <Route path="area-escolar" element={<S.AreaEscolarPainel accent="accent" />} />
              <Route path="area-escolar/eventos" element={<S.AreaEscolarEventos accent="accent" />} />
              <Route path="area-escolar/financeiro" element={<S.AreaEscolarFinanceiro accent="accent" />} />
            </Route>
            <Route path="/professor/biblioteca" element={<S.BibliotecaLista basePath="/professor/biblioteca" accent="secondary" />} />
            <Route path="/professor/biblioteca/:id" element={<S.BibliotecaDetalhe accent="secondary" />} />
            <Route path="/professor/cursos" element={<S.CursosLista basePath="/professor/cursos" accent="secondary" />} />
            <Route path="/professor/cursos/:id" element={<S.CursoDetalhe accent="secondary" />} />
            <Route path="/professor/avaliacoes/vazio" element={<S.VazioAvaliacoes />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
