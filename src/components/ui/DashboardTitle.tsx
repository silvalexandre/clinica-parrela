import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

interface DashboardTitleProps {
  title: string;
  subtitle?: string;
  backUrl?: string; // Para onde o botão volta (padrão: /dashboard)
}

export function DashboardTitle({ title, subtitle, backUrl = "/dashboard" }: DashboardTitleProps) {
  return (
    <div className="flex items-center gap-5 mb-8">
      {/* Botão de Voltar */}
      <Link 
        href={backUrl}
        className="bg-white p-4 rounded-full shadow-sm text-gray-600 hover:text-[#c5a47e] hover:shadow-md transition-all duration-300"
        title="Voltar"
      >
        <FaArrowLeft size={18} />
      </Link>

      {/* Textos */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1e2329]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}