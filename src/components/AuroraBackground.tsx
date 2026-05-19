import { cn } from "@/lib/utils";

export const AuroraBackground = ({ className }: { className?: string }) => (
  <div className={cn("fixed top-0 left-0 z-0 w-full h-full overflow-hidden pointer-events-none", className)}>
    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-float" />
    <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-float" style={{ animationDelay: "2s" }} />
    <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-float" style={{ animationDelay: "4s" }} />
  </div>
);
