import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateArtifactResponse } from "@/services/aiService";
import { Image as ImageIcon, Map as MapIcon, Video, FileText, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArtifactViewerProps {
  artifact: GenerateArtifactResponse | null;
}

export function ArtifactViewer({ artifact }: ArtifactViewerProps) {
  if (!artifact) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500 bg-slate-950/20 rounded-2xl border border-white/5 border-dashed">
        <SparklesPlaceholder />
        <p className="mt-4 text-sm">Seu artefato gerado aparecerá aqui</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (artifact.tipo) {
      case 'image':
        return (
          <div className="relative group rounded-xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center">
            {/* Se for uma URL assinada do storage: */}
            <img 
              src={artifact.url_storage} 
              alt={artifact.prompt_origem} 
              className="object-contain w-full h-full"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={artifact.url_storage} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm text-white transition-all">
                <Download className="h-5 w-5" />
              </a>
            </div>
          </div>
        );
      case 'mapa_mental':
      case 'plano_aula':
        return (
          <div className="p-6 bg-slate-900/50 rounded-xl border border-white/5 text-sm text-slate-300 overflow-auto max-h-[500px] prose prose-invert prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {artifact.url_storage}
            </ReactMarkdown>
          </div>
        );
      case 'video':
        return (
          <div className="relative group rounded-xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center">
            <video 
              src={artifact.url_storage} 
              controls 
              className="w-full h-full object-cover"
            />
          </div>
        );
      default:
        return <p className="text-slate-400">Tipo de artefato desconhecido.</p>;
    }
  };

  const getIcon = () => {
    switch(artifact.tipo) {
      case 'image': return <ImageIcon className="h-5 w-5 text-pink-400" />;
      case 'mapa_mental': return <MapIcon className="h-5 w-5 text-cyan-400" />;
      case 'video': return <Video className="h-5 w-5 text-purple-400" />;
      case 'plano_aula': return <FileText className="h-5 w-5 text-emerald-400" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-slate-950/40 border-white/10 backdrop-blur-md overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            {getIcon()}
            Artefato Gerado
          </CardTitle>
          <span className="text-xs text-slate-500 bg-black/40 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
            {artifact.tipo.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-2 italic border-l-2 border-indigo-500/50 pl-3">
          "{artifact.prompt_origem}"
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

function SparklesPlaceholder() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
      <svg className="h-12 w-12 text-slate-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    </div>
  );
}
