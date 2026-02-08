import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { FacilitiesSection } from "@/components/FacilitiesSection";
import { BlogSection } from "@/components/BlogSection";
import { ContactSection } from "@/components/ContactSection"; 
import { ContactForm } from "@/components/ContactForm";       

export default async function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-[95vh] flex items-center justify-center text-center text-white">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920')" }}
        >
          <div className="absolute inset-0 bg-[#1e2329]/70"></div>
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Medicina Ocupacional com<br />
            <span className="text-[#c5a47e]">Visão Estratégica</span>
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-300 mb-10 max-w-2xl mx-auto">
            Protegendo o maior patrimônio da sua empresa: as pessoas.
          </p>
          <Link href="#servicos">
            <Button variant="primary" className="text-sm px-10 py-4 shadow-2xl bg-[#c5a47e] hover:bg-[#b08d65] text-white border-none">
              Nossas Soluções
            </Button>
          </Link>
        </div>
      </section>

      {/* SEÇÕES DE CONTEÚDO */}
      <AboutSection />
      <ServicesSection />
      <FacilitiesSection />
      <BlogSection />

      {/* MAPA (ID implícito geralmente é 'contato' ou 'localizacao') */}
      <div id="localizacao">
        <ContactSection />
      </div>

      {/* FORMULÁRIO (Aqui é onde o botão vai parar agora) */}
      <div id="fale-conosco"> {/* <--- ID EXCLUSIVO AQUI */}
        <ContactForm />
      </div>

    </>
  );
}