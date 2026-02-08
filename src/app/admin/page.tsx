"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaLock, FaUserMd } from "react-icons/fa";
import { Button } from "@/components/ui/Button";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // Tenta logar no Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro("Email ou senha incorretos.");
      setLoading(false);
    } else {
      // Se der certo, redireciona para o Dashboard (que vamos criar a seguir)
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center px-6">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-primary">
        
        {/* Cabeçalho do Login */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <FaUserMd size={40} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary">Área Restrita</h1>
          <p className="text-gray-400 text-sm mt-2">Acesso exclusivo para administração.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded p-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              placeholder="admin@parrela.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Senha</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded p-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all pl-10"
                placeholder="••••••••"
                required
              />
              <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm" />
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded text-center border border-red-100">
              {erro}
            </div>
          )}

          <Button variant="primary" className="w-full py-4 shadow-lg">
            {loading ? "Entrando..." : "Acessar Painel"}
          </Button>

        </form>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
            ← Voltar ao site
          </a>
        </div>

      </div>
    </div>
  );
}