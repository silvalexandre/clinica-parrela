"use client"; // Obrigatório para saber em qual rota estamos

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Verifica se a rota atual começa com "/admin" ou "/dashboard"
  const isAdminPage = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  return (
    <>
      {/* LÓGICA: Só mostra o Header se NÃO for página de admin */}
      {!isAdminPage && <Header />}

      {/* LÓGICA: Se for admin, não usa o padding-top de 120px, usa zero */}
      <main className={`min-h-screen ${isAdminPage ? "" : "pt-[120px]"}`}>
        {children}
      </main>
    </>
  );
}