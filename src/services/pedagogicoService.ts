import { supabase } from '@/integrations/supabase/client';
import { PlanoDeAula } from '@/types';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
  periodo: string;
  professor_id: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  turma_id: string;
  professor_id: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string | null;
  email: string | null;
  turma_id: string;
  nota_media: number;
  taxa_frequencia: number;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string | null;
  data_entrega: string;
  disciplina_id: string | null;
  turma_id: string;
  professor_id: string;
  valor_maximo: number;
}

export interface Nota {
  id: string;
  aluno_id: string;
  atividade_id: string;
  valor: number;
  feedback: string | null;
}

export interface PostagemMural {
  id: string;
  turma_id: string;
  autor_id: string;        // schema real usa autor_id
  texto: string;
  arquivo_nome: string | null;
  created_at: string;
}

export interface Lembrete {
  id: string;
  texto: string;
  data_criacao: string;
  status: string;
  id_user?: number;
}

export interface Horario {
  id: string;
  turma_id: string;
  dia_semana: number;
  hora_inicio: string;
  is_ac: boolean;
  turmas?: { nome: string } | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getProfessorId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Usuário não autenticado');
  return data.user.id;
}

// ─── Service ───────────────────────────────────────────────────────────────────

// Mocks baseados nos seeds oficiais do projeto
export const MOCK_TURMAS: Turma[] = [
  { id: "t1", nome: "1ª A INTEGRAL (Agroecologia)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t2", nome: "1ª A ADM (Estação dos Saberes)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t3", nome: "1ª B ADM (Estação dos Saberes)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t4", nome: "2ª/3ª E FLUXO (Matemática)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t5", nome: "1ª D ADM (Estação dos Saberes)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t6", nome: "2ª INTEGRAL (Estação dos Saberes)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t7", nome: "1ª B INTEGRAL (Agroecologia)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t8", nome: "2ª D (Química)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "t9", nome: "3ªC ELETIVA (Matemática)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" }
];

export const MOCK_ALUNOS: Record<string, Aluno[]> = {
  t1: [
    { id: "a_124", nome: "ISABELA GOMES ARAUJO", matricula: "2026-MAT-124", email: "isabela.gomes.araujo@hemera.io", turma_id: "t1", nota_media: 7.4, taxa_frequencia: 85 },
    { id: "a_125", nome: "LETICIA SANTOS DE JESUS", matricula: "2026-MAT-125", email: "leticia.santos.de.jesus@hemera.io", turma_id: "t1", nota_media: 6.3, taxa_frequencia: 86 },
    { id: "a_126", nome: "ELOISA NICOLE", matricula: "2026-MAT-126", email: "eloisa.nicole@hemera.io", turma_id: "t1", nota_media: 6.6, taxa_frequencia: 74 },
    { id: "a_127", nome: "MANUEL SILVA MELO FILHO", matricula: "2026-MAT-127", email: "manuel.silva.melo.filho@hemera.io", turma_id: "t1", nota_media: 7.4, taxa_frequencia: 99 },
    { id: "a_128", nome: "MARIA ESTEFANE MORAES DA SILVA", matricula: "2026-MAT-128", email: "maria.estefane.moraes.da.silva@hemera.io", turma_id: "t1", nota_media: 9.2, taxa_frequencia: 75 },
    { id: "a_129", nome: "GUSTAVO DE OLIVEIRA MATOS ", matricula: "2026-MAT-129", email: "gustavo.de.oliveira.matos.@hemera.io", turma_id: "t1", nota_media: 5.7, taxa_frequencia: 89 },
    { id: "a_130", nome: "GABRIEL GOMES ALMEIDA", matricula: "2026-MAT-130", email: "gabriel.gomes.almeida@hemera.io", turma_id: "t1", nota_media: 9.1, taxa_frequencia: 74 },
    { id: "a_131", nome: "ERIC JOS\u00c9 LIMA MORAIS", matricula: "2026-MAT-131", email: "eric.jose.lima.morais@hemera.io", turma_id: "t1", nota_media: 9.5, taxa_frequencia: 99 },
    { id: "a_132", nome: "LUIS FELIPE BEN\u00cdCIO", matricula: "2026-MAT-132", email: "luis.felipe.benicio@hemera.io", turma_id: "t1", nota_media: 6.5, taxa_frequencia: 85 },
    { id: "a_133", nome: "KAIKE FABIO NEVES DE SOUSA", matricula: "2026-MAT-133", email: "kaike.fabio.neves.de.sousa@hemera.io", turma_id: "t1", nota_media: 7.6, taxa_frequencia: 78 },
    { id: "a_194", nome: "THIAGO ALCANTARA VIEIRA", matricula: "2026-MAT-194", email: "thiago.alcantara.vieira@hemera.io", turma_id: "t1", nota_media: 9.6, taxa_frequencia: 94 },
  ],
  t2: [
    { id: "a_134", nome: "PAMELA DA SILVA MACEDO", matricula: "2026-MAT-134", email: "pamela.da.silva.macedo@hemera.io", turma_id: "t2", nota_media: 9.2, taxa_frequencia: 100 },
    { id: "a_135", nome: "MARIA EDUARDA BASTOS SOUZA", matricula: "2026-MAT-135", email: "maria.eduarda.bastos.souza@hemera.io", turma_id: "t2", nota_media: 5.8, taxa_frequencia: 84 },
    { id: "a_136", nome: "LAURA", matricula: "2026-MAT-136", email: "laura@hemera.io", turma_id: "t2", nota_media: 5.5, taxa_frequencia: 84 },
    { id: "a_137", nome: "ISABEL", matricula: "2026-MAT-137", email: "isabel@hemera.io", turma_id: "t2", nota_media: 6.6, taxa_frequencia: 97 },
    { id: "a_138", nome: "ISADORA", matricula: "2026-MAT-138", email: "isadora@hemera.io", turma_id: "t2", nota_media: 8.9, taxa_frequencia: 81 },
    { id: "a_139", nome: "PEDRO LUCAS MENDES SANTANA", matricula: "2026-MAT-139", email: "pedro.lucas.mendes.santana@hemera.io", turma_id: "t2", nota_media: 7.3, taxa_frequencia: 95 },
    { id: "a_140", nome: "REINALDO", matricula: "2026-MAT-140", email: "reinaldo@hemera.io", turma_id: "t2", nota_media: 9.8, taxa_frequencia: 89 },
    { id: "a_141", nome: "WENDEL ALCANTARA DE SOUZA", matricula: "2026-MAT-141", email: "wendel.alcantara.de.souza@hemera.io", turma_id: "t2", nota_media: 8.3, taxa_frequencia: 87 },
    { id: "a_142", nome: "MARLEY", matricula: "2026-MAT-142", email: "marley@hemera.io", turma_id: "t2", nota_media: 6.2, taxa_frequencia: 81 },
    { id: "a_143", nome: "CRISTAL", matricula: "2026-MAT-143", email: "cristal@hemera.io", turma_id: "t2", nota_media: 6.4, taxa_frequencia: 73 },
    { id: "a_144", nome: "RAFAELA", matricula: "2026-MAT-144", email: "rafaela@hemera.io", turma_id: "t2", nota_media: 8.0, taxa_frequencia: 89 },
    { id: "a_145", nome: "JO\u00c3O MATEUS LIMA ALVES", matricula: "2026-MAT-145", email: "joao.mateus.lima.alves@hemera.io", turma_id: "t2", nota_media: 5.8, taxa_frequencia: 82 },
    { id: "a_146", nome: "JO\u00c3O VITOR", matricula: "2026-MAT-146", email: "joao.vitor@hemera.io", turma_id: "t2", nota_media: 5.7, taxa_frequencia: 90 },
    { id: "a_147", nome: "GABRIEL SEBASTIAN", matricula: "2026-MAT-147", email: "gabriel.sebastian@hemera.io", turma_id: "t2", nota_media: 7.6, taxa_frequencia: 99 },
    { id: "a_148", nome: "PEDRO ARIEL DE SOUZA SANTOS", matricula: "2026-MAT-148", email: "pedro.ariel.de.souza.santos@hemera.io", turma_id: "t2", nota_media: 7.8, taxa_frequencia: 73 },
    { id: "a_149", nome: "KAROLAYNE VITORIA SOUZA NOVAES", matricula: "2026-MAT-149", email: "karolayne.vitoria.souza.novaes@hemera.io", turma_id: "t2", nota_media: 9.6, taxa_frequencia: 74 },
    { id: "a_150", nome: "ANA VITORIA", matricula: "2026-MAT-150", email: "ana.vitoria@hemera.io", turma_id: "t2", nota_media: 9.2, taxa_frequencia: 74 },
    { id: "a_151", nome: "REBECA", matricula: "2026-MAT-151", email: "rebeca@hemera.io", turma_id: "t2", nota_media: 8.1, taxa_frequencia: 93 },
    { id: "a_152", nome: "LARA VICTORIA", matricula: "2026-MAT-152", email: "lara.victoria@hemera.io", turma_id: "t2", nota_media: 9.2, taxa_frequencia: 84 },
    { id: "a_153", nome: "DEVID", matricula: "2026-MAT-153", email: "devid@hemera.io", turma_id: "t2", nota_media: 6.0, taxa_frequencia: 100 },
    { id: "a_154", nome: "LUNA KELLY MEDEIROS QUEIROZ", matricula: "2026-MAT-154", email: "luna.kelly.medeiros.queiroz@hemera.io", turma_id: "t2", nota_media: 7.9, taxa_frequencia: 90 },
    { id: "a_155", nome: "PEDRO GABRIEL DOS SANTOS", matricula: "2026-MAT-155", email: "pedro.gabriel.dos.santos@hemera.io", turma_id: "t2", nota_media: 8.1, taxa_frequencia: 91 },
    { id: "a_156", nome: "FABRICIA", matricula: "2026-MAT-156", email: "fabricia@hemera.io", turma_id: "t2", nota_media: 5.9, taxa_frequencia: 93 },
    { id: "a_157", nome: "ANA CLAUDIA", matricula: "2026-MAT-157", email: "ana.claudia@hemera.io", turma_id: "t2", nota_media: 8.0, taxa_frequencia: 88 },
    { id: "a_158", nome: "LAISANI", matricula: "2026-MAT-158", email: "laisani@hemera.io", turma_id: "t2", nota_media: 6.9, taxa_frequencia: 80 },
    { id: "a_159", nome: "VIVIAN ARAUJO ALVES", matricula: "2026-MAT-159", email: "vivian.araujo.alves@hemera.io", turma_id: "t2", nota_media: 6.4, taxa_frequencia: 94 },
    { id: "a_164", nome: "LINCESY ALVES DOS SANTOS", matricula: "2026-MAT-164", email: "lincesy.alves.dos.santos@hemera.io", turma_id: "t2", nota_media: 9.5, taxa_frequencia: 72 },
    { id: "a_165", nome: "ELO\u00c1 BARRETO FRAGA", matricula: "2026-MAT-165", email: "eloa.barreto.fraga@hemera.io", turma_id: "t2", nota_media: 7.5, taxa_frequencia: 90 },
    { id: "a_166", nome: "LUIZ HENRIQUE MIRANDA SENA", matricula: "2026-MAT-166", email: "luiz.henrique.miranda.sena@hemera.io", turma_id: "t2", nota_media: 9.8, taxa_frequencia: 74 },
    { id: "a_167", nome: "ELO\u00c1 SANTOS RIVAS", matricula: "2026-MAT-167", email: "eloa.santos.rivas@hemera.io", turma_id: "t2", nota_media: 7.8, taxa_frequencia: 88 },
    { id: "a_168", nome: "PEDRO HENRIQUE SOUZA MARTINS", matricula: "2026-MAT-168", email: "pedro.henrique.souza.martins@hemera.io", turma_id: "t2", nota_media: 6.6, taxa_frequencia: 83 },
    { id: "a_169", nome: "JHULLIE BRAND\u00c3O TEIXEIRA", matricula: "2026-MAT-169", email: "jhullie.brandao.teixeira@hemera.io", turma_id: "t2", nota_media: 9.3, taxa_frequencia: 100 },
    { id: "a_170", nome: "GABRIELA TELES CIDREIRA", matricula: "2026-MAT-170", email: "gabriela.teles.cidreira@hemera.io", turma_id: "t2", nota_media: 6.6, taxa_frequencia: 81 },
    { id: "a_171", nome: "ALISSON FEITOSA", matricula: "2026-MAT-171", email: "alisson.feitosa@hemera.io", turma_id: "t2", nota_media: 6.2, taxa_frequencia: 98 },
    { id: "a_195", nome: "EMILLY VICTORIA SANTANA R. DOS SANTOS", matricula: "2026-MAT-195", email: "emilly.victoria.santana.r.dos.santos@hemera.io", turma_id: "t2", nota_media: 9.4, taxa_frequencia: 89 },
    { id: "a_196", nome: "KATHARINE LIMA FREITAS", matricula: "2026-MAT-196", email: "katharine.lima.freitas@hemera.io", turma_id: "t2", nota_media: 5.7, taxa_frequencia: 83 },
  ],
  t3: [
    { id: "a_172", nome: "GEOVANNA RIBEIRO MARTINS", matricula: "2026-MAT-172", email: "geovanna.ribeiro.martins@hemera.io", turma_id: "t3", nota_media: 7.8, taxa_frequencia: 81 },
    { id: "a_173", nome: "PEDRO CORDEIRO SANTOS", matricula: "2026-MAT-173", email: "pedro.cordeiro.santos@hemera.io", turma_id: "t3", nota_media: 8.1, taxa_frequencia: 97 },
    { id: "a_174", nome: "LUKA THIERRY S\u00c1 TELES DE ARA\u00daJO", matricula: "2026-MAT-174", email: "luka.thierry.sa.teles.de.araujo@hemera.io", turma_id: "t3", nota_media: 8.3, taxa_frequencia: 72 },
    { id: "a_175", nome: "MARIANA TEIXEIRA DE SOUZA", matricula: "2026-MAT-175", email: "mariana.teixeira.de.souza@hemera.io", turma_id: "t3", nota_media: 8.4, taxa_frequencia: 89 },
    { id: "a_176", nome: "CLARA LUISA MIRANDA TEIXEIRA", matricula: "2026-MAT-176", email: "clara.luisa.miranda.teixeira@hemera.io", turma_id: "t3", nota_media: 6.8, taxa_frequencia: 93 },
    { id: "a_177", nome: "PEDRO KAUAN SOUZA OLIVEIRA", matricula: "2026-MAT-177", email: "pedro.kauan.souza.oliveira@hemera.io", turma_id: "t3", nota_media: 5.9, taxa_frequencia: 100 },
    { id: "a_178", nome: "THAUANY RODRIGUES DE SOUZA", matricula: "2026-MAT-178", email: "thauany.rodrigues.de.souza@hemera.io", turma_id: "t3", nota_media: 6.1, taxa_frequencia: 75 },
    { id: "a_179", nome: "JULIA SANTOS ARA\u00daJO", matricula: "2026-MAT-179", email: "julia.santos.araujo@hemera.io", turma_id: "t3", nota_media: 9.3, taxa_frequencia: 95 },
    { id: "a_180", nome: "ALEX VITORIO BARROS DO NASCIMENTO", matricula: "2026-MAT-180", email: "alex.vitorio.barros.do.nascimento@hemera.io", turma_id: "t3", nota_media: 7.9, taxa_frequencia: 80 },
    { id: "a_181", nome: "JULIA TELES RIBEIRO", matricula: "2026-MAT-181", email: "julia.teles.ribeiro@hemera.io", turma_id: "t3", nota_media: 6.7, taxa_frequencia: 78 },
    { id: "a_182", nome: "ISABELA GOMES DE SOUZA", matricula: "2026-MAT-182", email: "isabela.gomes.de.souza@hemera.io", turma_id: "t3", nota_media: 8.6, taxa_frequencia: 78 },
    { id: "a_183", nome: "TULIO RIBEIRO DE AZEVEDO ROCHA", matricula: "2026-MAT-183", email: "tulio.ribeiro.de.azevedo.rocha@hemera.io", turma_id: "t3", nota_media: 8.5, taxa_frequencia: 99 },
    { id: "a_184", nome: "ANA CLARA BISPO SILVA", matricula: "2026-MAT-184", email: "ana.clara.bispo.silva@hemera.io", turma_id: "t3", nota_media: 6.6, taxa_frequencia: 87 },
    { id: "a_185", nome: "CAU\u00c1 SOUZA SILVA", matricula: "2026-MAT-185", email: "caua.souza.silva@hemera.io", turma_id: "t3", nota_media: 6.6, taxa_frequencia: 99 },
    { id: "a_186", nome: "ISABELLA XAVIER AMARAL", matricula: "2026-MAT-186", email: "isabella.xavier.amaral@hemera.io", turma_id: "t3", nota_media: 5.7, taxa_frequencia: 92 },
    { id: "a_187", nome: "NICOLLY BRITO DE SOUZA", matricula: "2026-MAT-187", email: "nicolly.brito.de.souza@hemera.io", turma_id: "t3", nota_media: 7.3, taxa_frequencia: 80 },
    { id: "a_188", nome: "LARA VITORIA OLIVEIRA MENDES", matricula: "2026-MAT-188", email: "lara.vitoria.oliveira.mendes@hemera.io", turma_id: "t3", nota_media: 5.7, taxa_frequencia: 82 },
    { id: "a_189", nome: "PEDRO HENRIQUE SOUZA", matricula: "2026-MAT-189", email: "pedro.henrique.souza@hemera.io", turma_id: "t3", nota_media: 8.8, taxa_frequencia: 92 },
    { id: "a_190", nome: "MARIA EDUARDA BISPO DOS SANTOS", matricula: "2026-MAT-190", email: "maria.eduarda.bispo.dos.santos@hemera.io", turma_id: "t3", nota_media: 9.7, taxa_frequencia: 77 },
    { id: "a_191", nome: "KAROLAINE SILVA SOUZA", matricula: "2026-MAT-191", email: "karolaine.silva.souza@hemera.io", turma_id: "t3", nota_media: 8.7, taxa_frequencia: 89 },
    { id: "a_192", nome: "JOSYLEIA NASCIMENTO MENEZES", matricula: "2026-MAT-192", email: "josyleia.nascimento.menezes@hemera.io", turma_id: "t3", nota_media: 8.5, taxa_frequencia: 89 },
    { id: "a_193", nome: "JULIA CATHARINE SOUZA TELES", matricula: "2026-MAT-193", email: "julia.catharine.souza.teles@hemera.io", turma_id: "t3", nota_media: 5.5, taxa_frequencia: 74 },
    { id: "a_197", nome: "ANA JULIA DALTRON AMARAL", matricula: "2026-MAT-197", email: "ana.julia.daltron.amaral@hemera.io", turma_id: "t3", nota_media: 8.0, taxa_frequencia: 76 },
    { id: "a_198", nome: "MARIA CLARA ALVES FERREIRA", matricula: "2026-MAT-198", email: "maria.clara.alves.ferreira@hemera.io", turma_id: "t3", nota_media: 7.3, taxa_frequencia: 73 },
    { id: "a_199", nome: "IAN SANTOS SILVA", matricula: "2026-MAT-199", email: "ian.santos.silva@hemera.io", turma_id: "t3", nota_media: 6.8, taxa_frequencia: 100 },
  ],
  t4: [
    { id: "a_22", nome: "FRANCIELE ALVES", matricula: "2026-MAT-022", email: "franciele.alves@hemera.io", turma_id: "t4", nota_media: 7.5, taxa_frequencia: 75 },
    { id: "a_23", nome: "GUILHERME S. PEREIRA", matricula: "2026-MAT-023", email: "guilherme.s.pereira@hemera.io", turma_id: "t4", nota_media: 9.7, taxa_frequencia: 84 },
    { id: "a_24", nome: "EMERSON GABRIEL", matricula: "2026-MAT-024", email: "emerson.gabriel@hemera.io", turma_id: "t4", nota_media: 5.8, taxa_frequencia: 81 },
    { id: "a_25", nome: "ISIS CATARINE S. C.", matricula: "2026-MAT-025", email: "isis.catarine.s.c.@hemera.io", turma_id: "t4", nota_media: 9.1, taxa_frequencia: 91 },
    { id: "a_26", nome: "ZILMARIA DOS S. T. ", matricula: "2026-MAT-026", email: "zilmaria.dos.s.t.@hemera.io", turma_id: "t4", nota_media: 9.3, taxa_frequencia: 83 },
    { id: "a_27", nome: "VITORIA", matricula: "2026-MAT-027", email: "vitoria@hemera.io", turma_id: "t4", nota_media: 8.0, taxa_frequencia: 94 },
    { id: "a_28", nome: "EDUARDO DE SOUZA SANTOS", matricula: "2026-MAT-028", email: "eduardo.de.souza.santos@hemera.io", turma_id: "t4", nota_media: 5.8, taxa_frequencia: 93 },
    { id: "a_29", nome: "OTAVIO DE SOUZA", matricula: "2026-MAT-029", email: "otavio.de.souza@hemera.io", turma_id: "t4", nota_media: 6.5, taxa_frequencia: 81 },
    { id: "a_30", nome: "DANIELLY DOS ANJOS SOUZA", matricula: "2026-MAT-030", email: "danielly.dos.anjos.souza@hemera.io", turma_id: "t4", nota_media: 9.7, taxa_frequencia: 99 },
    { id: "a_91", nome: "MICAEL CAMBUI DE SOUZA", matricula: "2026-MAT-091", email: "micael.cambui.de.souza@hemera.io", turma_id: "t4", nota_media: 6.1, taxa_frequencia: 87 },
    { id: "a_160", nome: "CAMILA NOVARS DOS SANTOS", matricula: "2026-MAT-160", email: "camila.novars.dos.santos@hemera.io", turma_id: "t4", nota_media: 6.9, taxa_frequencia: 80 },
    { id: "a_161", nome: "BRENO MENDES DE SOUZA", matricula: "2026-MAT-161", email: "breno.mendes.de.souza@hemera.io", turma_id: "t4", nota_media: 7.2, taxa_frequencia: 93 },
    { id: "a_162", nome: "ELOISA ALVES", matricula: "2026-MAT-162", email: "eloisa.alves@hemera.io", turma_id: "t4", nota_media: 8.3, taxa_frequencia: 86 },
    { id: "a_163", nome: "NILANE AMORIN CIRINO", matricula: "2026-MAT-163", email: "nilane.amorin.cirino@hemera.io", turma_id: "t4", nota_media: 6.9, taxa_frequencia: 96 },
  ],
  t5: [
    { id: "a_92", nome: "ADSON ARAUJO ALVES", matricula: "01", email: "adson.araujo.alves@hemera.io", turma_id: "t5", nota_media: 9.6, taxa_frequencia: 77 },
    { id: "a_93", nome: "ANA CLARA ARAUJO BARROS", matricula: "02", email: "ana.clara.araujo.barros@hemera.io", turma_id: "t5", nota_media: 6.6, taxa_frequencia: 99 },
    { id: "a_94", nome: "ANNA VITORIA FIDELES DE SOUZA", matricula: "03", email: "anna.vitoria.fideles.de.souza@hemera.io", turma_id: "t5", nota_media: 8.1, taxa_frequencia: 78 },
    { id: "a_95", nome: "ARYEL MATHEUS OLIVEIRA LOPES", matricula: "04", email: "aryel.matheus.oliveira.lopes@hemera.io", turma_id: "t5", nota_media: 9.5, taxa_frequencia: 96 },
    { id: "a_96", nome: "BISMARK ANJOS DOS SANTOS", matricula: "05", email: "bismark.anjos.dos.santos@hemera.io", turma_id: "t5", nota_media: 8.6, taxa_frequencia: 78 },
    { id: "a_97", nome: "DAFINE SOFIA RODRIGUES DE SOUZA", matricula: "07", email: "dafine.sofia.rodrigues.de.souza@hemera.io", turma_id: "t5", nota_media: 8.6, taxa_frequencia: 84 },
    { id: "a_98", nome: "DEIVISON RUFINO DE SOUZA", matricula: "08", email: "deivison.rufino.de.souza@hemera.io", turma_id: "t5", nota_media: 9.8, taxa_frequencia: 92 },
    { id: "a_99", nome: "ELLEN KAILANE ARAUJO DOS SANTOS", matricula: "09", email: "ellen.kailane.araujo.dos.santos@hemera.io", turma_id: "t5", nota_media: 7.1, taxa_frequencia: 100 },
    { id: "a_100", nome: "EMILLY OLIVEIRA BRAND\u00c3O", matricula: "10", email: "emilly.oliveira.brandao@hemera.io", turma_id: "t5", nota_media: 7.7, taxa_frequencia: 75 },
    { id: "a_101", nome: "ERIC OLIVEIRA GUIMAR\u00c3ES", matricula: "11", email: "eric.oliveira.guimaraes@hemera.io", turma_id: "t5", nota_media: 6.6, taxa_frequencia: 74 },
    { id: "a_102", nome: "ERICK RIAN DE OLIVEIRA FERREIRA", matricula: "12", email: "erick.rian.de.oliveira.ferreira@hemera.io", turma_id: "t5", nota_media: 7.0, taxa_frequencia: 90 },
    { id: "a_103", nome: "ENZO GABRIEL MENDES SANTANA", matricula: "05", email: "enzo.gabriel.mendes.santana@hemera.io", turma_id: "t5", nota_media: 7.9, taxa_frequencia: 90 },
    { id: "a_104", nome: "FRANCINY ANJOS VIEIRA", matricula: "13", email: "franciny.anjos.vieira@hemera.io", turma_id: "t5", nota_media: 6.4, taxa_frequencia: 74 },
    { id: "a_105", nome: "IAGO MATHEUS BARBOSA SILVA", matricula: "14", email: "iago.matheus.barbosa.silva@hemera.io", turma_id: "t5", nota_media: 8.5, taxa_frequencia: 73 },
    { id: "a_106", nome: "JOANA RAISSA SILVA DE ARA\u00daJO", matricula: "16", email: "joana.raissa.silva.de.araujo@hemera.io", turma_id: "t5", nota_media: 6.5, taxa_frequencia: 100 },
    { id: "a_107", nome: "JULIA DE SOUZA SANTOS", matricula: "18", email: "julia.de.souza.santos@hemera.io", turma_id: "t5", nota_media: 5.6, taxa_frequencia: 82 },
    { id: "a_108", nome: "KELLY NAIANE DE NOVAIS ANJOS", matricula: "2026-MAT-108", email: "kelly.naiane.de.novais.anjos@hemera.io", turma_id: "t5", nota_media: 5.8, taxa_frequencia: 79 },
    { id: "a_109", nome: "LARA LORRANE ROCHA FERREIRA", matricula: "20", email: "lara.lorrane.rocha.ferreira@hemera.io", turma_id: "t5", nota_media: 6.7, taxa_frequencia: 87 },
    { id: "a_110", nome: "LUNNA RIHANNA ALVES SANTOS", matricula: "21", email: "lunna.rihanna.alves.santos@hemera.io", turma_id: "t5", nota_media: 6.4, taxa_frequencia: 76 },
    { id: "a_111", nome: "MAINARA DE SOUZA OLIVEIRA", matricula: "22", email: "mainara.de.souza.oliveira@hemera.io", turma_id: "t5", nota_media: 8.6, taxa_frequencia: 100 },
    { id: "a_112", nome: "MARINA DA SILVA FERREIRA", matricula: "24", email: "marina.da.silva.ferreira@hemera.io", turma_id: "t5", nota_media: 8.0, taxa_frequencia: 87 },
    { id: "a_113", nome: "MATHEUS SOUZA DOS SANTOS", matricula: "26", email: "matheus.souza.dos.santos@hemera.io", turma_id: "t5", nota_media: 6.5, taxa_frequencia: 87 },
    { id: "a_114", nome: "MIRELE SILVA BRAND\u00c3O", matricula: "27", email: "mirele.silva.brandao@hemera.io", turma_id: "t5", nota_media: 9.0, taxa_frequencia: 78 },
    { id: "a_115", nome: "NATALIA MENDES", matricula: "28", email: "natalia.mendes@hemera.io", turma_id: "t5", nota_media: 5.9, taxa_frequencia: 93 },
    { id: "a_116", nome: "RAQUEL RODRIGUES ALVES", matricula: "29", email: "raquel.rodrigues.alves@hemera.io", turma_id: "t5", nota_media: 7.4, taxa_frequencia: 85 },
    { id: "a_117", nome: "SAMILLY SOUZA LEITE", matricula: "31", email: "samilly.souza.leite@hemera.io", turma_id: "t5", nota_media: 7.3, taxa_frequencia: 99 },
    { id: "a_118", nome: "SHEILA SILVIA DE OLIVEIRA", matricula: "33", email: "sheila.silvia.de.oliveira@hemera.io", turma_id: "t5", nota_media: 8.6, taxa_frequencia: 93 },
    { id: "a_119", nome: "VIT\u00d3RIA EDUARDA BARROS ALVES", matricula: "34", email: "vitoria.eduarda.barros.alves@hemera.io", turma_id: "t5", nota_media: 8.3, taxa_frequencia: 92 },
    { id: "a_120", nome: "WELLINGTON PAULO SANTOS BARRETO", matricula: "35", email: "wellington.paulo.santos.barreto@hemera.io", turma_id: "t5", nota_media: 5.9, taxa_frequencia: 84 },
    { id: "a_121", nome: "NATIELE MENDES DE JESUS", matricula: "2026-MAT-121", email: "natiele.mendes.de.jesus@hemera.io", turma_id: "t5", nota_media: 8.6, taxa_frequencia: 97 },
    { id: "a_122", nome: "CARLOS EDUARDO JESUS DA SILVA", matricula: "06", email: "carlos.eduardo.jesus.da.silva@hemera.io", turma_id: "t5", nota_media: 9.2, taxa_frequencia: 79 },
    { id: "a_123", nome: "ISABELLA JESUS NOVAIS DA SILVA", matricula: "15", email: "isabella.jesus.novais.da.silva@hemera.io", turma_id: "t5", nota_media: 6.3, taxa_frequencia: 89 },
  ],
  t6: [
    { id: "a_78", nome: "Fabr\u00edcio Reis de Oliveira", matricula: "03", email: "fabricio.reis.de.oliveira@hemera.io", turma_id: "t6", nota_media: 8.1, taxa_frequencia: 76 },
    { id: "a_79", nome: "Gutierry Oliveira Souza", matricula: "05", email: "gutierry.oliveira.souza@hemera.io", turma_id: "t6", nota_media: 7.1, taxa_frequencia: 77 },
    { id: "a_80", nome: "Igor Nunes da Silva", matricula: "06", email: "igor.nunes.da.silva@hemera.io", turma_id: "t6", nota_media: 7.8, taxa_frequencia: 96 },
    { id: "a_81", nome: "Ismael Gomes Batista", matricula: "07", email: "ismael.gomes.batista@hemera.io", turma_id: "t6", nota_media: 9.5, taxa_frequencia: 72 },
    { id: "a_82", nome: "Jo\u00e3o Miguel Santos Araujo", matricula: "08", email: "joao.miguel.santos.araujo@hemera.io", turma_id: "t6", nota_media: 8.1, taxa_frequencia: 87 },
    { id: "a_83", nome: "Joaquim Araujo de Carvalho", matricula: "09", email: "joaquim.araujo.de.carvalho@hemera.io", turma_id: "t6", nota_media: 5.6, taxa_frequencia: 83 },
    { id: "a_84", nome: "Karina Almeida Carvalho", matricula: "10", email: "karina.almeida.carvalho@hemera.io", turma_id: "t6", nota_media: 9.3, taxa_frequencia: 98 },
    { id: "a_85", nome: "Lucas Manoel Nunes", matricula: "12", email: "lucas.manoel.nunes@hemera.io", turma_id: "t6", nota_media: 9.0, taxa_frequencia: 79 },
    { id: "a_86", nome: "Maria Eduarda Marques Araujo", matricula: "13", email: "maria.eduarda.marques.araujo@hemera.io", turma_id: "t6", nota_media: 5.7, taxa_frequencia: 100 },
    { id: "a_87", nome: "Rafael Silva Teixeira", matricula: "14", email: "rafael.silva.teixeira@hemera.io", turma_id: "t6", nota_media: 7.9, taxa_frequencia: 74 },
    { id: "a_88", nome: "Ra\u00ed Pereira da Rocha", matricula: "15", email: "rai.pereira.da.rocha@hemera.io", turma_id: "t6", nota_media: 5.9, taxa_frequencia: 87 },
    { id: "a_89", nome: "Vitor Gabriel Santos Silva", matricula: "17", email: "vitor.gabriel.santos.silva@hemera.io", turma_id: "t6", nota_media: 9.0, taxa_frequencia: 96 },
    { id: "a_90", nome: "Vit\u00f3ria Rosa de Oliveira", matricula: "18", email: "vitoria.rosa.de.oliveira@hemera.io", turma_id: "t6", nota_media: 7.8, taxa_frequencia: 76 },
  ],
  t7: [
    { id: "a_9", nome: "DHEIVERSON JESUS DOS ANJOS", matricula: "03", email: "dheiverson.jesus.dos.anjos@hemera.io", turma_id: "t7", nota_media: 5.6, taxa_frequencia: 78 },
    { id: "a_10", nome: "FRANCISCA STEFANY SANTOS ARAUJO", matricula: "06", email: "francisca.stefany.santos.araujo@hemera.io", turma_id: "t7", nota_media: 8.6, taxa_frequencia: 94 },
    { id: "a_11", nome: "GABRIEL ATHAYDE ARAUJO SILVA", matricula: "07", email: "gabriel.athayde.araujo.silva@hemera.io", turma_id: "t7", nota_media: 7.8, taxa_frequencia: 79 },
    { id: "a_12", nome: "GABRIEL VINICIUS MARIANO SANTIAGO", matricula: "08", email: "gabriel.vinicius.mariano.santiago@hemera.io", turma_id: "t7", nota_media: 7.4, taxa_frequencia: 80 },
    { id: "a_13", nome: "GABRIELLY SOUZA SANTOS", matricula: "09", email: "gabrielly.souza.santos@hemera.io", turma_id: "t7", nota_media: 9.0, taxa_frequencia: 72 },
    { id: "a_14", nome: "IN\u00c1CIO SILVA OLIVEIRA", matricula: "10", email: "inacio.silva.oliveira@hemera.io", turma_id: "t7", nota_media: 8.8, taxa_frequencia: 77 },
    { id: "a_15", nome: "JHONATA FRAN\u00c7A DA SILVA PONTES", matricula: "12", email: "jhonata.franca.da.silva.pontes@hemera.io", turma_id: "t7", nota_media: 8.5, taxa_frequencia: 82 },
    { id: "a_16", nome: "LETICIA SANTOS DE JESUS ", matricula: "13", email: "leticia.santos.de.jesus.@hemera.io", turma_id: "t7", nota_media: 6.7, taxa_frequencia: 78 },
    { id: "a_17", nome: "MARIANE SILVA SOUZA", matricula: "2026-MAT-017", email: "mariane.silva.souza@hemera.io", turma_id: "t7", nota_media: 9.6, taxa_frequencia: 82 },
    { id: "a_18", nome: "MARIA CLARA DE OLIVEIRA", matricula: "16", email: "maria.clara.de.oliveira@hemera.io", turma_id: "t7", nota_media: 5.9, taxa_frequencia: 84 },
    { id: "a_19", nome: "MARIA EDUARDA PONTES MUNIZ DA SILVA", matricula: "18", email: "maria.eduarda.pontes.muniz.da.silva@hemera.io", turma_id: "t7", nota_media: 5.9, taxa_frequencia: 99 },
    { id: "a_20", nome: "PEDRO CAUAN ALVES LIMA", matricula: "19", email: "pedro.cauan.alves.lima@hemera.io", turma_id: "t7", nota_media: 7.0, taxa_frequencia: 80 },
    { id: "a_21", nome: "PEDRO HENRIQUE SANTOS MACHADO", matricula: "20", email: "pedro.henrique.santos.machado@hemera.io", turma_id: "t7", nota_media: 9.0, taxa_frequencia: 95 },
  ],
  t8: [
    { id: "a_1", nome: "TATIANE MARTINS ARAUJO", matricula: "2026-MAT-001", email: "tatiane.martins.araujo@hemera.io", turma_id: "t8", nota_media: 8.2, taxa_frequencia: 72 },
    { id: "a_2", nome: "RAY JOS\u00c9 DA CONCEI\u00c7\u00c3O SANTOS", matricula: "2026-MAT-002", email: "ray.jose.da.conceicao.santos@hemera.io", turma_id: "t8", nota_media: 8.7, taxa_frequencia: 79 },
    { id: "a_3", nome: "ELLEN ENEDINA TELES FERNANDES", matricula: "2026-MAT-003", email: "ellen.enedina.teles.fernandes@hemera.io", turma_id: "t8", nota_media: 6.5, taxa_frequencia: 95 },
    { id: "a_4", nome: "TAIN\u00c1 MENDES DE SOUZA", matricula: "2026-MAT-004", email: "taina.mendes.de.souza@hemera.io", turma_id: "t8", nota_media: 5.9, taxa_frequencia: 95 },
    { id: "a_5", nome: "RICKELME SOUZA SILVA", matricula: "2026-MAT-005", email: "rickelme.souza.silva@hemera.io", turma_id: "t8", nota_media: 9.3, taxa_frequencia: 74 },
    { id: "a_6", nome: "GABRIELA MARTINS SOUZA", matricula: "2026-MAT-006", email: "gabriela.martins.souza@hemera.io", turma_id: "t8", nota_media: 8.0, taxa_frequencia: 73 },
    { id: "a_7", nome: "ANDRYA DANIELLY", matricula: "2026-MAT-007", email: "andrya.danielly@hemera.io", turma_id: "t8", nota_media: 5.6, taxa_frequencia: 78 },
    { id: "a_8", nome: "RUBENS ALVES FERREIRA", matricula: "2026-MAT-008", email: "rubens.alves.ferreira@hemera.io", turma_id: "t8", nota_media: 6.5, taxa_frequencia: 91 },
    { id: "a_31", nome: "ACASSIO DA SILVA MARTINS", matricula: "01", email: "acassio.da.silva.martins@hemera.io", turma_id: "t8", nota_media: 6.5, taxa_frequencia: 75 },
    { id: "a_32", nome: "ANDRYA DANIELLY ARAUJO DOS SANTOS", matricula: "03", email: "andrya.danielly.araujo.dos.santos@hemera.io", turma_id: "t8", nota_media: 7.1, taxa_frequencia: 86 },
    { id: "a_33", nome: "CLEILSON MEDEIROS DE SOUZA", matricula: "05", email: "cleilson.medeiros.de.souza@hemera.io", turma_id: "t8", nota_media: 8.2, taxa_frequencia: 83 },
    { id: "a_34", nome: "PEDRO HENRIQUE FERREIRA GOMES", matricula: "2026-MAT-034", email: "pedro.henrique.ferreira.gomes@hemera.io", turma_id: "t8", nota_media: 6.2, taxa_frequencia: 83 },
    { id: "a_35", nome: "ELLEN ENEDINA TELES FERNANDES", matricula: "06", email: "ellen.enedina.teles.fernandes@hemera.io", turma_id: "t8", nota_media: 6.4, taxa_frequencia: 80 },
    { id: "a_36", nome: "ELVIS ALENCAR DOS SANTOS SILVA", matricula: "07", email: "elvis.alencar.dos.santos.silva@hemera.io", turma_id: "t8", nota_media: 8.5, taxa_frequencia: 93 },
    { id: "a_37", nome: "RAFAELLA DE SOUZA SANTOS", matricula: "2026-MAT-037", email: "rafaella.de.souza.santos@hemera.io", turma_id: "t8", nota_media: 8.3, taxa_frequencia: 91 },
    { id: "a_38", nome: "JOVANA ALVES DOS SANTOS", matricula: "2026-MAT-038", email: "jovana.alves.dos.santos@hemera.io", turma_id: "t8", nota_media: 8.2, taxa_frequencia: 89 },
    { id: "a_39", nome: "RAILA SOUZA AMORIM", matricula: "2026-MAT-039", email: "raila.souza.amorim@hemera.io", turma_id: "t8", nota_media: 8.6, taxa_frequencia: 77 },
  ],
  t9: [
    { id: "a_40", nome: "ALAN NOVAES DA SILVA", matricula: "01", email: "alan.novaes.da.silva@hemera.io", turma_id: "t9", nota_media: 7.5, taxa_frequencia: 80 },
    { id: "a_41", nome: "AMANDA GREGORIO ALVES", matricula: "02", email: "amanda.gregorio.alves@hemera.io", turma_id: "t9", nota_media: 9.8, taxa_frequencia: 92 },
    { id: "a_42", nome: "ANALY JESUS DOS SANTOS", matricula: "04", email: "analy.jesus.dos.santos@hemera.io", turma_id: "t9", nota_media: 8.5, taxa_frequencia: 79 },
    { id: "a_43", nome: "ANA JULIA DORADO DE JESUS", matricula: "03", email: "ana.julia.dorado.de.jesus@hemera.io", turma_id: "t9", nota_media: 8.4, taxa_frequencia: 98 },
    { id: "a_44", nome: "ARYEL CAIQUE SANTOS MENDES", matricula: "05", email: "aryel.caique.santos.mendes@hemera.io", turma_id: "t9", nota_media: 8.8, taxa_frequencia: 73 },
    { id: "a_45", nome: "B\u00c1RBARA PEREIRA DE OLIVEIRA ", matricula: "06", email: "barbara.pereira.de.oliveira.@hemera.io", turma_id: "t9", nota_media: 6.5, taxa_frequencia: 73 },
    { id: "a_46", nome: "BENJAMIM SANTANA RODRIGUES", matricula: "07", email: "benjamim.santana.rodrigues@hemera.io", turma_id: "t9", nota_media: 9.0, taxa_frequencia: 84 },
    { id: "a_47", nome: "CAIO GOIS SOUZA", matricula: "08", email: "caio.gois.souza@hemera.io", turma_id: "t9", nota_media: 6.7, taxa_frequencia: 78 },
    { id: "a_48", nome: "CARLOS DANIEL DINIZ OLIVEIRA", matricula: "09", email: "carlos.daniel.diniz.oliveira@hemera.io", turma_id: "t9", nota_media: 9.4, taxa_frequencia: 90 },
    { id: "a_49", nome: "DAVISON OLIVEIRA SILVA", matricula: "10", email: "davison.oliveira.silva@hemera.io", turma_id: "t9", nota_media: 9.3, taxa_frequencia: 82 },
    { id: "a_50", nome: "EDINEI ARAUJO DE SOUZA", matricula: "11", email: "edinei.araujo.de.souza@hemera.io", turma_id: "t9", nota_media: 6.4, taxa_frequencia: 87 },
    { id: "a_51", nome: "ELOISE SILVA FERREIRA", matricula: "12", email: "eloise.silva.ferreira@hemera.io", turma_id: "t9", nota_media: 7.2, taxa_frequencia: 92 },
    { id: "a_52", nome: "ELVITON JUNIOR PEREIRA DOS ANJOS", matricula: "2026-MAT-052", email: "elviton.junior.pereira.dos.anjos@hemera.io", turma_id: "t9", nota_media: 7.5, taxa_frequencia: 80 },
    { id: "a_53", nome: "FLAVIO PINTO ALVES ", matricula: "13", email: "flavio.pinto.alves.@hemera.io", turma_id: "t9", nota_media: 6.1, taxa_frequencia: 95 },
    { id: "a_54", nome: "GISELE SANTOS ANTUNES", matricula: "14", email: "gisele.santos.antunes@hemera.io", turma_id: "t9", nota_media: 7.9, taxa_frequencia: 80 },
    { id: "a_55", nome: "GLEICE LIMA MENDES", matricula: "15", email: "gleice.lima.mendes@hemera.io", turma_id: "t9", nota_media: 8.7, taxa_frequencia: 85 },
    { id: "a_56", nome: "GUILHERME ARAUJO DE NOVAES", matricula: "09", email: "guilherme.araujo.de.novaes@hemera.io", turma_id: "t9", nota_media: 9.4, taxa_frequencia: 84 },
    { id: "a_57", nome: "GUILHERME PINA DE OLIVEIRA", matricula: "16", email: "guilherme.pina.de.oliveira@hemera.io", turma_id: "t9", nota_media: 7.1, taxa_frequencia: 76 },
    { id: "a_58", nome: "IASMIM SILVA OLIVEIRA", matricula: "17", email: "iasmim.silva.oliveira@hemera.io", turma_id: "t9", nota_media: 7.7, taxa_frequencia: 74 },
    { id: "a_59", nome: "INGRED DREGER DE JESUS", matricula: "18", email: "ingred.dreger.de.jesus@hemera.io", turma_id: "t9", nota_media: 8.7, taxa_frequencia: 99 },
    { id: "a_60", nome: "ITALO MENDES SANTOS", matricula: "19", email: "italo.mendes.santos@hemera.io", turma_id: "t9", nota_media: 6.0, taxa_frequencia: 92 },
    { id: "a_61", nome: "JAIELE MARQUES DE OLIVEIRA ", matricula: "20", email: "jaiele.marques.de.oliveira.@hemera.io", turma_id: "t9", nota_media: 6.2, taxa_frequencia: 93 },
    { id: "a_62", nome: "JULIANE ANJOS MENDES", matricula: "23", email: "juliane.anjos.mendes@hemera.io", turma_id: "t9", nota_media: 7.3, taxa_frequencia: 74 },
    { id: "a_63", nome: "KEILLA OLIVIERA DE SOUZA", matricula: "21", email: "keilla.oliviera.de.souza@hemera.io", turma_id: "t9", nota_media: 7.2, taxa_frequencia: 91 },
    { id: "a_64", nome: "LAIANE SOUZA SANTOS", matricula: "22", email: "laiane.souza.santos@hemera.io", turma_id: "t9", nota_media: 9.8, taxa_frequencia: 88 },
    { id: "a_65", nome: "LEILTON ALVES DA SILVA", matricula: "23", email: "leilton.alves.da.silva@hemera.io", turma_id: "t9", nota_media: 6.6, taxa_frequencia: 89 },
    { id: "a_66", nome: "LILIAN SIMONI MORAES ALVES", matricula: "24", email: "lilian.simoni.moraes.alves@hemera.io", turma_id: "t9", nota_media: 9.2, taxa_frequencia: 72 },
    { id: "a_67", nome: "LUCAS WENDEL MATOS DE OLIVEIRA", matricula: "25", email: "lucas.wendel.matos.de.oliveira@hemera.io", turma_id: "t9", nota_media: 8.4, taxa_frequencia: 75 },
    { id: "a_68", nome: "LUIS DANIEL DIAS BRAND\u00c3O", matricula: "26", email: "luis.daniel.dias.brandao@hemera.io", turma_id: "t9", nota_media: 8.4, taxa_frequencia: 89 },
    { id: "a_69", nome: "MARCOS ANTONIO SOUZA DE JESUS", matricula: "27", email: "marcos.antonio.souza.de.jesus@hemera.io", turma_id: "t9", nota_media: 8.7, taxa_frequencia: 96 },
    { id: "a_70", nome: "MICHEL SANTOS OLIVEIRA", matricula: "29", email: "michel.santos.oliveira@hemera.io", turma_id: "t9", nota_media: 8.3, taxa_frequencia: 75 },
    { id: "a_71", nome: "NATAL\u00cd BARBOSA DOS ANJOS", matricula: "30", email: "natali.barbosa.dos.anjos@hemera.io", turma_id: "t9", nota_media: 6.8, taxa_frequencia: 77 },
    { id: "a_72", nome: "RENATO DA SILVA FRAN\u00c7A", matricula: "31", email: "renato.da.silva.franca@hemera.io", turma_id: "t9", nota_media: 7.5, taxa_frequencia: 95 },
    { id: "a_73", nome: "STEFANE OLIVEIRA DOS ANJOS", matricula: "32", email: "stefane.oliveira.dos.anjos@hemera.io", turma_id: "t9", nota_media: 9.3, taxa_frequencia: 80 },
    { id: "a_74", nome: "THAIN\u00c1 SILVA MELO", matricula: "33", email: "thaina.silva.melo@hemera.io", turma_id: "t9", nota_media: 9.7, taxa_frequencia: 96 },
    { id: "a_75", nome: "THAU\u00c3 VICTOR DE OLIVEIRA SANTOS", matricula: "34", email: "thaua.victor.de.oliveira.santos@hemera.io", turma_id: "t9", nota_media: 6.3, taxa_frequencia: 75 },
    { id: "a_76", nome: "VANDERSON DOS REIS SILVA", matricula: "36", email: "vanderson.dos.reis.silva@hemera.io", turma_id: "t9", nota_media: 9.2, taxa_frequencia: 81 },
    { id: "a_77", nome: "WEVERTON GASPAR DE SOUZA", matricula: "37", email: "weverton.gaspar.de.souza@hemera.io", turma_id: "t9", nota_media: 9.1, taxa_frequencia: 88 },
  ],
};


export const MOCK_LEMBRETES: Lembrete[] = [
  { id: "1", texto: "24-25/11: Culminância Consciência Negra (Aula normal manhã, tarde até 15h).", data_criacao: "2025-11-26 09:21:20.025354", status: "Concluido" },
  { id: "2", texto: "02/12: Apresentação 'Vidas Secas' (3ª ADM/C) e Seminário Afro.", data_criacao: "2025-11-26 09:21:20.035397", status: "Ativo" },
  { id: "3", texto: "05/12: PRAZO FINAL - Resultados III Unidade (3ªs Anos).", data_criacao: "2025-11-26 09:21:20.038913", status: "Ativo" },
  { id: "4", texto: "09-11/12: Jogos Interclasse (Gincana).", data_criacao: "2025-11-26 09:21:20.042922", status: "Ativo" },
  { id: "5", texto: "11/12: Conselho de Classe (3ª ADM) e Entrega Resultados (1ª/2ª).", data_criacao: "2025-11-26 09:21:20.045920", status: "Ativo" },
  { id: "6", texto: "17-18/12: Formaturas.", data_criacao: "2025-11-26 09:21:20.048062", status: "Ativo" }
];

export const MOCK_PLANOS: Record<string, PlanoDeAula[]> = {
  t2: [
    { id: "p1", titulo: "Função Afim e Gráficos", descricao: "Estudo de coeficientes angular e linear.", data_prevista: "2026-05-28", status: "Ministrada", disciplina_id: null, turma_id: "t2", professor_id: "mock-prof-id" },
    { id: "p2", titulo: "Função Quadrática", descricao: "Cálculo de raízes e coordenadas do vértice.", data_prevista: "2026-06-02", status: "Pendente", disciplina_id: null, turma_id: "t2", professor_id: "mock-prof-id" },
    { id: "p3", titulo: "Geometria Espacial: Prismas", descricao: "Definição, áreas e volumes.", data_prevista: "2026-06-05", status: "Agendada", disciplina_id: null, turma_id: "t2", professor_id: "mock-prof-id" }
  ]
};

// LocalStorage Helper Utilities
const getLocal = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seed;
  }
};

const setLocal = <T>(key: string, val: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
};

const SEED_ALUNOS = Object.values(MOCK_ALUNOS).flat();

const MOCK_ATIVIDADES: Atividade[] = [
  { id: "at1", titulo: "Prova de Álgebra (1ª Unidade)", descricao: "Equações de 2º Grau", data_entrega: "2026-05-12", disciplina_id: null, turma_id: "t2", professor_id: "mock-prof-id", valor_maximo: 10 },
  { id: "at2", titulo: "Seminário de Funções (2ª Unidade)", descricao: "Funções afins e quadráticas", data_entrega: "2026-05-25", disciplina_id: null, turma_id: "t2", professor_id: "mock-prof-id", valor_maximo: 10 },
  { id: "at3", titulo: "Simulado Geral", descricao: "Trigonometria e Geometria", data_entrega: "2026-06-05", disciplina_id: null, turma_id: "t2", professor_id: "mock-prof-id", valor_maximo: 10 }
];

export const MOCK_HORARIOS = [
  { id: "h1", turma_id: "t2", dia_semana: 0, hora_inicio: "07:00:00", is_ac: false, turmas: { nome: "1ª A ADM" } },
  { id: "h2", turma_id: "t2", dia_semana: 2, hora_inicio: "09:00:00", is_ac: false, turmas: { nome: "1ª A ADM" } },
  { id: "h3", turma_id: "t2", dia_semana: 4, hora_inicio: "10:00:00", is_ac: true, turmas: { nome: "Atividade Complementar" } }
];

export const pedagogicoService = {

  // ── TURMAS ──────────────────────────────────────────────────────────────────

  async getTurmasProfessor(): Promise<Turma[]> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('professor_id', professorId)
        .order('nome');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Utilizando turmas do seed local.", e);
      return getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
    }
  },

  async getTurmaById(id: string): Promise<Turma | null> {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Buscando turma por ID no seed local.", e);
      const turmas = getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
      return turmas.find(t => t.id === id) || null;
    }
  },

  async criarTurma(nome: string, anoLetivo: number, periodo: string): Promise<Turma> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('turmas')
        .insert([{ nome, ano_letivo: anoLetivo, periodo, professor_id: professorId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao criar turma em Supabase. Salvando localmente.", e);
      const turmas = getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
      const nova: Turma = {
        id: `t_${Date.now()}`,
        nome,
        ano_letivo: anoLetivo,
        periodo,
        professor_id: 'mock-prof-id'
      };
      setLocal('hemera_turmas', [...turmas, nova]);
      return nova;
    }
  },

  async editarTurma(id: string, updates: Partial<Turma>): Promise<Turma> {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao atualizar turma em Supabase. Atualizando localmente.", e);
      const turmas = getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
      let updated: Turma | null = null;
      const next = turmas.map(t => {
        if (t.id === id) {
          updated = { ...t, ...updates };
          return updated;
        }
        return t;
      });
      setLocal('hemera_turmas', next);
      if (!updated) throw new Error("Turma não encontrada localmente");
      return updated;
    }
  },

  async deletarTurma(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('turmas').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Erro ao excluir turma em Supabase. Excluindo localmente.", e);
      const turmas = getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
      setLocal('hemera_turmas', turmas.filter(t => t.id !== id));
    }
  },

  // ── DISCIPLINAS ─────────────────────────────────────────────────────────────

  async getDisciplinasTurma(turmaId: string): Promise<Disciplina[]> {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*')
        .eq('turma_id', turmaId)
        .order('nome');
      if (error) throw error;
      return data || [];
    } catch (e) {
      const disciplinas = getLocal<Disciplina[]>('hemera_disciplinas', []);
      return disciplinas.filter(d => d.turma_id === turmaId);
    }
  },

  async criarDisciplina(nome: string, turmaId: string, cargaHoraria: number): Promise<Disciplina> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([{ nome, turma_id: turmaId, professor_id: professorId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      const disciplinas = getLocal<Disciplina[]>('hemera_disciplinas', []);
      const nova: Disciplina = {
        id: `d_${Date.now()}`,
        nome,
        turma_id: turmaId,
        professor_id: 'mock-prof-id'
      };
      setLocal('hemera_disciplinas', [...disciplinas, nova]);
      return nova;
    }
  },

  async editarDisciplina(id: string, updates: Partial<Disciplina>): Promise<Disciplina> {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao editar disciplina. Editando localmente.", e);
      const disciplinas = getLocal<Disciplina[]>('hemera_disciplinas', []);
      let updated: Disciplina | null = null;
      const next = disciplinas.map(d => {
        if (d.id === id) {
          updated = { ...d, ...updates };
          return updated;
        }
        return d;
      });
      setLocal('hemera_disciplinas', next);
      if (!updated) throw new Error("Disciplina não encontrada localmente");
      return updated;
    }
  },

  async deletarDisciplina(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('disciplinas').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Erro ao deletar disciplina. Deletando localmente.", e);
      const disciplinas = getLocal<Disciplina[]>('hemera_disciplinas', []);
      setLocal('hemera_disciplinas', disciplinas.filter(d => d.id !== id));
    }
  },

  // ── ALUNOS ──────────────────────────────────────────────────────────────────

  async getAlunosTurma(turmaId: string): Promise<Aluno[]> {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('turma_id', turmaId)
        .order('nome');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Utilizando alunos do seed local.", e);
      const alunos = getLocal<Aluno[]>('hemera_alunos', SEED_ALUNOS);
      return alunos.filter(a => a.turma_id === turmaId);
    }
  },

  async criarAluno(nome: string, matricula: string, email: string, turmaId: string): Promise<Aluno> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('alunos')
        .insert([{ nome, matricula, email, turma_id: turmaId, professor_id: professorId, nota_media: 0, taxa_frequencia: 100 }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao criar aluno em Supabase. Criando localmente.", e);
      const alunos = getLocal<Aluno[]>('hemera_alunos', SEED_ALUNOS);
      const novo: Aluno = {
        id: `a_${Date.now()}`,
        nome,
        matricula: matricula || `MAT-${Date.now().toString().slice(-6)}`,
        email: email || `${nome.toLowerCase().replace(/\s+/g, '')}@hemera.io`,
        turma_id: turmaId,
        nota_media: 0,
        taxa_frequencia: 100
      };
      setLocal('hemera_alunos', [...alunos, novo]);
      return novo;
    }
  },

  async editarAluno(id: string, updates: Partial<Aluno>): Promise<Aluno> {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao atualizar aluno em Supabase. Atualizando localmente.", e);
      const alunos = getLocal<Aluno[]>('hemera_alunos', SEED_ALUNOS);
      let updated: Aluno | null = null;
      const next = alunos.map(a => {
        if (a.id === id) {
          updated = { ...a, ...updates };
          return updated;
        }
        return a;
      });
      setLocal('hemera_alunos', next);
      if (!updated) throw new Error("Aluno não encontrado localmente");
      return updated;
    }
  },

  async excluirAluno(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('alunos').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Erro ao excluir aluno em Supabase. Excluindo localmente.", e);
      const alunos = getLocal<Aluno[]>('hemera_alunos', SEED_ALUNOS);
      setLocal('hemera_alunos', alunos.filter(a => a.id !== id));
    }
  },

  // ── FREQUÊNCIA ──────────────────────────────────────────────────────────────

  async registrarFrequencia(
    turmaId: string,
    dataAula: string,
    presencas: Record<string, boolean>,
  ): Promise<void> {
    try {
      const professorId = await getProfessorId();
      const registros = Object.entries(presencas).map(([alunoId, presente]) => ({
        aluno_id: alunoId,
        turma_id: turmaId,
        professor_id: professorId,
        data: dataAula,
        presente,
      }));

      if (registros.length === 0) return;

      const { error } = await supabase
        .from('frequencias')
        .upsert(registros, { onConflict: 'aluno_id, turma_id, data', ignoreDuplicates: false });

      if (error) throw error;

      for (const alunoId of Object.keys(presencas)) {
        const { data: freqs } = await supabase
          .from('frequencias')
          .select('presente')
          .eq('aluno_id', alunoId)
          .eq('turma_id', turmaId);
        if (freqs && freqs.length > 0) {
          const presentes = freqs.filter(f => f.presente).length;
          const taxa = Math.round((presentes / freqs.length) * 100);
          await supabase
            .from('alunos')
            .update({ taxa_frequencia: taxa })
            .eq('id', alunoId);
        }
      }
    } catch (e) {
      console.warn("Registrando frequência no localStorage local.", e);
      const alunos = getLocal<Aluno[]>('hemera_alunos', SEED_ALUNOS);
      const next = alunos.map(al => {
        if (al.turma_id === turmaId && presencas[al.id] !== undefined) {
          const wasPresent = presencas[al.id];
          const newFreq = wasPresent 
            ? Math.min(100, Math.round(al.taxa_frequencia * 0.9 + 10))
            : Math.max(0, Math.round(al.taxa_frequencia * 0.9));
          return { ...al, taxa_frequencia: newFreq };
        }
        return al;
      });
      setLocal('hemera_alunos', next);
    }
  },

  // ── ATIVIDADES ──────────────────────────────────────────────────────────────

  async getAtividadesTurma(turmaId: string): Promise<Atividade[]> {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('turma_id', turmaId)
        .order('data_entrega');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Tabela atividades pode não existir. Usando localStorage.', e);
      const ativs = getLocal<Atividade[]>('hemera_atividades', MOCK_ATIVIDADES);
      return ativs.filter(a => a.turma_id === turmaId);
    }
  },

  async criarAtividade(
    atividade: Omit<Atividade, 'id' | 'professor_id'>
  ): Promise<Atividade> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('atividades')
        .insert([{ ...atividade, professor_id: professorId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao criar atividade. Salvando localmente.", e);
      const ativs = getLocal<Atividade[]>('hemera_atividades', MOCK_ATIVIDADES);
      const nova: Atividade = {
        id: `at_${Date.now()}`,
        ...atividade,
        professor_id: 'mock-prof-id'
      };
      setLocal('hemera_atividades', [...ativs, nova]);
      return nova;
    }
  },

  async deletarAtividade(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('atividades').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Erro ao deletar atividade. Excluindo localmente.", e);
      const ativs = getLocal<Atividade[]>('hemera_atividades', MOCK_ATIVIDADES);
      setLocal('hemera_atividades', ativs.filter(a => a.id !== id));
    }
  },

  async editarAtividade(id: string, updates: Partial<Atividade>): Promise<Atividade> {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Erro ao editar atividade. Atualizando localmente.", e);
      const ativs = getLocal<Atividade[]>('hemera_atividades', MOCK_ATIVIDADES);
      let updated: Atividade | null = null;
      const next = ativs.map(a => {
        if (a.id === id) {
          updated = { ...a, ...updates };
          return updated;
        }
        return a;
      });
      setLocal('hemera_atividades', next);
      if (!updated) throw new Error("Atividade não encontrada");
      return updated;
    }
  },

  // ── NOTAS ───────────────────────────────────────────────────────────────────

  async getNotasTurma(turmaId: string): Promise<Nota[]> {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select(`*, atividade:atividades!inner(turma_id)`)
        .eq('atividade.turma_id', turmaId);
      if (error) throw error;
      const rawNotas = (data as unknown as Nota[]) || [];
      return rawNotas.map((n) => ({
        id: n.id,
        aluno_id: n.aluno_id,
        atividade_id: n.atividade_id,
        valor: n.valor,
        feedback: n.feedback
      }));
    } catch (e) {
      console.warn("Buscando notas do localStorage.", e);
      const notas = getLocal<Nota[]>('hemera_notas', []);
      const ativs = getLocal<Atividade[]>('hemera_atividades', MOCK_ATIVIDADES);
      const myAtivIds = ativs.filter(a => a.turma_id === turmaId).map(a => a.id);
      return notas.filter(n => myAtivIds.includes(n.atividade_id));
    }
  },

  async registrarNota(
    alunoId: string,
    atividadeId: string,
    valor: number,
    feedback = '',
  ): Promise<unknown> {
    try {
      const { data, error } = await supabase
        .from('notas')
        .upsert(
          { aluno_id: alunoId, atividade_id: atividadeId, valor, feedback },
          { onConflict: 'aluno_id, atividade_id' }
        )
        .select();
      if (error) throw error;

      // Recalcula nota_media
      const { data: notas } = await supabase
        .from('notas')
        .select('valor')
        .eq('aluno_id', alunoId);
      if (notas && notas.length > 0) {
        const media = notas.reduce((acc, n) => acc + Number(n.valor), 0) / notas.length;
        await supabase.from('alunos').update({ nota_media: media }).eq('id', alunoId);
      }
      return data;
    } catch (e) {
      console.warn("Salvando nota no localStorage.", e);
      const notas = getLocal<Nota[]>('hemera_notas', []);
      const existingIdx = notas.findIndex(n => n.aluno_id === alunoId && n.atividade_id === atividadeId);
      
      const newNota: Nota = {
        id: existingIdx !== -1 ? notas[existingIdx].id : `n_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        aluno_id: alunoId,
        atividade_id: atividadeId,
        valor,
        feedback: feedback || null
      };

      if (existingIdx !== -1) {
        notas[existingIdx] = newNota;
      } else {
        notas.push(newNota);
      }
      setLocal('hemera_notas', notas);

      // Recalcula média localmente
      const alunos = getLocal<Aluno[]>('hemera_alunos', SEED_ALUNOS);
      const alunoNotas = notas.filter(n => n.aluno_id === alunoId);
      const media = alunoNotas.reduce((acc, curr) => acc + curr.valor, 0) / alunoNotas.length;
      
      const nextAlunos = alunos.map(al => {
        if (al.id === alunoId) {
          return { ...al, nota_media: Number(media.toFixed(1)) };
        }
        return al;
      });
      setLocal('hemera_alunos', nextAlunos);
      return newNota;
    }
  },

  // ── GRADEBOOK ───────────────────────────────────────────────────────────────

  async getGradebookMatrix(turmaId: string) {
    const alunos = await this.getAlunosTurma(turmaId);
    const atividades = await this.getAtividadesTurma(turmaId);
    const notasFlat = await this.getNotasTurma(turmaId);

    const mapaNotas: Record<string, Record<string, number | null>> = {};
    notasFlat.forEach(nota => {
      if (!mapaNotas[nota.aluno_id]) mapaNotas[nota.aluno_id] = {};
      mapaNotas[nota.aluno_id][nota.atividade_id] = nota.valor;
    });

    const tabelaNotas = alunos.map(aluno => {
      let soma = 0;
      let pesos = 0;
      const notasAluno = atividades.map(atividade => {
        const valor = mapaNotas[aluno.id]?.[atividade.id] ?? null;
        if (valor !== null) { soma += Number(valor); pesos += 1; }
        return { atividade_id: atividade.id, valor };
      });
      const media = pesos > 0 ? (soma / pesos).toFixed(1) : '-';
      return { aluno, notas: notasAluno, media };
    });

    return { atividades, tabelaNotas };
  },

  // ── MURAL ───────────────────────────────────────────────────────────────────

  async getPostagensMural(turmaId: string): Promise<PostagemMural[]> {
    try {
      const { data, error } = await supabase
        .from('postagens_mural')
        .select('*')
        .eq('turma_id', turmaId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Tabela postagens_mural pode não existir. Usando local.', e);
      const postagens = getLocal<PostagemMural[]>('hemera_mural', []);
      return postagens.filter(p => p.turma_id === turmaId);
    }
  },

  async criarPostagemMural(
    turmaId: string,
    texto: string,
    arquivoNome?: string,
  ): Promise<PostagemMural> {
    try {
      const autorId = await getProfessorId();
      const { data, error } = await supabase
        .from('postagens_mural')
        .insert([{
          turma_id: turmaId,
          autor_id: autorId,
          texto,
          arquivo_nome: arquivoNome ?? null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Salvando postagem localmente.", e);
      const postagens = getLocal<PostagemMural[]>('hemera_mural', []);
      const nova: PostagemMural = {
        id: `post_${Date.now()}`,
        turma_id: turmaId,
        autor_id: 'mock-prof-id',
        texto,
        arquivo_nome: arquivoNome ?? null,
        created_at: new Date().toISOString()
      };
      setLocal('hemera_mural', [nova, ...postagens]);
      return nova;
    }
  },

  async deletarPostagemMural(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('postagens_mural').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Removendo postagem localmente.", e);
      const postagens = getLocal<PostagemMural[]>('hemera_mural', []);
      setLocal('hemera_mural', postagens.filter(p => p.id !== id));
    }
  },

  // ── DIÁRIO DE CLASSE ────────────────────────────────────────────────────────

  async upsertDiario(planoId: string, diarioRegistro: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('planos_aula')
        .update({ diario_registro: diarioRegistro, status: 'Ministrada' })
        .eq('id', planoId);
      if (error) throw error;
    } catch (e) {
      console.warn("Salvando diario de classe no localStorage.", e);
      const planos = getLocal<PlanoDeAula[]>('hemera_planos_aula', MOCK_PLANOS.t2);
      const nextPlanos = planos.map(p => {
        if (p.id === planoId) {
          return { ...p, status: 'Ministrada', diario_registro: diarioRegistro };
        }
        return p;
      });
      setLocal('hemera_planos_aula', nextPlanos);

      const diarios = getLocal<Record<string, string>>('hemera_diario_registros', {});
      diarios[planoId] = diarioRegistro;
      setLocal('hemera_diario_registros', diarios);
    }
  },

  // ── PLANOS DE AULA ──────────────────────────────────────────────────────────

  async getPlanosDeAula(turmaId: string): Promise<PlanoDeAula[]> {
    try {
      const { data, error } = await supabase
        .from('planos_aula')
        .select('*')
        .eq('turma_id', turmaId)
        .order('data_prevista', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Tabela planos_aula pode não existir ou está vazia. Usando fallbacks.', e);
      const planos = getLocal<PlanoDeAula[]>('hemera_planos_aula', MOCK_PLANOS.t2);
      return planos.filter(p => p.turma_id === turmaId);
    }
  },

  async criarPlanoDeAula(
    plano: Omit<PlanoDeAula, 'id' | 'created_at'>
  ): Promise<PlanoDeAula> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('planos_aula')
        .insert([{ ...plano, professor_id: professorId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Salvando plano de aula localmente.", e);
      const planos = getLocal<PlanoDeAula[]>('hemera_planos_aula', MOCK_PLANOS.t2);
      const novo: PlanoDeAula = {
        id: `p_${Date.now()}`,
        ...plano,
        status: plano.status || 'Pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setLocal('hemera_planos_aula', [...planos, novo]);
      return novo;
    }
  },

  async atualizarPlano(id: string, updates: Partial<PlanoDeAula>): Promise<PlanoDeAula> {
    try {
      const { data, error } = await supabase
        .from('planos_aula')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Atualizando plano de aula localmente.", e);
      const planos = getLocal<PlanoDeAula[]>('hemera_planos_aula', MOCK_PLANOS.t2);
      let updated: PlanoDeAula | null = null;
      const next = planos.map(p => {
        if (p.id === id) {
          updated = { ...p, ...updates };
          return updated!;
        }
        return p;
      });
      setLocal('hemera_planos_aula', next);
      if (!updated) throw new Error("Plano não encontrado");
      return updated;
    }
  },

  async deletarPlano(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('planos_aula').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Excluindo plano de aula localmente.", e);
      const planos = getLocal<PlanoDeAula[]>('hemera_planos_aula', MOCK_PLANOS.t2);
      setLocal('hemera_planos_aula', planos.filter(p => p.id !== id));
    }
  },

  // ── HORÁRIOS ─────────────────────────────────────────────────────────────────

  async getHorariosProfessor(): Promise<Horario[]> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('horarios')
        .select('id, turma_id, dia_semana, hora_inicio, is_ac, turmas(nome)')
        .eq('professor_id', professorId);
      if (error) throw error;
      return (data as unknown as Horario[]) || [];
    } catch (e) {
      console.warn("Buscando horarios do localStorage.", e);
      return getLocal<Horario[]>('hemera_horarios', MOCK_HORARIOS);
    }
  },

  async criarHorario(turmaId: string, diaSemana: number, horaInicio: string, isAc: boolean): Promise<Horario> {
    try {
      const professorId = await getProfessorId();
      const { data, error } = await supabase
        .from('horarios')
        .insert([{ turma_id: turmaId, dia_semana: diaSemana, hora_inicio: horaInicio, is_ac: isAc, professor_id: professorId }])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Horario;
    } catch (e) {
      console.warn("Salvando horário localmente.", e);
      const horarios = getLocal<Horario[]>('hemera_horarios', MOCK_HORARIOS);
      const turmas = getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
      const matchingTurma = turmas.find(t => t.id === turmaId);
      const novo: Horario = {
        id: `h_${Date.now()}`,
        turma_id: turmaId,
        dia_semana: diaSemana,
        hora_inicio: horaInicio.includes(":") ? (horaInicio.split(":").length === 2 ? `${horaInicio}:00` : horaInicio) : `${horaInicio}:00:00`,
        is_ac: isAc,
        turmas: { nome: matchingTurma ? matchingTurma.nome : (isAc ? "Atividade Complementar" : "Apoio") }
      };
      setLocal('hemera_horarios', [...horarios, novo]);
      return novo;
    }
  },

  async editarHorario(id: string, updates: Partial<Horario>): Promise<Horario | null> {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Horario;
    } catch (e) {
      console.warn("Editando horário localmente.", e);
      const horarios = getLocal<Horario[]>('hemera_horarios', MOCK_HORARIOS);
      const turmas = getLocal<Turma[]>('hemera_turmas', MOCK_TURMAS);
      let updated: Horario | null = null;
      const next = horarios.map(h => {
        if (h.id === id) {
          const matchingTurma = turmas.find(t => t.id === (updates.turma_id || h.turma_id));
          updated = { 
            ...h, 
            ...updates,
            turmas: { nome: matchingTurma ? matchingTurma.nome : (updates.is_ac ? "Atividade Complementar" : h.turmas?.nome || "") }
          };
          return updated;
        }
        return h;
      });
      setLocal('hemera_horarios', next);
      return updated;
    }
  },

  async excluirHorario(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('horarios').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Deletando horário localmente.", e);
      const horarios = getLocal<Horario[]>('hemera_horarios', MOCK_HORARIOS);
      setLocal('hemera_horarios', horarios.filter(h => h.id !== id));
    }
  },

  // ── IA (Edge Functions) ──────────────────────────────────────────────────────

  async gerarPlanoIA(tema: string, turmaNome: string): Promise<Partial<PlanoDeAula>> {
    const { data, error } = await supabase.functions.invoke('gerar-plano-ia', {
      body: { tema, turmaNome },
    });
    if (error) throw new Error('Falha ao gerar plano com IA: ' + error.message);
    return data.plano;
  },

  async gerarProvaIA(turmaId: string, instrucoes: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('gerar-prova-ia', {
      body: { turmaId, instrucoes },
    });
    if (error) throw new Error('Falha ao gerar prova com IA: ' + error.message);
    return data.prova_markdown;
  },

  async getLembretes(): Promise<Lembrete[]> {
    try {
      const { data, error } = await supabase
        .from('lembretes')
        .select('*')
        .order('data_criacao', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return MOCK_LEMBRETES;
      return data as Lembrete[];
    } catch (e) {
      console.warn("Utilizando lembretes do seed local.", e);
      return MOCK_LEMBRETES;
    }
  }
};

