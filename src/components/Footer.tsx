import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export async function Footer() {
  
  // Busca os dados do banco (Configurações)
  const { data: config } = await supabase.from("configuracoes").select("*").single();

  // Valores padrão caso o banco falhe ou esteja vazio
  const instagramUser = config?.link_instagram || "parrelamedicina";
  const linkedinUser = config?.link_linkedin || "romuloparrela";
  const whatsappNum = config?.whatsapp || "5538999999999";

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="container mx-auto px-6 text-center">
        
        <Link href="/" className="font-serif text-2xl font-bold text-white block mb-6">
          Dr. Rômulo <span className="text-accent italic">Parrela</span>
        </Link>

        {/* Links Sociais Dinâmicos */}
        <div className="flex justify-center gap-6 mb-8">
          
          <a 
            href={`https://instagram.com/${instagramUser}`} 
            target="_blank"
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all"
            title="Instagram"
          >
            <FaInstagram />
          </a>
          
          <a 
            href={`https://linkedin.com/in/${linkedinUser}`} 
            target="_blank"
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all"
            title="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
          
          <a 
            href={`https://wa.me/${whatsappNum}`} 
            target="_blank"
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all"
            title="WhatsApp"
          >
            <FaWhatsapp />
          </a>

        </div>

        {/* Endereço Dinâmico */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm mb-2">{config?.endereco}</p>
          <p className="text-sm">
            © {new Date().getFullYear()} Parrela Medicina Ocupacional. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}