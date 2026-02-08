import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaCalendar, FaUserMd, FaBook } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { ImageFallback } from "@/components/ui/ImageFallback"; // <--- IMPORTAR

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-gray-900 overflow-hidden">
        
        {/* IMAGEM DE FUNDO SEGURA (MUDANÇA AQUI) */}
        <div className="absolute inset-0 opacity-60">
           <ImageFallback 
             src={post.imagem_url} 
             alt={post.titulo}
             className="w-full h-full object-cover"
           />
        </div>
        
        {/* Overlay Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

        {/* Conteúdo do Título */}
        <div className="relative container mx-auto px-6 z-10 pt-10">
          <Link href="/#blog" className="inline-flex items-center gap-2 text-white/80 hover:text-accent mb-8 transition-colors uppercase text-xs font-bold tracking-widest bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <FaArrowLeft /> Voltar ao Blog
          </Link>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-5xl mx-auto drop-shadow-lg">
            {post.titulo}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-200 text-sm">
            <span className="flex items-center gap-2">
              <FaCalendar className="text-accent" />
              {new Date(post.created_at).toLocaleDateString('pt-BR')}
            </span>
            <span className="flex items-center gap-2">
              <FaUserMd className="text-accent" />
              Dr. Rômulo Parrela
            </span>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO --- */}
      <article className="container mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white p-8 md:p-16 rounded-xl shadow-2xl max-w-4xl mx-auto border border-gray-100">
          
          {post.resumo && (
            <p className="text-xl md:text-2xl text-gray-600 font-serif italic border-l-4 border-accent pl-6 mb-12 leading-relaxed bg-gray-50 py-6 pr-4 rounded-r-lg">
              "{post.resumo}"
            </p>
          )}

          <div className="prose prose-lg prose-slate max-w-none text-gray-700 leading-8 whitespace-pre-wrap">
            {post.conteudo}
          </div>

          {post.bibliografia && (
            <div className="mt-16 p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider border-b border-gray-200 pb-2">
                <FaBook className="text-accent" /> Fontes e Referências
              </h4>
              <p className="text-sm text-gray-500 italic whitespace-pre-wrap leading-relaxed">
                {post.bibliografia}
              </p>
            </div>
          )}

          <div className="mt-16 pt-12 border-t border-gray-100 text-center">
            <h3 className="font-serif text-2xl font-bold text-primary mb-4">Precisa de orientação especializada?</h3>
            <Link href="/#contato">
              <Button variant="primary" className="shadow-lg px-8 py-3">
                Agendar Consultoria
              </Button>
            </Link>
          </div>

        </div>
      </article>
    </div>
  );
}