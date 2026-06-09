import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Upload, 
  Heart, 
  MessageCircle, 
  Pin, 
  Plus, 
  Search, 
  Share2, 
  School, 
  ChevronDown, 
  Bell, 
  Trash2,
  FileCode,
  FileImage,
  FileArchive,
  Megaphone,
  BookOpen,
  ClipboardCheck,
  Video,
  PlayCircle,
  Award,
  HelpCircle,
  ChevronUp,
  GraduationCap
} from "lucide-react";

// --- INTERFACES ---
interface School {
  id: string;
  name: string;
}

interface ClassRoom {
  id: string;
  schoolId: string;
  name: string;
}

interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  author: string;
  authorRole: 'professor' | 'aluno' | 'diretor';
  createdAt: string;
  pinned: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorRole: 'professor' | 'aluno';
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  classId: string;
  author: string;
  authorRole: 'professor' | 'aluno';
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  comments: Comment[];
  attachment?: {
    name: string;
    type: 'pdf' | 'doc' | 'image' | 'zip';
    size: string;
  };
}

interface SchoolFile {
  id: string;
  classId: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'zip';
  uploadedBy: string;
  uploadedByRole: 'professor' | 'aluno';
  size: string;
  category: 'Material de Aula' | 'Atividades' | 'Leitura Complementar';
  uploadedAt: string;
}

interface SystemNotification {
  id: string;
  content: string;
  createdAt: string;
  type: 'like' | 'comment' | 'announcement' | 'file' | 'grade' | 'submission';
}

// --- MOODLE LMS INTERFACES ---
interface MoodleItem {
  id: string;
  title: string;
  type: 'material' | 'assignment' | 'video' | 'quiz' | 'forum';
  description?: string;
  url?: string;
  dueDate?: string;
  maxScore?: number;
  questions?: { id: number; q: string; options: string[]; correct: string }[];
  forumPosts?: { author: string; content: string; date: string }[];
}

interface MoodleTopic {
  id: string;
  classId: string;
  title: string;
  description: string;
  items: MoodleItem[];
}

interface StudentSubmission {
  id: string;
  studentName: string;
  assignmentId: string;
  textSubmission: string;
  fileSubmissionName?: string;
  submittedAt: string;
  status: 'Entregue' | 'Avaliado';
  score?: number;
  feedback?: string;
}

// --- MOCK DATA ---
const schoolsMock: School[] = [
  { id: "school-alpha", name: "Colégio Estadual Hemera Alpha" },
  { id: "school-beta", name: "Instituto Tecnológico Hemera Beta" }
];

const classesMock: ClassRoom[] = [
  { id: "class-alpha-9a", schoolId: "school-alpha", name: "9º Ano A - Ciências e Matemática" },
  { id: "class-alpha-8b", schoolId: "school-alpha", name: "8º Ano B - Humanas e Artes" },
  { id: "class-beta-eng1", schoolId: "school-beta", name: "Engenharia de Software 1A" },
  { id: "class-beta-comp2", schoolId: "school-beta", name: "Ciência da Computação 2B" }
];

const initialAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    classId: "class-alpha-9a",
    title: "Entrega do Trabalho de Física",
    content: "Lembrando que o relatório prático sobre termodinâmica deve ser entregue até a próxima sexta-feira no laboratório físico ou via upload de arquivos.",
    author: "Prof. Alberto Santos",
    authorRole: "professor",
    createdAt: "2026-05-27T10:00:00.000Z",
    pinned: true
  },
  {
    id: "ann-2",
    classId: "class-alpha-9a",
    title: "Reunião de Líderes de Turma",
    content: "Amanhã na hora do intervalo teremos a primeira reunião oficial de representantes com a coordenação pedagógica na sala multimídia.",
    author: "Diretora Marina Silva",
    authorRole: "diretor",
    createdAt: "2026-05-26T14:30:00.000Z",
    pinned: false
  },
  {
    id: "ann-3",
    classId: "class-alpha-8b",
    title: "Visita Guiada ao Museu",
    content: "O formulário de autorização para a visita pedagógica ao Museu de História Natural já está disponível na biblioteca. Entregar assinado pelos responsáveis até segunda-feira.",
    author: "Profa. Carla Lima",
    authorRole: "professor",
    createdAt: "2026-05-27T08:15:00.000Z",
    pinned: true
  },
  {
    id: "ann-4",
    classId: "class-beta-eng1",
    title: "Instruções do Hackathon Hemera",
    content: "Estão abertas as inscrições para o Hackathon Interno! O tema deste ano será Soluções Ambientais Inteligentes em Computação de Borda.",
    author: "Coordenador Marcos Souza",
    authorRole: "professor",
    createdAt: "2026-05-28T09:00:00.000Z",
    pinned: true
  }
];

const initialPosts: Post[] = [
  {
    id: "post-1",
    classId: "class-alpha-9a",
    author: "Gustavo Nogueira",
    authorRole: "aluno",
    content: "Pessoal, alguém conseguiu resolver o exercício 5 da lista de álgebra? Travei na parte da matriz de rotação bidimensional. Se alguém puder ajudar ou mandar uma foto do raciocínio!",
    createdAt: "2026-05-27T22:30:00.000Z",
    likes: 4,
    likedByMe: false,
    comments: [
      {
        id: "com-1",
        author: "Fernanda Costa",
        authorRole: "aluno",
        content: "Eu consegui resolver usando a identidade trigonométrica fundamental! Basicamente você simplifica a matriz antes de multiplicar.",
        createdAt: "2026-05-27T22:45:00.000Z"
      },
      {
        id: "com-2",
        author: "Prof. Alberto Santos",
        authorRole: "professor",
        content: "Dica valiosa, Fernanda! Gustavo, lembre-se também de que o determinante da matriz de rotação deve ser sempre igual a 1. Isso ajuda a conferir as contas.",
        createdAt: "2026-05-28T08:00:00.000Z"
      }
    ],
    attachment: {
      name: "exercicio-matrizes-dicas.pdf",
      type: "pdf",
      size: "1.2 MB"
    }
  },
  {
    id: "post-2",
    classId: "class-alpha-9a",
    author: "Ana Beatriz",
    authorRole: "aluno",
    content: "Compartilhando com vocês as anotações organizadas que fiz da aula de Biologia Celular sobre mitocôndrias e respiração aeróbica. Espero que ajude nos estudos para a prova!",
    createdAt: "2026-05-26T18:20:00.000Z",
    likes: 9,
    likedByMe: true,
    comments: [
      {
        id: "com-3",
        author: "Rodrigo M.",
        authorRole: "aluno",
        content: "Salva demais! Resumo super colorido e direto ao ponto. Valeu Ana!",
        createdAt: "2026-05-26T19:00:00.000Z"
      }
    ],
    attachment: {
      name: "resumo-respiracao-celular.image",
      type: "image",
      size: "3.4 MB"
    }
  },
  {
    id: "post-3",
    classId: "class-beta-eng1",
    author: "Professor Roberto Cruz",
    authorRole: "professor",
    content: "Subi o repositório base com a arquitetura limpa em TypeScript para o nosso projeto semestral. Certifiquem-se de seguir as regras de lint e criar os testes unitários apropriadamente.",
    createdAt: "2026-05-28T01:10:00.000Z",
    likes: 12,
    likedByMe: false,
    comments: [],
    attachment: {
      name: "projeto-base-arquitetura.zip",
      type: "zip",
      size: "14.5 MB"
    }
  }
];

const initialFiles: SchoolFile[] = [
  {
    id: "file-1",
    classId: "class-alpha-9a",
    name: "cronograma_aulas_fisica_2026.pdf",
    type: "pdf",
    uploadedBy: "Prof. Alberto Santos",
    uploadedByRole: "professor",
    size: "450 KB",
    category: "Material de Aula",
    uploadedAt: "2026-05-01T09:00:00.000Z"
  },
  {
    id: "file-2",
    classId: "class-alpha-9a",
    name: "tabela-periodica-interativa.doc",
    type: "doc",
    uploadedBy: "Prof. Alberto Santos",
    uploadedByRole: "professor",
    size: "2.1 MB",
    category: "Material de Aula",
    uploadedAt: "2026-05-15T11:20:00.000Z"
  },
  {
    id: "file-3",
    classId: "class-alpha-9a",
    name: "modelo-relatorio-ciencias.doc",
    type: "doc",
    uploadedBy: "Fernanda Costa",
    uploadedByRole: "aluno",
    size: "1.1 MB",
    category: "Atividades",
    uploadedAt: "2026-05-25T14:40:00.000Z"
  },
  {
    id: "file-4",
    classId: "class-beta-eng1",
    name: "guia_estilos_typescript.pdf",
    type: "pdf",
    uploadedBy: "Professor Roberto Cruz",
    uploadedByRole: "professor",
    size: "890 KB",
    category: "Leitura Complementar",
    uploadedAt: "2026-05-20T10:00:00.000Z"
  }
];

// --- MOODLE LMS MOCK DATA ---
const initialMoodleTopics: MoodleTopic[] = [
  {
    id: "topic-1",
    classId: "class-alpha-9a",
    title: "Tópico 1: Calorimetria e Leis da Termodinâmica",
    description: "Estudo dos conceitos fundamentais de transferência de calor, calor específico, calor latente e as três leis fundamentais da termodinâmica.",
    items: [
      {
        id: "mi-1",
        title: "Apostila Completa - Termodinâmica Aplicada",
        type: "material",
        description: "Apostila teórica cobrindo dilatação térmica, gases ideais e trocas de calor."
      },
      {
        id: "mi-2",
        title: "Vídeo-aula: A Primeira e Segunda Lei da Termodinâmica",
        type: "video",
        description: "Aula expositiva animada detalhando ciclos de Carnot e eficiência de motores térmicos.",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      {
        id: "mi-3",
        title: "Tarefa 1: Relatório de Calorimetria Experimental",
        type: "assignment",
        description: "Descreva os resultados obtidos no laboratório utilizando o calorímetro de água e meça o calor específico do cobre.",
        dueDate: "15/06/2026",
        maxScore: 10
      },
      {
        id: "mi-4",
        title: "Mini-teste 1: Trocas de Calor e Temperatura",
        type: "quiz",
        description: "Teste rápido de fixação conceitual com 3 questões de múltipla escolha.",
        maxScore: 5,
        questions: [
          { id: 1, q: "Qual a unidade de calor no Sistema Internacional de Unidades (SI)?", options: ["Caloria (cal)", "Joule (J)", "Kelvin (K)", "Celsius (°C)"], correct: "Joule (J)" },
          { id: 2, q: "O calor latente está associado a qual processo termodinâmico?", options: ["Aumento de temperatura", "Mudança de estado físico", "Trabalho isobárico", "Expansão livre de gás"], correct: "Mudança de estado físico" },
          { id: 3, q: "A primeira lei da termodinâmica expressa o princípio de:", options: ["Conservação da massa", "Conservação da energia", "Aumento da entropia", "Equilíbrio químico"], correct: "Conservação da energia" }
        ]
      },
      {
        id: "mi-5",
        title: "Fórum de Discussão: Desafios cotidianos de entropia",
        type: "forum",
        description: "Publique um exemplo prático observado no seu dia a dia onde a desordem do sistema aumente espontaneamente.",
        forumPosts: [
          { author: "Gustavo Nogueira", content: "Acho que um copo de vidro quebrando é um bom exemplo. A energia dissipada não volta de forma organizada de jeito nenhum.", date: "2026-05-28T10:00:00Z" },
          { author: "Ana Beatriz", content: "Verdade Gustavo! A água evaporando da roupa estendida no varal também representa as moléculas se espalhando no ambiente.", date: "2026-05-28T11:30:00Z" }
        ]
      }
    ]
  },
  {
    id: "topic-2",
    classId: "class-alpha-9a",
    title: "Tópico 2: Ondulatória e Óptica Geométrica",
    description: "Introdução à física ondulatória, tipos de ondas, fenômenos ondulatórios e reflexão/refração da luz em espelhos e lentes.",
    items: [
      {
        id: "mi-6",
        title: "Slides da Apresentação: Óptica Geométrica",
        type: "material",
        description: "Slides resumindo a equação dos pontos conjugados de Gauss e formação de imagens."
      },
      {
        id: "mi-7",
        title: "Tarefa 2: Mapa Mental de Fenômenos Ondulatórios",
        type: "assignment",
        description: "Elabore um mapa mental englobando Reflexão, Refração, Difração, Interferência, Polarização e Ressonância.",
        dueDate: "28/06/2026",
        maxScore: 10
      }
    ]
  },
  {
    id: "topic-3",
    classId: "class-beta-eng1",
    title: "Tópico 1: Introdução a Clean Code e SOLID",
    description: "Fundamentos para escrita de código limpo, legibilidade, testes eficientes e aplicação dos 5 princípios SOLID no ecossistema TypeScript.",
    items: [
      {
        id: "mi-8",
        title: "Artigo PDF: SOLID nos Módulos do Hemera OS",
        type: "material",
        description: "Artigo técnico mostrando como separar a lógica do Heimdall (Single Responsibility) e Hermes (Interface Segregation)."
      },
      {
        id: "mi-9",
        title: "Tarefa 1: Refatoração de Código Monolítico",
        type: "assignment",
        description: "Pegue a API mockada fornecida em anexo, desmembre em classes desacopladas e crie testes unitários usando Vitest.",
        dueDate: "20/06/2026",
        maxScore: 10
      }
    ]
  }
];

const initialSubmissions: StudentSubmission[] = [
  {
    id: "sub-1",
    studentName: "Gustavo Nogueira",
    assignmentId: "mi-3",
    textSubmission: "Relatório de Calorimetria: Pesamos 50g de metal de cobre, aquecemos a 100°C e jogamos em 150ml de água fria no calorímetro a 22°C. A temperatura final de equilíbrio foi de 24.1°C. Calculamos o calor específico como sendo 0.385 J/g°C.",
    fileSubmissionName: "gustavo-calorimetria-cobre.pdf",
    submittedAt: "2026-05-28T09:30:00Z",
    status: "Avaliado",
    score: 9.5,
    feedback: "Excelente descrição metodológica Gustavo. Cálculos perfeitos."
  },
  {
    id: "sub-2",
    studentName: "Ana Beatriz",
    assignmentId: "mi-3",
    textSubmission: "Envio a descrição teórica do meu calorímetro caseiro. Obtivemos o calor específico do cobre em torno de 0.402 J/g°C devido a pequenas perdas térmicas no copo de isopor.",
    fileSubmissionName: "anabeatriz-calorimetria.pdf",
    submittedAt: "2026-05-28T14:00:00Z",
    status: "Entregue"
  }
];

export const Polis: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Multi-tenancy State
  const [selectedSchool, setSelectedSchool] = useState<string>("school-alpha");
  const [selectedClass, setSelectedClass] = useState<string>("class-alpha-9a");
  
  // Navigation Tabs (moodle fused inside)
  const [activeTab, setActiveTab] = useState<"mural" | "feed" | "arquivos" | "moodle">("mural");
  
  // Core Data States (Reactive to current filters)
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [files, setFiles] = useState<SchoolFile[]>(initialFiles);
  
  // Moodle States
  const [moodleTopics, setMoodleTopics] = useState<MoodleTopic[]>(initialMoodleTopics);
  const [activeMoodleSubTab, setActiveMoodleSubTab] = useState<"topicos" | "notas" | "participantes">("topicos");
  const [expandedTopic, setExpandedTopic] = useState<string | null>("topic-1");
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(initialSubmissions);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, string>>>({});
  const [quizCompleted, setQuizCompleted] = useState<Record<string, { score: number; maxScore: number }>>({});
  
  // Student Submission form state
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFileName, setSubmissionFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Extensões permitidas
    const allowedExtensions = ["pdf", "zip", "docx", "png"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Formato de Arquivo Inválido",
        description: `Por favor, envie apenas arquivos nos formatos: ${allowedExtensions.join(", ").toUpperCase()}.`,
        variant: "destructive"
      });
      e.target.value = ""; // Limpa o seletor de arquivo no HTML
      setSelectedFile(null);
      return;
    }

    // Tamanho máximo 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo Excede o Limite",
        description: "O tamanho máximo permitido para envios no Moodle é de 10MB.",
        variant: "destructive"
      });
      e.target.value = ""; // Limpa o seletor de arquivo no HTML
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    toast({
      title: "Arquivo Carregado com Sucesso",
      description: `"${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) foi verificado e anexado à submissão.`
    });
  };

  // Teacher Grading form state
  const [activeGradingSubmissionId, setActiveGradingSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(10);
  const [gradingFeedback, setGradingFeedback] = useState("");

  // Discussion state
  const [activeForumId, setActiveForumId] = useState<string | null>(null);
  const [forumInputText, setForumInputText] = useState("");

  // Form states for general board
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnPinned, setNewAnnPinned] = useState(false);
  
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAttachName, setNewPostAttachName] = useState("");
  const [newPostAttachType, setNewPostAttachType] = useState<'pdf' | 'doc' | 'image' | 'zip'>('pdf');
  const [showAttachForm, setShowAttachForm] = useState(false);
  
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  const [searchFileQuery, setSearchFileQuery] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<'pdf' | 'doc' | 'image' | 'zip'>('pdf');
  const [newFileCategory, setNewFileCategory] = useState<'Material de Aula' | 'Atividades' | 'Leitura Complementar'>('Material de Aula');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Real-time notifications simulation state
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "not-1",
      content: "Prof. Alberto Santos postou um aviso fixado no Mural.",
      createdAt: "2026-05-27T10:05:00.000Z",
      type: "announcement"
    },
    {
      id: "not-2",
      content: "Fernanda Costa comentou na sua postagem recente no feed.",
      createdAt: "2026-05-27T22:46:00.000Z",
      type: "comment"
    }
  ]);
  
  // Determine role safely
  const currentUserRole = user?.user_metadata?.role || "aluno";
  const currentUserName = currentUserRole === "professor" ? "Prof. Cláudio Mendonça" : "Ian Santos";

  // Filter classes based on selected school
  const currentClasses = classesMock.filter(c => c.schoolId === selectedSchool);

  // Auto-switch class when school changes to ensure consistency
  useEffect(() => {
    const firstClassOfSchool = classesMock.find(c => c.schoolId === selectedSchool);
    if (firstClassOfSchool) {
      setSelectedClass(firstClassOfSchool.id);
    }
  }, [selectedSchool]);

  // Handler for adding Announcement (Mural) - restricted to professor
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      toast({
        title: "Erro ao publicar",
        description: "Título e Conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      classId: selectedClass,
      title: newAnnTitle,
      content: newAnnContent,
      author: currentUserName,
      authorRole: 'professor',
      createdAt: new Date().toISOString(),
      pinned: newAnnPinned
    };

    setAnnouncements([newAnn, ...announcements]);
    
    // Add simulated real-time notification
    const newNotif: SystemNotification = {
      id: `not-${Date.now()}`,
      content: `${currentUserName} publicou um novo comunicado oficial no Mural: "${newAnnTitle}".`,
      createdAt: new Date().toISOString(),
      type: 'announcement'
    };
    setNotifications([newNotif, ...notifications]);

    // Reset Form
    setNewAnnTitle("");
    setNewAnnContent("");
    setNewAnnPinned(false);

    toast({
      title: "Comunicado Publicado!",
      description: "Seu aviso foi fixado no Mural com sucesso.",
    });
  };

  // Handler for adding Post to Feed
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast({
        title: "Post vazio",
        description: "Digite alguma coisa antes de publicar.",
        variant: "destructive"
      });
      return;
    }

    const hasAttachment = showAttachForm && newPostAttachName.trim();
    const newPost: Post = {
      id: `post-${Date.now()}`,
      classId: selectedClass,
      author: currentUserName,
      authorRole: currentUserRole === "professor" ? "professor" : "aluno",
      content: newPostContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
      comments: [],
      attachment: hasAttachment ? {
        name: newPostAttachName.endsWith(`.${newPostAttachType}`) 
          ? newPostAttachName 
          : `${newPostAttachName}.${newPostAttachType}`,
        type: newPostAttachType,
        size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`
      } : undefined
    };

    setPosts([newPost, ...posts]);

    // Automatically add attachment to the class file vault if one is present
    if (newPost.attachment) {
      const autoFile: SchoolFile = {
        id: `file-${Date.now()}`,
        classId: selectedClass,
        name: newPost.attachment.name,
        type: newPost.attachment.type,
        uploadedBy: currentUserName,
        uploadedByRole: currentUserRole === "professor" ? "professor" : "aluno",
        size: newPost.attachment.size,
        category: "Material de Aula",
        uploadedAt: new Date().toISOString()
      };
      setFiles(prev => [autoFile, ...prev]);

      const fileNotif: SystemNotification = {
        id: `not-f-${Date.now()}`,
        content: `${currentUserName} anexou o arquivo "${newPost.attachment.name}" no feed.`,
        createdAt: new Date().toISOString(),
        type: 'file'
      };
      setNotifications(prev => [fileNotif, ...prev]);
    }

    // Add simulation notification
    const newNotif: SystemNotification = {
      id: `not-${Date.now()}`,
      content: `${currentUserName} compartilhou uma nova postagem na comunidade da turma.`,
      createdAt: new Date().toISOString(),
      type: 'comment'
    };
    setNotifications([newNotif, ...notifications]);

    // Reset Form
    setNewPostContent("");
    setNewPostAttachName("");
    setShowAttachForm(false);

    toast({
      title: "Post publicado!",
      description: "Sua postagem já está disponível no feed da turma.",
    });
  };

  // Like a post
  const handleLikePost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const liked = !post.likedByMe;
          
          if (liked) {
            const likeNotif: SystemNotification = {
              id: `not-l-${Date.now()}`,
              content: `Você curtiu a postagem de ${post.author}.`,
              createdAt: new Date().toISOString(),
              type: 'like'
            };
            setNotifications(prev => [likeNotif, ...prev]);
          }
          
          return {
            ...post,
            likedByMe: liked,
            likes: liked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  // Add comment to post
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    const newComment: Comment = {
      id: `com-${Date.now()}`,
      author: currentUserName,
      authorRole: currentUserRole === "professor" ? "professor" : "aluno",
      content: commentText,
      createdAt: new Date().toISOString()
    };

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );

    // Notification simulation
    const commentNotif: SystemNotification = {
      id: `not-c-${Date.now()}`,
      content: `Você comentou no post de ${posts.find(p => p.id === postId)?.author}.`,
      createdAt: new Date().toISOString(),
      type: 'comment'
    };
    setNotifications(prev => [commentNotif, ...prev]);

    // Reset Input
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  // Handler for file upload simulation
  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      toast({
        title: "Nome do arquivo vazio",
        description: "Dê um nome para o arquivo a ser enviado.",
        variant: "destructive"
      });
      return;
    }

    const filename = newFileName.endsWith(`.${newFileType}`) 
      ? newFileName 
      : `${newFileName}.${newFileType}`;

    const newFile: SchoolFile = {
      id: `file-${Date.now()}`,
      classId: selectedClass,
      name: filename,
      type: newFileType,
      uploadedBy: currentUserName,
      uploadedByRole: currentUserRole === "professor" ? "professor" : "aluno",
      size: `${(Math.random() * 8 + 0.1).toFixed(1)} MB`,
      category: newFileCategory,
      uploadedAt: new Date().toISOString()
    };

    setFiles([newFile, ...files]);

    // Add simulated real-time notification
    const fileNotif: SystemNotification = {
      id: `not-${Date.now()}`,
      content: `${currentUserName} enviou um novo arquivo: "${filename}" na pasta de arquivos da turma.`,
      createdAt: new Date().toISOString(),
      type: 'file'
    };
    setNotifications([fileNotif, ...notifications]);

    // Reset Form
    setNewFileName("");
    setShowUploadForm(false);

    toast({
      title: "Arquivo enviado!",
      description: `O arquivo ${filename} foi adicionado à pasta de ${newFileCategory}.`,
    });
  };

  // Delete dynamic items for UX polishing
  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast({
      title: "Post removido",
      description: "A postagem foi excluída com sucesso."
    });
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi excluído da lista da turma."
    });
  };

  // --- MOODLE STUDENT ASSIGNMENT SUBMISSION ---
  const handleStudentSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentId) return;

    // Se houver arquivo selecionado no upload real, usamos seu nome
    // Caso contrário, fazemos fallback para o texto de submissionFileName ou undefined
    const fileName = selectedFile 
      ? selectedFile.name 
      : (submissionFileName.trim() 
          ? (submissionFileName.endsWith(".pdf") ? submissionFileName : `${submissionFileName}.pdf`) 
          : undefined);

    const newSub: StudentSubmission = {
      id: `sub-${Date.now()}`,
      studentName: currentUserName,
      assignmentId: activeAssignmentId,
      textSubmission: submissionText.trim() || "Resolução digitada via editor do Moodle.",
      fileSubmissionName: fileName,
      submittedAt: new Date().toISOString(),
      status: "Entregue"
    };

    setSubmissions([newSub, ...submissions]);
    
    // Notification
    const notif: SystemNotification = {
      id: `not-${Date.now()}`,
      content: `Você enviou a tarefa "${moodleTopics.flatMap(t=>t.items).find(i=>i.id===activeAssignmentId)?.title}" no Moodle.`,
      createdAt: new Date().toISOString(),
      type: "submission"
    };
    setNotifications([notif, ...notifications]);

    // Reset states
    setActiveAssignmentId(null);
    setSubmissionText("");
    setSubmissionFileName("");
    setSelectedFile(null);

    toast({
      title: "Tarefa Enviada!",
      description: "Sua submissão de material EAD foi salva no Moodle."
    });
  };

  // --- MOODLE TEACHER GRADING SUBMISSION ---
  const handleTeacherSubmitGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGradingSubmissionId) return;

    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === activeGradingSubmissionId) {
          return {
            ...sub,
            status: "Avaliado",
            score: gradingScore,
            feedback: gradingFeedback.trim()
          };
        }
        return sub;
      })
    );

    const gradedSub = submissions.find(s=>s.id === activeGradingSubmissionId);
    if (gradedSub) {
      // Notification
      const notif: SystemNotification = {
        id: `not-${Date.now()}`,
        content: `Você avaliou a tarefa de ${gradedSub.studentName} com nota ${gradingScore}/10 no Moodle.`,
        createdAt: new Date().toISOString(),
        type: "grade"
      };
      setNotifications([notif, ...notifications]);
    }

    setActiveGradingSubmissionId(null);
    setGradingFeedback("");

    toast({
      title: "Nota Lançada",
      description: "A nota do estudante foi salva e o boletim foi atualizado."
    });
  };

  // --- MOODLE FORUM MESSAGE SUBMISSION ---
  const handleAddForumPost = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (!forumInputText.trim()) return;

    setMoodleTopics(prev =>
      prev.map(topic => ({
        ...topic,
        items: topic.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              forumPosts: [
                ...(item.forumPosts || []),
                { author: currentUserName, content: forumInputText.trim(), date: new Date().toISOString() }
              ]
            };
          }
          return item;
        })
      }))
    );

    setForumInputText("");
    toast({
      title: "Mensagem publicada",
      description: "Seu comentário foi adicionado à discussão do fórum Moodle."
    });
  };

  // --- MOODLE QUIZ SUBMISSION ---
  const handleQuizAnswerSubmit = (itemId: string, maxScore: number) => {
    const answers = quizAnswers[itemId] || {};
    const questions = moodleTopics.flatMap(t=>t.items).find(i=>i.id===itemId)?.questions || [];
    
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Respostas incompletas",
        description: "Por favor, responda todas as perguntas do teste antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correctCount += 1;
      }
    });

    const finalScore = (correctCount / questions.length) * maxScore;

    setQuizCompleted(prev => ({
      ...prev,
      [itemId]: { score: finalScore, maxScore }
    }));

    toast({
      title: "Questionário Finalizado!",
      description: `Sua pontuação no questionário: ${finalScore}/${maxScore}.`
    });
  };

  // Helper file icons
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc': return <FileCode className="w-8 h-8 text-blue-500" />;
      case 'image': return <FileImage className="w-8 h-8 text-green-500" />;
      case 'zip': return <FileArchive className="w-8 h-8 text-yellow-600" />;
      default: return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  // Filters application
  const filteredAnnouncements = announcements.filter(ann => ann.classId === selectedClass);
  const filteredPosts = posts.filter(post => post.classId === selectedClass);
  const filteredFiles = files.filter(file => {
    const matchesClass = file.classId === selectedClass;
    const matchesSearch = file.name.toLowerCase().includes(searchFileQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const filteredMoodleTopics = moodleTopics.filter(t => t.classId === selectedClass);

  // Student mock list for participants / grading view
  const mockStudents = [
    { name: "Ana Beatriz", email: "anabeatriz@hemera.edu.br", role: "aluno", status: "Ativo" },
    { name: "Gustavo Nogueira", email: "gustavo@hemera.edu.br", role: "aluno", status: "Ativo" },
    { name: "Rodrigo M.", email: "rodrigo@hemera.edu.br", role: "aluno", status: "Ativo" },
    { name: "Fernanda Costa", email: "fernanda@hemera.edu.br", role: "aluno", status: "Ativo" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-4 relative">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20 space-y-8" data-testid="polis-dashboard">
        
        {/* TOP BAR / MULTI-TENANCY UI */}
        <section className="relative rounded-[2rem] overflow-hidden shadow-xl bg-white/40 backdrop-blur-xl border border-glass-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
              <School className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold border border-primary/20">
                Hemera Polis
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-800 mt-1">Comunidade da Turma</h1>
              <p className="text-sm text-gray-500 font-medium">Mural de avisos, feed social, arquivos e ambiente Moodle integrado.</p>
            </div>
          </div>

          {/* Tenant selectors */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* School Selector */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Escola / Instituição</label>
              <div className="relative">
                <select
                  data-testid="school-selector"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full sm:w-64 pl-3 pr-10 py-2.5 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none transition-all cursor-pointer"
                >
                  {schoolsMock.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Class Selector */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Turma Ativa</label>
              <div className="relative">
                <select
                  data-testid="class-selector"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full sm:w-64 pl-3 pr-10 py-2.5 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none transition-all cursor-pointer"
                >
                  {currentClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* MAIN SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Area (Feed/Mural/Files/Moodle) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* TABS NAVIGATION - Added 4th Tab: Moodle */}
            <div className="flex p-1.5 rounded-2xl bg-white/40 backdrop-blur-md border border-glass-border shadow-sm max-w-lg">
              {(
                [
                  { id: "mural", label: "Mural Oficial", icon: Megaphone },
                  { id: "feed", label: "Feed da Turma", icon: MessageSquare },
                  { id: "arquivos", label: "Arquivos", icon: FileText },
                  { id: "moodle", label: "Moodle EAD", icon: BookOpen }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  className={`flex items-center justify-center flex-1 gap-2.5 py-3 text-xs md:text-sm font-bold transition-all rounded-xl ${
                    activeTab === tab.id
                      ? "bg-white text-primary shadow-md border border-gray-100"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: MURAL */}
            {activeTab === "mural" && (
              <div className="space-y-6" data-testid="tab-content-mural">
                {/* Professor specific form: Add Announcement */}
                {currentUserRole === "professor" && (
                  <form onSubmit={handleAddAnnouncement} className="bg-white/60 backdrop-blur-xl border border-glass-border rounded-[2rem] shadow-lg p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Pin className="w-5 h-5 text-primary rotate-45" />
                      Fixar Novo Aviso no Mural Oficial
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        placeholder="Título do aviso..."
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                      />
                      <textarea
                        placeholder="Escreva a mensagem detalhada para a turma..."
                        rows={3}
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAnnPinned}
                          onChange={(e) => setNewAnnPinned(e.target.checked)}
                          className="w-4.5 h-4.5 text-primary rounded border-gray-300 focus:ring-primary/40"
                        />
                        Fixar destaque no topo do mural
                      </label>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Publicar Comunicado
                      </button>
                    </div>
                  </form>
                )}

                {/* Announcements list */}
                <div className="space-y-4">
                  {filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-16 bg-white/40 rounded-[2rem] border border-glass-border">
                      <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-500">Nenhum aviso importante neste mural ainda.</p>
                      <p className="text-xs text-gray-400 mt-1">O professor ou diretoria divulgará comunicados aqui.</p>
                    </div>
                  ) : (
                    filteredAnnouncements.map((ann) => (
                      <div 
                        key={ann.id} 
                        className={`relative overflow-hidden bg-white/70 backdrop-blur-md rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md ${
                          ann.pinned ? "border-primary/30 ring-1 ring-primary/10" : "border-gray-100"
                        }`}
                      >
                        {ann.pinned && (
                          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
                            <Pin className="w-3.5 h-3.5 rotate-45" />
                            Fixado
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner bg-primary/10 text-primary`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h4 className="text-lg font-bold text-gray-800 pr-16">{ann.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100/50 text-[11px] font-bold text-gray-400">
                              <span className="capitalize">{ann.author} • {ann.authorRole}</span>
                              <span>{new Date(ann.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FEED */}
            {activeTab === "feed" && (
              <div className="space-y-6" data-testid="tab-content-feed">
                
                {/* Post Form */}
                <form onSubmit={handleAddPost} className="bg-white/60 backdrop-blur-xl border border-glass-border rounded-[2rem] shadow-lg p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                      {currentUserName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <textarea
                        data-testid="feed-textarea"
                        placeholder={`Olá ${currentUserName.split(" ")[0]}, o que você deseja compartilhar com a turma hoje?`}
                        rows={3}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full bg-transparent border-0 resize-none text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Attachment Form Subsection */}
                  {showAttachForm && (
                    <div className="bg-white/90 border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-end animate-fade-in">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Nome do Anexo</label>
                        <input
                          type="text"
                          placeholder="Ex: exercicios-aula"
                          value={newPostAttachName}
                          onChange={(e) => setNewPostAttachName(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        />
                      </div>
                      <div className="w-full sm:w-36 space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Extensão</label>
                        <select
                          value={newPostAttachType}
                          onChange={(e) => setNewPostAttachType(e.target.value as 'pdf' | 'doc' | 'image' | 'zip')}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        >
                          <option value="pdf">.pdf (Texto)</option>
                          <option value="doc">.doc (Office)</option>
                          <option value="image">.png (Imagem)</option>
                          <option value="zip">.zip (Arquivo)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAttachForm(!showAttachForm)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        showAttachForm ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {showAttachForm ? "Remover Anexo" : "Anexar Material"}
                    </button>
                    
                    <button
                      type="submit"
                      data-testid="publish-post-btn"
                      className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      Publicar no Feed
                    </button>
                  </div>
                </form>

                {/* Posts List */}
                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-16 bg-white/40 rounded-[2rem] border border-glass-border">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-500">Nenhuma postagem no feed ainda.</p>
                      <p className="text-xs text-gray-400 mt-1">Compartilhe uma dúvida ou uma novidade para começar.</p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        {/* Post Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-sm">
                              {post.author.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 text-sm">{post.author}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                                  post.authorRole === "professor" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {post.authorRole}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {new Date(post.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                              </span>
                            </div>
                          </div>

                          {/* Options / Delete */}
                          {(post.author === currentUserName || currentUserRole === "professor") && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                              title="Remover Postagem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Post Content */}
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {/* Post Attachment */}
                        {post.attachment && (
                          <div className="flex items-center justify-between p-4 bg-gray-50/70 border border-gray-100 rounded-2xl">
                            <div className="flex items-center gap-3">
                              {getFileIcon(post.attachment.type)}
                              <div className="text-left">
                                <p className="text-xs font-bold text-gray-700 truncate max-w-xs sm:max-w-md">{post.attachment.name}</p>
                                <p className="text-[10px] font-semibold text-gray-400 capitalize">{post.attachment.type} • {post.attachment.size}</p>
                              </div>
                            </div>
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                toast({
                                  title: "Download Iniciado",
                                  description: `Baixando o arquivo ${post.attachment?.name} do repositório da turma.`
                                });
                              }}
                              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                            >
                              Baixar
                            </a>
                          </div>
                        )}

                        {/* Actions buttons */}
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-100/50">
                          <button
                            data-testid={`like-btn-${post.id}`}
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${
                              post.likedByMe 
                                ? "text-red-500 bg-red-50 hover:bg-red-100/60" 
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-current" : ""}`} />
                            {post.likes} Curtidas
                          </button>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 px-3 py-1.5">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments.length} Comentários
                          </span>
                        </div>

                        {/* Comments section */}
                        <div className="bg-gray-50/50 rounded-2xl p-4 space-y-4">
                          {post.comments.length > 0 && (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                              {post.comments.map(c => (
                                <div key={c.id} className="text-left bg-white/70 p-3 rounded-xl border border-gray-100/60 shadow-inner">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-800">{c.author}</span>
                                    <span className="text-[9px] text-gray-400 capitalize">{c.authorRole}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">{c.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Write Comment Form */}
                          <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Escreva um comentário rápido..."
                              value={commentInputs[post.id] || ""}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/95 transition-all"
                            >
                              Enviar
                            </button>
                          </form>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FILES */}
            {activeTab === "arquivos" && (
              <div className="space-y-6" data-testid="tab-content-arquivos">
                {/* Search Bar + Add File Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar arquivos por nome..."
                      value={searchFileQuery}
                      onChange={(e) => setSearchFileQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    data-testid="upload-toggle-btn"
                    className="px-5 py-2.5 bg-secondary hover:bg-secondary/95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 justify-center"
                  >
                    <Upload className="w-4 h-4" />
                    {showUploadForm ? "Cancelar Upload" : "Enviar Arquivo"}
                  </button>
                </div>

                {/* Upload File Form */}
                {showUploadForm && (
                  <form onSubmit={handleUploadFile} className="bg-white/60 backdrop-blur-xl border border-glass-border rounded-[2rem] shadow-lg p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-secondary" />
                      Enviar Novo Material para a Pasta da Turma
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Nome do Arquivo</label>
                        <input
                          type="text"
                          placeholder="Ex: roteiro-seminario"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Formato</label>
                        <select
                          value={newFileType}
                          onChange={(e) => setNewFileType(e.target.value as 'pdf' | 'doc' | 'image' | 'zip')}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        >
                          <option value="pdf">.pdf (Documento PDF)</option>
                          <option value="doc">.doc (Processador Texto)</option>
                          <option value="image">.png (Imagem / Slide)</option>
                          <option value="zip">.zip (Arquivo Compactado)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Categoria</label>
                        <select
                          value={newFileCategory}
                          onChange={(e) => setNewFileCategory(e.target.value as 'Material de Aula' | 'Atividades' | 'Leitura Complementar')}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        >
                          <option value="Material de Aula">Material de Aula</option>
                          <option value="Atividades">Atividades</option>
                          <option value="Leitura Complementar">Leitura Complementar</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        data-testid="submit-file-btn"
                        className="px-6 py-2.5 bg-secondary text-white text-xs font-bold rounded-xl shadow-md hover:bg-secondary/95 transition-all"
                      >
                        Salvar na Biblioteca da Turma
                      </button>
                    </div>
                  </form>
                )}

                {/* Files Grid / List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFiles.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white/40 rounded-[2rem] border border-glass-border">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-500">Nenhum arquivo encontrado nesta pasta.</p>
                      <p className="text-xs text-gray-400 mt-1">Os uploads feitos por professores e alunos aparecem aqui.</p>
                    </div>
                  ) : (
                    filteredFiles.map((file) => (
                      <div key={file.id} className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
                        <div className="mt-1">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-bold text-gray-800 text-sm truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 mt-1">
                            {file.category}
                          </span>
                          <p className="text-[10px] text-gray-400 font-semibold mt-2.5">
                            Por: <strong className="text-gray-500">{file.uploadedBy}</strong> ({file.uploadedByRole})
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">
                            Enviado em: {new Date(file.uploadedAt).toLocaleDateString('pt-BR')} • {file.size}
                          </p>
                          
                          <div className="flex gap-2.5 mt-4">
                            <a 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                toast({
                                  title: "Arquivo Visualizado",
                                  description: `Abrindo prévia de ${file.name} em modo de leitura.`
                                });
                              }}
                              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold rounded-lg transition-all shadow-sm"
                            >
                              Visualizar
                            </a>
                            <a 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                toast({
                                  title: "Download Concluído",
                                  description: `Material ${file.name} saved localmente.`
                                });
                              }}
                              className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold rounded-lg transition-all"
                            >
                              Baixar
                            </a>
                            {/* Option to delete file by creator or professor */}
                            {(file.uploadedBy === currentUserName || currentUserRole === "professor") && (
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="px-2.5 py-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all ml-auto"
                                title="Deletar Arquivo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: MOODLE EAD ── */}
            {activeTab === "moodle" && (
              <div className="space-y-6 animate-fade-in" data-testid="tab-content-moodle">
                
                {/* Moodle Sub-Tabs */}
                <div className="flex border-b border-gray-200 pb-px gap-2">
                  <button
                    onClick={() => setActiveMoodleSubTab("topicos")}
                    className={`py-2 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeMoodleSubTab === "topicos" ? "border-slate-800 text-slate-800" : "border-transparent text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Tópicos de Estudo
                  </button>
                  <button
                    onClick={() => setActiveMoodleSubTab("notas")}
                    className={`py-2 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeMoodleSubTab === "notas" ? "border-slate-800 text-slate-800" : "border-transparent text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Boletim de Notas
                  </button>
                  <button
                    onClick={() => setActiveMoodleSubTab("participantes")}
                    className={`py-2 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeMoodleSubTab === "participantes" ? "border-slate-800 text-slate-800" : "border-transparent text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Participantes ({mockStudents.length + 1})
                  </button>
                </div>

                {/* SubTab 1: Moodle Tópicos & Conteúdos */}
                {activeMoodleSubTab === "topicos" && (
                  <div className="space-y-4 text-left">
                    {filteredMoodleTopics.length === 0 ? (
                      <div className="text-center py-16 bg-white/40 border border-glass-border rounded-[2rem]">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-500">Sem tópicos cadastrados para esta turma.</p>
                      </div>
                    ) : (
                      filteredMoodleTopics.map(topic => (
                        <div key={topic.id} className="bg-white/80 border border-slate-200/60 rounded-3xl p-5 space-y-3.5 shadow-sm">
                          
                          {/* Topic Header Toggle */}
                          <div 
                            onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                            className="flex justify-between items-start cursor-pointer group"
                          >
                            <div className="space-y-1">
                              <h3 className="font-extrabold text-sm md:text-base text-slate-800 group-hover:text-primary transition">
                                {topic.title}
                              </h3>
                              <p className="text-xs text-slate-500 pr-12 leading-relaxed">{topic.description}</p>
                            </div>
                            <button className="text-slate-400 hover:text-slate-655 p-1 rounded-lg hover:bg-slate-100 mt-1">
                              {expandedTopic === topic.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Topic Items (Accordian body) */}
                          {expandedTopic === topic.id && (
                            <div className="pt-3 border-t border-slate-100 flex flex-col gap-4 animate-fade-in">
                              {topic.items.map(item => {
                                
                                // Material
                                if (item.type === "material") {
                                  return (
                                    <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl">
                                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-650 shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0 space-y-0.5">
                                        <h5 className="font-bold text-xs text-slate-800">{item.title}</h5>
                                        <p className="text-[10px] text-slate-500">{item.description}</p>
                                        <div className="flex gap-2 pt-2 shrink-0">
                                          <button onClick={() => toast({ title: "Moodle", description: `Abrindo prévia de ${item.title}` })} className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg shadow-xxs">Visualizar</button>
                                          <button onClick={() => toast({ title: "Moodle", description: `Baixando ${item.title}` })} className="px-3 py-1 bg-blue-50 hover:bg-blue-100/60 border border-blue-150 text-[10px] font-bold text-blue-700 rounded-lg">Baixar</button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                // Video
                                if (item.type === "video") {
                                  return (
                                    <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl">
                                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-650 shrink-0">
                                        <PlayCircle className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0 space-y-0.5">
                                        <h5 className="font-bold text-xs text-slate-800">{item.title}</h5>
                                        <p className="text-[10px] text-slate-500">{item.description}</p>
                                        <div className="flex gap-2 pt-2">
                                          <button onClick={() => toast({ title: "Moodle Video", description: "Iniciando reprodução de videoaula..." })} className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg shadow-xxs flex items-center gap-1">
                                            <Video className="w-3.5 h-3.5 text-slate-500" /> Assistir Aula
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                // Assignment (Homework tasks)
                                if (item.type === "assignment") {
                                  // Check status
                                  const mySub = submissions.find(s => s.assignmentId === item.id && (s.studentName === currentUserName || currentUserRole === "professor"));
                                  const submissionsCount = submissions.filter(s=>s.assignmentId === item.id).length;

                                  return (
                                    <div key={item.id} className="flex flex-col gap-3.5 p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-left">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-650 shrink-0">
                                          <ClipboardCheck className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <h5 className="font-bold text-xs text-slate-800">{item.title}</h5>
                                            <span className="text-[8px] font-extrabold uppercase bg-amber-100 text-amber-850 px-1.5 py-0.5 rounded border border-amber-200/30">Tarefa</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500">{item.description}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Prazo: {item.dueDate} • Valor: {item.maxScore} pontos</p>
                                        </div>
                                      </div>

                                      {/* STUDENT WORKSPACE IN ASSIGNMENT */}
                                      {currentUserRole === "aluno" && (
                                        <div className="border-t border-slate-200/60 pt-3 space-y-2">
                                          {mySub ? (
                                            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-[10.5px]">
                                              <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-700">Status do Envio:</span>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${mySub.status === "Avaliado" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>{mySub.status}</span>
                                              </div>
                                              <p className="text-slate-655 italic">"{mySub.textSubmission}"</p>
                                              {mySub.fileSubmissionName && <p className="text-slate-400 text-[9.5px]">Anexo: 📄 {mySub.fileSubmissionName}</p>}
                                              
                                              {mySub.status === "Avaliado" && (
                                                <div className="bg-emerald-50/50 border border-emerald-150 p-2.5 rounded-lg space-y-1">
                                                  <p className="font-bold text-emerald-950 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Nota Final: {mySub.score} / {item.maxScore}</p>
                                                  {mySub.feedback && <p className="text-emerald-800 italic">Feedback do tutor: "{mySub.feedback}"</p>}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="space-y-3">
                                              {activeAssignmentId === item.id ? (
                                                <form onSubmit={handleStudentSubmitAssignment} className="space-y-3 p-3 bg-white border border-slate-200 rounded-xl">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase px-1">Texto da Resolução</label>
                                                    <textarea 
                                                      rows={3}
                                                      value={submissionText}
                                                      onChange={e=>setSubmissionText(e.target.value)}
                                                      placeholder="Insira suas respostas ou link externo do projeto..."
                                                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase px-1">Anexo da Tarefa (PDF, ZIP, DOCX, PNG - Máx. 10MB)</label>
                                                    <input 
                                                      type="file"
                                                      accept=".pdf,.zip,.docx,.png"
                                                      onChange={handleFileChange}
                                                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                                                    />
                                                    {selectedFile && (
                                                      <p className="text-[10px] text-emerald-600 font-semibold px-1">Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                                    )}
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <Button type="submit" className="bg-slate-900 hover:bg-slate-850 h-8 text-[10px] font-bold rounded-lg px-4 shadow-sm">Confirmar Envio</Button>
                                                    <Button type="button" variant="outline" onClick={()=>setActiveAssignmentId(null)} className="h-8 text-[10px] rounded-lg">Cancelar</Button>
                                                  </div>
                                                </form>
                                              ) : (
                                                <Button onClick={()=>setActiveAssignmentId(item.id)} className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold h-8 text-[10.5px] rounded-lg">Enviar Trabalho da Tarefa</Button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* TEACHER WORKSPACE IN ASSIGNMENT */}
                                      {currentUserRole === "professor" && (
                                        <div className="border-t border-slate-200/60 pt-3 space-y-2">
                                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase px-1">
                                            <span>Entregas Recebidas</span>
                                            <span>{submissionsCount} Aluno(s) enviaram</span>
                                          </div>
                                          
                                          {submissions.filter(s=>s.assignmentId === item.id).length === 0 ? (
                                            <p className="text-[10px] text-slate-400 italic text-center py-2 bg-white/40 border border-dashed rounded-lg">Nenhum envio recebido para esta tarefa.</p>
                                          ) : (
                                            <div className="space-y-2">
                                              {submissions.filter(s=>s.assignmentId === item.id).map(sub => (
                                                <div key={sub.id} className="p-3 bg-white border border-slate-200 rounded-xl text-[10.5px] space-y-2">
                                                  <div className="flex justify-between items-start">
                                                    <div>
                                                      <p className="font-bold text-slate-800">{sub.studentName}</p>
                                                      <p className="text-[9.5px] text-slate-400">Enviado em: {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${sub.status === "Avaliado" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>{sub.status}</span>
                                                  </div>
                                                  
                                                  <p className="text-slate-655 bg-slate-50/50 p-2 border border-slate-100 rounded-lg italic">"{sub.textSubmission}"</p>
                                                  {sub.fileSubmissionName && <p className="text-[9.5px] text-slate-500">Documento: 📄 {sub.fileSubmissionName}</p>}

                                                  {sub.status === "Avaliado" ? (
                                                    <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg space-y-0.5">
                                                      <p className="font-bold text-emerald-950 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Nota Atribuída: {sub.score} / {item.maxScore}</p>
                                                      {sub.feedback && <p className="text-emerald-800 italic">Comentários: "{sub.feedback}"</p>}
                                                    </div>
                                                  ) : (
                                                    <div className="pt-2">
                                                      {activeGradingSubmissionId === sub.id ? (
                                                        <form onSubmit={handleTeacherSubmitGrading} className="space-y-3 border-t border-slate-100 pt-2 text-left">
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                              <label className="text-[9px] font-bold text-slate-500 uppercase">Nota (0 a {item.maxScore})</label>
                                                              <input 
                                                                type="number"
                                                                min={0}
                                                                max={item.maxScore}
                                                                step={0.5}
                                                                value={gradingScore}
                                                                onChange={e=>setGradingScore(parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                                              />
                                                            </div>
                                                            <div className="space-y-1">
                                                              <label className="text-[9px] font-bold text-slate-500 uppercase">Feedback / Comentários</label>
                                                              <input 
                                                                type="text"
                                                                value={gradingFeedback}
                                                                onChange={e=>setGradingFeedback(e.target.value)}
                                                                placeholder="Ex: Muito bom!"
                                                                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                                              />
                                                            </div>
                                                          </div>
                                                          <div className="flex gap-2">
                                                            <Button type="submit" className="bg-slate-900 text-white h-7 text-[9.5px] font-bold rounded-lg shadow-sm px-3">Gravar Nota</Button>
                                                            <Button type="button" variant="outline" onClick={()=>setActiveGradingSubmissionId(null)} className="h-7 text-[9.5px] rounded-lg px-3">Recusar</Button>
                                                          </div>
                                                        </form>
                                                      ) : (
                                                        <Button onClick={() => {
                                                          setActiveGradingSubmissionId(sub.id);
                                                          setGradingScore(item.maxScore || 10);
                                                        }} className="bg-slate-950 hover:bg-slate-900 text-white font-bold h-7.5 text-[10px] rounded-lg px-3.5">Avaliar Trabalho</Button>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // Interactive Quiz
                                if (item.type === "quiz") {
                                  const quizResult = quizCompleted[item.id];
                                  const answers = quizAnswers[item.id] || {};

                                  return (
                                    <div key={item.id} className="flex flex-col gap-3.5 p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-left">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-650 shrink-0">
                                          <HelpCircle className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <h5 className="font-bold text-xs text-slate-800">{item.title}</h5>
                                            <span className="text-[8px] font-extrabold uppercase bg-purple-100 text-purple-850 px-1.5 py-0.5 rounded border border-purple-200/30">Questionário</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500">{item.description}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pontuação Máxima: {item.maxScore} pontos</p>
                                        </div>
                                      </div>

                                      {/* Quiz interactive options */}
                                      <div className="border-t border-slate-200/60 pt-3 space-y-3 text-left">
                                        {quizResult ? (
                                          <div className="bg-purple-50/50 border border-purple-150 p-3 rounded-xl space-y-1.5 text-[10.5px]">
                                            <p className="font-extrabold text-purple-950">Seu Resultado: {quizResult.score} de {quizResult.maxScore} pontos</p>
                                            <p className="text-slate-400">Suas respostas foram submetidas e corrigidas pelo gabarito automatizado do Moodle.</p>
                                            <Button variant="outline" onClick={()=>setQuizCompleted(prev => {const next={...prev}; delete next[item.id]; return next;})} className="h-7 text-[9px] rounded-lg mt-1 bg-white">Tentar Novamente</Button>
                                          </div>
                                        ) : (
                                          <div className="space-y-3.5">
                                            {item.questions?.map(q => (
                                              <div key={q.id} className="space-y-1">
                                                <p className="text-[10.5px] font-bold text-slate-700">{q.id}. {q.q}</p>
                                                <div className="grid grid-cols-1 gap-1">
                                                  {q.options.map(opt => (
                                                    <label key={opt} className={`flex items-center gap-2 p-2 rounded-lg border text-[9.5px] cursor-pointer transition ${answers[q.id] === opt ? 'border-purple-300 bg-purple-50/20 text-purple-950 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-655 bg-white'}`}>
                                                      <input 
                                                        type="radio"
                                                        name={`quiz-${item.id}-${q.id}`}
                                                        value={opt}
                                                        checked={answers[q.id] === opt}
                                                        onChange={() => setQuizAnswers({ ...quizAnswers, [item.id]: { ...answers, [q.id]: opt } })}
                                                        className="accent-purple-650"
                                                      />
                                                      <span>{opt}</span>
                                                    </label>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                            <Button 
                                              onClick={() => handleQuizAnswerSubmit(item.id, item.maxScore || 5)}
                                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-8 text-[10.5px] rounded-lg shadow-md shadow-purple-500/10"
                                            >
                                              Finalizar Questionário Moodle
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }

                                // Discussion Forums
                                if (item.type === "forum") {
                                  return (
                                    <div key={item.id} className="flex flex-col gap-3.5 p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-left">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-650 shrink-0">
                                          <MessageCircle className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <h5 className="font-bold text-xs text-slate-800">{item.title}</h5>
                                            <span className="text-[8px] font-extrabold uppercase bg-sky-100 text-sky-850 px-1.5 py-0.5 rounded border border-sky-200/30">Fórum</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500">{item.description}</p>
                                        </div>
                                      </div>

                                      {/* Forum Threads */}
                                      <div className="border-t border-slate-200/60 pt-3 space-y-3.5">
                                        {activeForumId === item.id ? (
                                          <div className="space-y-3">
                                            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                                              {item.forumPosts?.map((post, pIdx) => (
                                                <div key={pIdx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10.5px] space-y-1">
                                                  <div className="flex justify-between font-bold text-slate-800">
                                                    <span>{post.author}</span>
                                                    <span className="text-[9px] text-slate-400 font-semibold">{new Date(post.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                                                  </div>
                                                  <p className="text-slate-655 leading-relaxed">{post.content}</p>
                                                </div>
                                              ))}
                                            </div>
                                            
                                            <form onSubmit={(e)=>handleAddForumPost(e, item.id)} className="flex gap-2">
                                              <input 
                                                type="text"
                                                value={forumInputText}
                                                onChange={e=>setForumInputText(e.target.value)}
                                                placeholder="Digite sua resposta no fórum..."
                                                className="flex-1 px-3.5 py-1.5 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-slate-800 bg-white"
                                              />
                                              <Button type="submit" className="bg-slate-900 text-white h-8 text-[10px] rounded-lg px-3 shadow-sm">Postar</Button>
                                              <Button type="button" variant="outline" onClick={()=>setActiveForumId(null)} className="h-8 text-[10px] rounded-lg px-3">Fechar</Button>
                                            </form>
                                          </div>
                                        ) : (
                                          <Button onClick={()=>setActiveForumId(item.id)} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-8 text-[10.5px] rounded-lg shadow-xxs">Entrar na Discussão do Fórum ({item.forumPosts?.length || 0})</Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }

                                return null;
                              })}
                            </div>
                          )}

                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SubTab 2: Boletim de Notas Moodle */}
                {activeMoodleSubTab === "notas" && (
                  <div className="space-y-6 text-left animate-fade-in">
                    {/* STUDENT GRADE VIEW */}
                    {currentUserRole === "aluno" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Summary Radial Indicator */}
                        <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* Inner Circle stats */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                              <circle cx="50" cy="50" r="40" stroke="#4f46e5" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 8.5) / 10} fill="none" strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="font-extrabold text-2xl text-slate-800">8.5</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Média Geral</span>
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-extrabold text-xs text-slate-800">Desempenho Pedagógico</h4>
                            <p className="text-[10px] text-slate-400">Você concluiu 80% das tarefas do semestre.</p>
                          </div>
                        </div>

                        {/* Detail Grades Table */}
                        <div className="md:col-span-2 bg-white/80 border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-sm text-slate-800">Avaliações e Notas do Moodle</h3>
                          <div className="border border-slate-150 rounded-xl overflow-hidden text-[11px] bg-slate-50/40">
                            <table className="w-full text-left">
                              <thead className="bg-slate-100 border-b border-slate-200/60 font-bold">
                                <tr>
                                  <th className="p-3">Atividade Moodle</th>
                                  <th className="p-3">Status</th>
                                  <th className="p-3">Nota do Aluno</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 bg-white">
                                {moodleTopics.flatMap(t=>t.items).filter(i=>i.type==="assignment" || i.type==="quiz").map(item => {
                                  
                                  let status = "Pendente";
                                  let gradeText = "—";
                                  
                                  if (item.type === "quiz" && quizCompleted[item.id]) {
                                    status = "Concluído";
                                    gradeText = `${quizCompleted[item.id].score} / ${item.maxScore}`;
                                  } else {
                                    const sub = submissions.find(s=>s.assignmentId === item.id && s.studentName === currentUserName);
                                    if (sub) {
                                      status = sub.status;
                                      gradeText = sub.status === "Avaliado" ? `${sub.score} / ${item.maxScore}` : "Em correção";
                                    }
                                  }

                                  return (
                                    <tr key={item.id}>
                                      <td className="p-3 font-bold text-slate-800">{item.title}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${status==="Pendente" ? "bg-slate-100 text-slate-500" : status==="Entregue" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>{status}</span>
                                      </td>
                                      <td className="p-3 font-extrabold text-slate-700">{gradeText}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TEACHER GRADEBOOK VIEW */}
                    {currentUserRole === "professor" && (
                      <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-extrabold text-sm text-slate-800">Boletim Consolidado da Turma</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border">Prof. Tutor Administrador</span>
                        </div>
                        
                        <div className="border border-slate-150 rounded-xl overflow-hidden text-[10.5px] bg-slate-50/50">
                          <table className="w-full text-left">
                            <thead className="bg-slate-100 border-b border-slate-200 font-bold">
                              <tr>
                                <th className="p-2.5">Estudante</th>
                                {moodleTopics.flatMap(t=>t.items).filter(i=>i.type==="assignment").map(item => (
                                  <th key={item.id} className="p-2.5 truncate max-w-28" title={item.title}>{item.title.replace("Tarefa 1: ", "")}</th>
                                ))}
                                <th className="p-2.5">Média Moodle</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-250 bg-white">
                              {mockStudents.map(student => {
                                let totalScores = 0;
                                let countGraded = 0;

                                return (
                                  <tr key={student.name}>
                                    <td className="p-2.5 font-bold text-slate-850">{student.name}</td>
                                    {moodleTopics.flatMap(t=>t.items).filter(i=>i.type==="assignment").map(item => {
                                      const sub = submissions.find(s=>s.studentName === student.name && s.assignmentId === item.id);
                                      let cellText = "Pendente";
                                      
                                      if (sub) {
                                        if (sub.status === "Avaliado" && typeof sub.score === "number") {
                                          cellText = `${sub.score} / ${item.maxScore}`;
                                          totalScores += sub.score;
                                          countGraded += 1;
                                        } else {
                                          cellText = "Entregue";
                                        }
                                      }

                                      return (
                                        <td key={item.id} className="p-2.5">
                                          <span className={cellText === "Pendente" ? "text-slate-400" : cellText === "Entregue" ? "text-blue-650 font-semibold" : "text-emerald-700 font-bold"}>
                                            {cellText}
                                          </span>
                                        </td>
                                      );
                                    })}
                                    <td className="p-2.5 font-extrabold text-slate-900">
                                      {countGraded > 0 ? (totalScores / countGraded).toFixed(1) : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SubTab 3: Moodle Colegas & Participantes */}
                {activeMoodleSubTab === "participantes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    
                    {/* Professor Card */}
                    <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
                      <div className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold shadow-md">
                        {currentUserName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-800">{currentUserName}</h4>
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded border border-slate-800">Docente</span>
                        </div>
                        <p className="text-[10px] text-slate-500">alberto.santos@hemera.edu.br</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                    </div>

                    {/* Students Loop */}
                    {mockStudents.map((st, sIdx) => (
                      <div key={sIdx} className="bg-white/80 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-inner">
                          {st.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs text-slate-800">{st.name}</h4>
                            <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">Estudante</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{st.email}</p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-350" title="Offline" />
                      </div>
                    ))}

                  </div>
                )}

              </div>
            )}
          </div>

          {/* Right Sidebar: Real-time Community Activity */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl p-6 border border-glass-border">
              <h4 className="flex items-center gap-2 mb-4 text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
                <Bell className="w-5 h-5 text-warning animate-pulse" />
                Atividades da Polis
              </h4>
              
              <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                {notifications.map((notif) => (
                  <div key={notif.id} className="text-left p-3 bg-white/70 border border-gray-100 rounded-xl space-y-1.5 shadow-sm">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{notif.content}</p>
                    <span className="text-[9px] text-gray-400 font-bold block">
                      {new Date(notif.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Sem atividades recentes.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Polis;
