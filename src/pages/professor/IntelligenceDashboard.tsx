import React, { useState } from "react";
import { IntelligenceCanvas } from "@/modules/intelligence/IntelligenceCanvas";
import { ArtifactViewer } from "@/modules/intelligence/ArtifactViewer";
import { GenerateArtifactResponse } from "@/services/aiService";

export default function IntelligenceDashboard() {
  const [artifact, setArtifact] = useState<GenerateArtifactResponse | null>(null);

  // Todo: we need to pass a callback to IntelligenceCanvas so it can set the artifact here.
  // Wait, I should modify IntelligenceCanvas to accept an onGenerated prop.

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20 space-y-8 animate-fade-in-down">
      <div className="mb-8">
        <h1 className="text-4xl font-bold leading-tight text-slate-800 md:text-5xl font-display">
          Hemera <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Intelligence</span>
        </h1>
        <p className="mt-2 text-slate-500 max-w-2xl">
          Seu laboratório de IA pedagógica. Transforme currículos e documentos em artefatos interativos, planos de aula estruturados e mapas mentais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Lado Esquerdo: Canvas Interativo */}
        <div className="h-full">
          <IntelligenceCanvas onGenerated={setArtifact} />
        </div>

        {/* Lado Direito: Visualizador */}
        <div className="h-full">
          <ArtifactViewer artifact={artifact} />
        </div>
      </div>
    </div>
  );
}
