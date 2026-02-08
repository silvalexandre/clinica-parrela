import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { supabase } from "@/lib/supabase"; // Importamos a conexão que criamos

// 1. Definimos o "formato" dos dados que virão do banco
interface Post {
  id: number;
  titulo: string;
  resumo: string;
  imagem_url: string;
  created_at: string;
}

// 2. Transformamos a função em ASYNC para poder buscar dados
export async function BlogSection() {
  
  // 3. Buscamos os dados reais do Supabase
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('ativo', true) // Apenas posts ativos
    .order('created_at', { ascending: false }) // Mais recentes primeiro
    .limit(3); // Apenas 3 posts

  // Se der erro ou não tiver posts, mostramos uma mensagem discreta (ou nada)
  if (error || !posts || posts.length === 0) {
    return (
      <section id="blog" className="py-24 bg-soft">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary">Blog</h2>
          <p className="text-gray-500 mt-4">Nenhum artigo publicado no momento.</p>
        </div>
      </section>
    );
  }

  // 4. Se tiver dados, renderizamos normalmente
  return (
    <section id="blog" className="py-24 bg-soft">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">Blog & Insights</h2>
          <div className="w-16 h-1 bg-accent mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post: Post) => (
            <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
              
              {/* Imagem */}
              <div className="h-48 overflow-hidden relative">
                {post.imagem_url ? (
                  <img 
                    src={post.imagem_url} 
                    alt={post.titulo} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  // Fallback se não tiver imagem
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Sem Imagem
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-8 flex flex-col flex-grow">
                <span className="text-accent text-xs font-bold uppercase tracking-wider mb-2 block">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </span>
                
                <h3 className="font-serif text-xl font-bold text-primary mb-3 leading-tight group-hover:text-accent transition-colors">
                  {post.titulo}
                </h3>
                
                <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow">
                  {post.resumo}
                </p>
                
                {/* Link (Por enquanto vai para #, depois criamos a página do post) */}
                <div className="mt-auto">
                   <Link href={`/blog/${post.id}`} className="inline-flex items-center text-primary font-semibold text-sm hover:text-accent transition-colors">
                    Ler Artigo <FaArrowRight className="ml-2 text-xs" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}