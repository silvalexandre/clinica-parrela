import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header"; // <--- Trazendo o Menu de volta
import { Footer } from "@/components/Footer"; // <--- Trazendo o Rodapé de volta

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dr. Rômulo Parrela | Medicina Ocupacional",
  description: "Clínica especializada em Medicina Ocupacional e Segurança do Trabalho.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        
        {/* O MENU DE NAVEGAÇÃO (TOPO) */}
        <Header />

        {/* O CONTEÚDO DA PÁGINA (DASHBOARD, HOME, ETC) */}
        {children}

        {/* O RODAPÉ (FOOTER) */}
        <Footer />

      </body>
    </html>
  );
}