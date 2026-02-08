// src/components/ServicesSection.tsx
import { FaCheck, FaShieldAlt, FaChalkboardTeacher, FaSyringe, FaMicroscope } from "react-icons/fa";

export function ServicesSection() {
  return (
    <section id="servicos" className="py-24 bg-soft">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">Soluções Integradas</h2>
          <div className="w-16 h-1 bg-accent mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Exames */}
          <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-transparent hover:border-accent">
            <h3 className="font-serif text-2xl font-bold text-primary mb-6 pb-4 border-b border-gray-100">
              Exames Ocupacionais
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600">
                <FaCheck className="text-accent mt-1 flex-shrink-0" /> 
                <strong>Admissional e Periódico</strong>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FaCheck className="text-accent mt-1 flex-shrink-0" /> 
                Retorno ao Trabalho
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FaCheck className="text-accent mt-1 flex-shrink-0" /> 
                Mudança de Função e Demissional
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FaMicroscope className="text-accent mt-1 flex-shrink-0" /> 
                <div>
                  <strong>Exames Complementares (NRs)</strong>
                  <p className="text-sm text-gray-400 mt-1">Audiometria, Espirometria, ECG, Raio-X...</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Estratégia */}
          <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-transparent hover:border-accent">
            <h3 className="font-serif text-2xl font-bold text-primary mb-6 pb-4 border-b border-gray-100">
              Estratégia & Prevenção
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-gray-600">
                <div className="bg-primary/5 p-3 rounded-full text-primary">
                  <FaShieldAlt className="text-xl" />
                </div>
                <div>
                  <strong className="block text-primary">Consultoria PGR/PCMSO</strong>
                  <span className="text-sm">Gestão completa de riscos e saúde.</span>
                </div>
              </li>
              <li className="flex items-start gap-4 text-gray-600">
                 <div className="bg-primary/5 p-3 rounded-full text-primary">
                  <FaChalkboardTeacher className="text-xl" />
                </div>
                <div>
                  <strong className="block text-primary">Palestras e Treinamentos</strong>
                  <span className="text-sm">Educação corporativa e SIPAT.</span>
                </div>
              </li>
              <li className="flex items-start gap-4 text-gray-600">
                 <div className="bg-primary/5 p-3 rounded-full text-primary">
                  <FaSyringe className="text-xl" />
                </div>
                <div>
                  <strong className="block text-primary">Vacinação Corporativa</strong>
                  <span className="text-sm">Campanhas in-company.</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}