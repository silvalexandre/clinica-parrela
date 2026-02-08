import { supabase } from "@/lib/supabase";

export async function FacilitiesSection() {
  
  // Busca as instalações do banco de dados
  const { data: items } = await supabase
    .from("instalacoes")
    .select("*")
    .order("id", { ascending: true });

  // Se não tiver nada no banco, retorna null (não mostra a seção) ou uma lista vazia
  const galeria = items || [];

  return (
    <section id="instalacoes" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">Infraestrutura Premium</h2>
          <div className="w-16 h-1 bg-accent mx-auto"></div>
          <p className="mt-4 text-gray-500">Conheça nossos espaços modernos e equipados.</p>
        </div>

        {galeria.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galeria.map((item) => (
              <div key={item.id} className="group relative h-[350px] overflow-hidden rounded-lg shadow-lg cursor-pointer">
                {/* Imagem do Banco */}
                <img 
                  src={item.imagem_url} 
                  alt={item.titulo} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradiente Escuro */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-90 transition-opacity duration-300"></div>
                
                {/* Título (Legenda) */}
                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="text-white font-serif text-xl font-bold border-l-4 border-accent pl-3">
                    {item.titulo}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 italic">
            Em breve novas fotos das nossas instalações.
          </div>
        )}
      </div>
    </section>
  );
}