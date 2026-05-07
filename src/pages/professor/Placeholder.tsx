import { useEffect } from "react";

export default function Placeholder({ title, icon }: { title: string; icon: string }) {
  useEffect(() => { document.title = `${title} | Hemera`; }, [title]);
  return (
    <div className="max-w-4xl px-6 mx-auto">
      <div className="flex flex-col items-center justify-center p-16 text-center glass-island rounded-3xl">
        <div className="flex items-center justify-center w-20 h-20 mb-6 text-white shadow-neon rounded-2xl bg-gradient-to-br from-aurora-secondary to-aurora-accent">
          <i className={`text-3xl fas ${icon}`} />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-slate-800 font-display">{title}</h1>
        <p className="max-w-md text-slate-500">Em breve. Esta seção será replicada do Lumenios original mantendo todas as funcionalidades.</p>
      </div>
    </div>
  );
}
