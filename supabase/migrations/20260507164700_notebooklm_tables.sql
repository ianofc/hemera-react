-- O coração do "NotebookLM" do Hemera
create extension if not exists vector;

create table public.conhecimento_contexto (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  conteudo_raw text, -- Texto extraído de PDFs/Documentos
  metadata jsonb, -- Armazena referências, tipo de arquivo, etc.
  embedding vector(1536), -- Para busca semântica (IA real)
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Artefatos Gerados (Imagens, Mapas, Vídeos)
create table public.artefatos_ia (
  id uuid default gen_random_uuid() primary key,
  tipo text check (tipo in ('imagem', 'mapa_mental', 'video', 'plano_aula')),
  url_storage text, -- Link para o arquivo gerado
  prompt_origem text,
  contexto_id uuid references public.conhecimento_contexto(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);
