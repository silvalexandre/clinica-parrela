"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaInstagram, FaLinkedinIn, FaWhatsapp, FaPhoneAlt, FaMapMarkerAlt, FaBars, FaTimes, FaLock, FaUserCog } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [contato, setContato] = useState({
    whatsapp: "5538999999999",       
    telefoneVisual: "(38) 99999-9999", 
    endereco: "Janaúba, MG",
    instagram: "parrelamedicina",
    linkedin: "romuloparrela"
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data } = await supabase.from("configuracoes").select("*").limit(1);
        if (data && data.length > 0) {
          const item = data[0];
          const zapLink = item.whatsapp || "5538999999999";
          let textoVisual = item.telefone;
          if (!textoVisual) {
             const match = zapLink.match(/^55(\d{2})(\d{5})(\d{4})$/);
             if (match) textoVisual = `(${match[1]}) ${match[2]}-${match[3]}`;
             else textoVisual = zapLink;
          }
          setContato({
            whatsapp: zapLink,
            telefoneVisual: textoVisual,
            endereco: item.endereco || "Janaúba, MG", 
            instagram: item.link_instagram || "parrelamedicina",
            linkedin: item.link_linkedin || "romuloparrela"
          });
        }
      } catch (err) { console.error(err); }
    }
    fetchConfig();
  }, []);

  if (pathname && pathname.startsWith("/dashboard")) return null;

  const navLinks = [
    { name: "SOBRE NÓS", href: "/#sobre" },
    { name: "SERVIÇOS", href: "/#servicos" },
    { name: "INSTALAÇÕES", href: "/#instalacoes" },
    { name: "BLOG", href: "/#blog" },
    { name: "ONDE ESTAMOS", href: "/#localizacao" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col font-sans shadow-md">
        
        {/* BARRA ESCURA (Topo) */}
        <div className="bg-[#1e2329] text-gray-300 py-2 text-xs border-b border-gray-800 transition-colors">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a href={`https://wa.me/${contato.whatsapp}`} target="_blank" className="flex items-center gap-2 hover:text-white transition-colors group">
                <FaPhoneAlt className="text-[#c5a47e] group-hover:text-white transition-colors" size={12} />
                <span className="font-medium tracking-wide">{contato.telefoneVisual}</span>
              </a>
              <div className="hidden sm:flex items-center gap-2 cursor-default hover:text-white transition-colors">
                <FaMapMarkerAlt className="text-[#c5a47e]" size={12} />
                <span>{contato.endereco}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href={`https://instagram.com/${contato.instagram}`} target="_blank" className="hover:text-white transition-colors"><FaInstagram size={14} /></a>
              <a href={`https://linkedin.com/in/${contato.linkedin}`} target="_blank" className="hover:text-white transition-colors"><FaLinkedinIn size={14} /></a>
              <a href={`https://wa.me/${contato.whatsapp}`} target="_blank" className="hover:text-white transition-colors"><FaWhatsapp size={14} /></a>
              <div className="h-3 w-px bg-gray-600 mx-1"></div>
              <Link href="/dashboard" className="hover:text-[#c5a47e] transition-colors flex items-center gap-1" title="Área Restrita"><FaLock size={12} /></Link>
            </div>
          </div>
        </div>

        {/* BARRA PRINCIPAL (BRANCO GELO) */}
        {/* Usando a cor #f2f4f6 para o tom Branco Gelo */}
        <div className="bg-[#f2f4f6]"> 
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            
            {/* LOGOTIPO */}
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo-parrela.jpg"
                alt="Clínica Dr. Rômulo Parrela"
                width={250}
                height={80}
                // Adicionei mix-blend-multiply para garantir que o branco da imagem se funda com o fundo gelo
                className="h-16 w-auto object-contain mix-blend-multiply" 
                priority
              />
            </Link>

            {/* NAV DESKTOP */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-xs font-bold text-gray-600 hover:text-[#c5a47e] tracking-widest transition-colors uppercase">
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* BOTÃO CONTATO */}
            <div className="hidden lg:block">
              <Link href="/#fale-conosco">
                  <button className="bg-[#1e2329] text-white px-8 py-3 text-xs font-bold tracking-widest hover:bg-[#2d343d] transition-colors uppercase">
                    Contato
                  </button>
              </Link>
            </div>

            {/* MENU MOBILE TOGGLE */}
            <button className="lg:hidden text-[#1e2329] text-2xl focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-fade-in-up">
            <div className="flex flex-col p-6 space-y-4 text-center">
              {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="text-sm font-bold text-gray-700 uppercase hover:text-[#c5a47e]" onClick={() => setIsMenuOpen(false)}>
                    {link.name}
                  </Link>
              ))}
              <a href={`https://wa.me/${contato.whatsapp}`} target="_blank" onClick={() => setIsMenuOpen(false)}>
                  <button className="bg-[#1e2329] text-white px-8 py-4 w-full text-xs font-bold uppercase mt-4 flex items-center justify-center gap-2">
                    <FaWhatsapp size={16} /> Agendar Consulta
                  </button>
              </a>
            </div>
          </div>
        )}
      </header>

      <Link href="/dashboard" className="fixed bottom-6 right-6 z-40 bg-[#1e2329] text-white p-3 rounded-full shadow-lg hover:bg-[#c5a47e] hover:scale-110 transition-all duration-300 border-2 border-white/10">
        <FaUserCog size={20} />
      </Link>
    </>
  );
}