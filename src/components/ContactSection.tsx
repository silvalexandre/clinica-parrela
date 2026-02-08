"use client";

import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaClock, FaPhoneAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export function ContactSection() {
  // Estado com os dados padrão da imagem
  const [info, setInfo] = useState({
    endereco: "R. Santos Dumont, 158 - Centro, Janaúba - MG",
    telefone: "(38) 99999-9999",
  });

  // Busca os dados reais do banco para preencher
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from("configuracoes").select("*").limit(1);
        if (data && data.length > 0) {
          const item = data[0];
          // Prioriza o campo 'telefone' visual, senão formata o whatsapp
          let telVisual = item.telefone;
          if (!telVisual && item.whatsapp) {
             const match = item.whatsapp.match(/^55(\d{2})(\d{5})(\d{4})$/);
             if (match) telVisual = `(${match[1]}) ${match[2]}-${match[3]}`;
          }

          setInfo({
            endereco: item.endereco || "R. Santos Dumont, 158 - Centro, Janaúba - MG",
            telefone: telVisual || "(38) 99999-9999",
          });
        }
      } catch (error) {
        console.error("Erro mapa:", error);
      }
    }
    fetchData();
  }, []);

  // Cria a URL de pesquisa do Google Maps baseada no endereço dinâmico
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(info.endereco)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const gpsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.endereco)}`;

  return (
    <section id="contato" className="relative w-full h-[500px] lg:h-[600px] bg-gray-100 overflow-hidden">
      
      {/* 1. MAPA DE FUNDO (IFRAME) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <iframe 
          title="Mapa de Localização"
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: "grayscale(20%)" }} // Um leve filtro cinza para ficar elegante
          loading="lazy" 
          allowFullScreen 
          src={mapSrc}
        ></iframe>
      </div>

      {/* 2. CARTÃO FLUTUANTE (VISITE-NOS) */}
      <div className="container mx-auto px-4 h-full relative z-10 pointer-events-none flex items-center justify-center lg:justify-end">
        
        <div className="bg-white p-8 md:p-12 shadow-2xl max-w-md w-full pointer-events-auto rounded-sm animate-fade-in-up border-t-4 border-[#c5a47e]">
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1e2329] mb-8">
            Visite-nos
          </h2>

          <div className="space-y-6">
            
            {/* Endereço */}
            <div className="flex items-start gap-4 group">
              <FaMapMarkerAlt className="text-[#c5a47e] mt-1 text-xl shrink-0 group-hover:scale-110 transition-transform" />
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                {info.endereco}
              </p>
            </div>

            {/* Horário (Fixo conforme imagem) */}
            <div className="flex items-start gap-4 group">
              <FaClock className="text-[#c5a47e] mt-1 text-xl shrink-0 group-hover:scale-110 transition-transform" />
              <div className="text-gray-600 text-sm font-medium">
                <p>Segunda a Sexta</p>
                <p>08:00 às 17:30</p>
              </div>
            </div>

            {/* Telefone */}
            <div className="flex items-start gap-4 group">
              <FaPhoneAlt className="text-[#c5a47e] mt-1 text-xl shrink-0 group-hover:scale-110 transition-transform" />
              <p className="text-gray-600 text-sm font-medium">
                {info.telefone}
              </p>
            </div>

          </div>

          {/* Botão Dourado */}
          <a 
            href={gpsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full mt-10 bg-[#c5a47e] hover:bg-[#b08d65] text-white text-center py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Abrir no GPS
          </a>

        </div>
      </div>

    </section>
  );
}