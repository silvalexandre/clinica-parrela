export function AboutSection() {
  return (
    <section id="sobre" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Título da Seção */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">
            Nossa Trajetória
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Texto Sobre Nós */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif font-semibold text-medical mb-3">
                O Legado de Confiança
              </h3>
              <p className="text-gray-600 leading-relaxed font-light text-lg">
                O nome Dr. Rômulo Parrela é sinônimo de ética e excelência médica no Norte de Minas. 
                Sua trajetória estabeleceu os alicerces de confiança sobre os quais nossa clínica se sustenta.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-serif font-semibold text-medical mb-3">
                A Força da Renovação
              </h3>
              <p className="text-gray-600 leading-relaxed font-light text-lg">
                Sob a liderança da Dra. Larissa Parrela, unimos a experiência herdada à visão estratégica 
                contemporânea e uma equipe técnica extremamente qualificada.
              </p>
            </div>
          </div>

          {/* Imagem Fixa */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-accent/20 rounded-lg transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"></div>
            
            {/* Usando tag img padrão para garantir que carrega sem configuração extra */}
            <img 
              src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=800&auto=format&fit=crop" 
              alt="Equipe Médica Dr. Parrela" 
              className="relative rounded-lg shadow-xl w-full h-[400px] object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}