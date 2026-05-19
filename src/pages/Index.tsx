import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";

export default function Index() {
  useEffect(() => { document.title = "Hemera OS | Sistema Único"; }, []);
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-slate-950 text-white">
      <AuroraBackground className="absolute inset-0 opacity-60" />
      
      <div className="relative z-10 w-full max-w-4xl text-center">
        <header className="mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-8 text-white shadow-2xl rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border border-white/10 animate-pulse">
            <BrainCircuit size={56} strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white font-display mb-2 drop-shadow-lg">
            Hemera <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">OS</span>
          </h1>
          <p className="mt-6 text-sm md:text-base font-bold tracking-[0.4em] uppercase text-slate-300">
            O Primeiro Sistema Operacional Educacional Inteligente
          </p>
          <p className="max-w-2xl mx-auto mt-8 text-lg md:text-xl text-slate-400 leading-relaxed">
            Uma plataforma única e centralizada. Toda a infraestrutura escolar, inteligência artificial e comunicação unidas em um sistema definitivo.
          </p>
        </header>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 animate-fade-in-up">
          <Link 
            to="/auth" 
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-indigo-600 border border-indigo-500 rounded-full hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Acessar Plataforma <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Sistemas Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
