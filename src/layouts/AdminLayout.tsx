import { Outlet, Navigate } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AuroraBackground } from "@/components/AuroraBackground";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <AdminNavbar />
      <main className="relative z-10 flex-grow pt-2 pb-10"><Outlet /></main>
    </div>
  );
}
