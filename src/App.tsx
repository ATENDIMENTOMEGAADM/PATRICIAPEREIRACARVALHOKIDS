import React, { useState, useEffect } from 'react';
import { Home, User, MapPin, Phone, Clock, Baby, Stethoscope, Apple, Heart, ChevronDown, Star, MessageCircle, Instagram, FileText, AlertCircle, Calendar, Info, X, Send, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './components/Logo';

// --- Cores do Tema ---
// Off-white seda: #FAF7F2
// Verde Água: #86B9B0
// Lilás Suave: #E6E1F0
// Ametista: #9B8ABF
// Dourado Champagne: #C5A059
// Texto Escuro: #5A5350

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);


export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatData, setChatData] = useState({ nome: '', assunto: '' });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá! Meu nome é ${chatData.nome}. Gostaria de falar sobre: ${chatData.assunto}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/5594992018972?text=${encodedText}`, '_blank');
    setIsChatOpen(false);
    setChatData({ nome: '', assunto: '' });
  };

  const whatsappLink = "https://wa.me/5594992018972?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Patr%C3%ADcia%20Carvalho.";

  return (
    <div className="min-h-screen bg-seda text-[#5A5350] font-sans pb-20 md:pb-0">
      <style>{`
        @media (max-width: 767px) {
          .mobile-fade-logo {
            opacity: ${Math.max(0, 1 - scrollY / 250)};
            pointer-events: ${scrollY > 150 ? 'none' : 'auto'};
            transform: translateY(${Math.max(-30, -scrollY / 5)}px);
            transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          }
        }
      `}</style>
      
      {/* --- Navegação --- */}
      <nav className="fixed md:sticky top-0 z-40 w-full pointer-events-none md:pointer-events-auto md:bg-white/95 md:backdrop-blur-xl md:border-b md:border-gray-100 md:shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-0 pointer-events-none md:pointer-events-auto">
          <div className="flex justify-center md:justify-between items-center h-auto md:h-40 py-2 md:py-0">
            {/* Logo / Nome */}
            <a href="#" className="flex-shrink-0 flex items-center mobile-fade-logo pointer-events-auto">
              <div className="h-40 sm:h-56 md:h-44 lg:h-48 w-auto">
                <Logo />
              </div>
            </a>

            {/* Menu Desktop */}
            <div className="hidden md:flex space-x-8">
              <a href="#sobre" className="text-sm font-medium text-gray-600 hover:text-verde-agua transition-colors">Sobre mim</a>
              <a href="#servicos" className="text-sm font-medium text-gray-600 hover:text-verde-agua transition-colors">Serviços</a>
              <a href="#consulta" className="text-sm font-medium text-gray-600 hover:text-verde-agua transition-colors">A Consulta</a>
              <a href="#localizacao" className="text-sm font-medium text-gray-600 hover:text-verde-agua transition-colors">Localização</a>
            </div>

            {/* Botão Agendar Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <a 
                href="https://instagram.com/patricia.gastroped" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-dourado transition-colors"
              >
                <Instagram className="w-5 h-5 text-dourado" />
              </a>
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-dourado hover:bg-dourado/90 transition-colors shadow-sm"
              >
                Agendar Consulta
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative bg-seda overflow-hidden bg-polka">
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            {/* Texto */}
            <FadeIn delay={0.1} className="w-full md:w-1/2 px-6 pt-44 sm:pt-56 md:py-24 lg:py-32 z-10">
              <div className="flex flex-col gap-2 mb-8">
                <h1 className="font-serif text-6xl md:text-8xl font-light text-black leading-none tracking-tight">
                  Patrícia
                </h1>
                <h1 className="font-serif text-6xl md:text-8xl font-light text-dourado leading-none tracking-tight">
                  Carvalho
                </h1>
                <div className="mt-6 flex flex-col gap-3 items-start">
                  <span className="bg-verde-agua/10 text-[#4A6661] px-6 py-2 rounded-full text-lg md:text-xl font-medium shadow-sm border border-verde-agua/20">
                    Pediatra & Gastropediatra
                  </span>
                  <span className="bg-lilas/40 text-[#6D5A94] px-5 py-1.5 rounded-full text-base md:text-lg font-medium shadow-sm border border-lilas">
                    CRM-PA 11040 | RQE 9798 | RQE 9802
                  </span>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed text-left sm:text-justify">
                Cuidado especializado e humanizado em saúde digestiva e pediatria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <a 
                  href="#anamnese"
                  className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-dourado hover:bg-dourado/90 transition-colors shadow-md"
                >
                  Agendar Consulta
                </a>
                <a 
                  href="https://www.instagram.com/dra.patriciapereiracarvalho/"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex justify-center items-center px-8 py-3.5 border-2 border-dourado/20 text-base font-medium rounded-full text-[#5A5350] hover:bg-white transition-colors shadow-sm"
                >
                  <div className="p-1.5 rounded-lg bg-dourado text-white mr-2">
                    <Instagram className="w-4 h-4" />
                  </div>
                  @dra.patriciapereiracarvalho
                </a>
              </div>
            </FadeIn>
            
            {/* Imagem */}
            <FadeIn delay={0.3} className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
              <img 
                src="https://raw.githubusercontent.com/patriciapereiracarvalhokids-ctrl/fotos/main/IMG_2247.PNG" 
                alt="Dra. Patricia Carvalho" 
                className="absolute inset-0 w-full h-full object-cover object-top rounded-bl-[100px] md:rounded-bl-[200px] border-l-4 border-b-4 border-dourado/10"
                referrerPolicy="no-referrer"
              />
              {/* Gradientes para suavizar as bordas */}
              <div className="absolute inset-0 bg-gradient-to-t from-seda via-transparent to-transparent md:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-seda via-transparent to-transparent hidden md:block w-32"></div>
            </FadeIn>
          </div>
        </div>
      </section>



      {/* --- Sobre Mim Section --- */}
      <section id="sobre" className="py-20 bg-seda">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Imagem */}
            <FadeIn delay={0.1} className="w-full lg:w-[45%] relative">
              <div className="relative">
                <div className="absolute inset-0 bg-dourado/20 rounded-[40px] transform translate-x-4 translate-y-4 border border-dourado/30"></div>
                <img 
                  src="https://raw.githubusercontent.com/patriciapereiracarvalhokids-ctrl/fotos/main/IMG_2247.PNG" 
                  alt="Dra. Patricia Carvalho" 
                  className="relative rounded-[40px] shadow-lg w-full object-cover object-top border-4 border-white"
                  referrerPolicy="no-referrer"
                />
              </div>
            </FadeIn>

            {/* Texto */}
            <FadeIn delay={0.3} className="w-full lg:w-[55%]">
              <h2 className="font-serif text-3xl md:text-5xl font-medium text-[#5A5350] mb-2">
                Dra. Patrícia Pereira Carvalho
              </h2>
              <p className="text-verde-agua font-semibold mb-6 text-lg">
                CRM-PA 11040 | RQE 9798 (Pediatria) | RQE 9802 (Gastropediatria)
              </p>
              
              <div className="mb-8">
                <h3 className="font-serif text-xl font-semibold text-dourado mb-6 flex items-center">
                  <span className="w-8 h-[1px] bg-dourado mr-3"></span>
                  Formação Acadêmica
                </h3>
                <div className="space-y-6 relative border-l border-dourado/30 ml-4 pl-8">
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-dourado border-4 border-seda"></div>
                    <div className="font-bold text-dourado">2012</div>
                    <div className="text-gray-700">Médica pela Universidade do Estado do Pará</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-dourado border-4 border-seda"></div>
                    <div className="font-bold text-dourado">2022</div>
                    <div className="text-gray-700">Pediatra pela Fundação Santa Casa de Misericórdia do Pará</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-dourado border-4 border-seda"></div>
                    <div className="font-bold text-dourado">2024</div>
                    <div className="text-gray-700">Gastropediatra pela Universidade Federal do Rio Grande do Norte</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 leading-relaxed mb-8 text-left sm:text-justify">
                <p>
                  Mais do que dez anos de formação acadêmica, foram anos de aprendizado sobre o que realmente importa: a vida e o bem-estar de quem você mais ama.
                </p>
                <p>
                  Essa jornada me ensinou que ser pediatra e gastropediatra é caminhar lado a lado com os pais, oferecendo suporte especializado em cada descoberta ou dificuldade.
                </p>
              </div>

              <div className="bg-white/50 border-l-4 border-dourado p-6 rounded-r-2xl mb-8">
                <p className="text-gray-700 italic leading-relaxed">
                  "Vivenciar a alergia alimentar na minha própria casa me deu a clareza necessária para humanizar cada detalhe do atendimento, garantindo que cada pequeno paciente receba não apenas cuidado médico, mas verdadeiro respeito e atenção."
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="#anamnese"
                  className="inline-block bg-dourado text-white font-medium px-8 py-3 rounded-full hover:bg-dourado/90 transition-colors shadow-md"
                >
                  Agendar Consulta
                </a>
                <a 
                  href="https://instagram.com/patricia.gastroped" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-dourado hover:text-dourado/80 transition-colors font-medium"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  @patricia.gastroped
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Áreas de Atuação Section --- */}
      <section id="servicos" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-16">
            <h2 className="text-sm font-semibold text-verde-agua tracking-widest uppercase mb-3">Áreas de Atuação</h2>
            <h3 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Nossas Especialidades</h3>
            <div className="w-16 h-1 bg-dourado mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cuidado completo e especializado para a saúde do seu filho
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
            {/* Coluna 1: Gastropediatria */}
            <FadeIn delay={0.1} className="space-y-8 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-lilas/30 rounded-xl flex items-center justify-center text-ametista">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#5A5350]">Gastropediatria</h4>
              </div>

              <div className="space-y-6">
                <div className="bg-seda p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <h5 className="font-serif text-lg font-bold text-ametista mb-2">Alergias e Intolerâncias</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Diagnóstico e manejo de APLV (Alergia à Proteína do Leite de Vaca), Alergias Alimentares e Intolerâncias.
                  </p>
                </div>

                <div className="bg-seda p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <h5 className="font-serif text-lg font-bold text-ametista mb-2">Distúrbios Digestivos Comuns</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Tratamento de Refluxo Gastroesofágico, Gastrite, Vômitos, Constipação Intestinal e Diarreia.
                  </p>
                </div>

                <div className="bg-seda p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <h5 className="font-serif text-lg font-bold text-ametista mb-2">Saúde Abdominal e Intestinal</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Dor Abdominal, Sangramentos Intestinais, Doenças Inflamatórias Intestinais, Doença Celíaca, Má-absorção intestinal e baixo ganho de peso.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Coluna 2: Pediatria */}
            <FadeIn delay={0.2} className="space-y-8 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-verde-agua/20 rounded-xl flex items-center justify-center text-verde-agua">
                  <Baby className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#5A5350]">Pediatria Geral</h4>
              </div>

              <div className="space-y-6">
                <div className="bg-seda p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <h5 className="font-serif text-lg font-bold text-verde-agua mb-2">Puericultura</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Acompanhamento integral do crescimento e desenvolvimento, do nascimento à adolescência.
                  </p>
                </div>

                <div className="bg-seda p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <h5 className="font-serif text-lg font-bold text-verde-agua mb-2">Urgências Pediátricas</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Atendimento resolutivo para síndromes febris, afecções respiratórias, intestinais e dermatológicas.
                  </p>
                </div>

                <div className="bg-seda p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <h5 className="font-serif text-lg font-bold text-verde-agua mb-2">Introdução Alimentar Guiada</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Um guia prático e seguro para o início da alimentação sólida, respeitando o tempo, a prontidão e as necessidades individuais do seu bebê.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Coluna Foto */}
            <FadeIn delay={0.3} className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 bg-lilas/20 rounded-[40px] transform rotate-3"></div>
                <img 
                  src="https://raw.githubusercontent.com/patriciapereiracarvalhokids-ctrl/fotos/main/IMG_2247.PNG" 
                  alt="Dra. Patricia Carvalho" 
                  className="relative rounded-[30px] shadow-xl w-full aspect-[4/5] object-cover object-top border-4 border-white"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-dourado/20 rounded-full blur-2xl"></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>




      {/* --- Diferenciais Section --- */}
      <section id="consulta" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-16">
            <h2 className="text-sm font-semibold text-verde-agua tracking-widest uppercase mb-3">Diferenciais</h2>
            <h3 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">
              Uma experiência de cuidado com<br />olhar atento e sem pressa
            </h3>
            <div className="w-16 h-1 bg-dourado mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Entendo que cada criança é única. Por isso, analiso cada detalhe da história do seu filho em momentos essenciais:
            </p>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-12 items-stretch">
            {/* Coluna Foto */}
            <FadeIn delay={0.1} className="w-full lg:w-1/2">
              <div className="relative h-full">
                <div className="absolute -inset-4 bg-verde-agua/10 rounded-[40px] transform -rotate-3"></div>
                <img 
                  src="https://raw.githubusercontent.com/patriciapereiracarvalhokids-ctrl/fotos/main/IMG_2246.PNG" 
                  alt="Atendimento Pediatria" 
                  className="relative rounded-[30px] shadow-lg w-full h-full object-cover border-4 border-white"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1/2 -left-8 w-16 h-16 bg-lilas/30 rounded-full blur-xl"></div>
              </div>
            </FadeIn>

            {/* Coluna Blocos */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FadeIn delay={0.2} className="bg-seda p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-verde-agua/20 rounded-2xl flex items-center justify-center text-verde-agua mb-6 group-hover:bg-verde-agua group-hover:text-white transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#5A5350] mb-3">Acolhimento e Escuta</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Foco total na queixa atual e preocupações da família.
                </p>
              </FadeIn>

              <FadeIn delay={0.3} className="bg-seda p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-lilas/40 rounded-2xl flex items-center justify-center text-ametista mb-6 group-hover:bg-ametista group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#5A5350] mb-3">Análise do Cotidiano</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Avaliação minuciosa da rotina, alimentação e hábitos.
                </p>
              </FadeIn>

              <FadeIn delay={0.4} className="bg-seda p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-verde-agua/20 rounded-2xl flex items-center justify-center text-verde-agua mb-6 group-hover:bg-verde-agua group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#5A5350] mb-3">Histórico de Vida e Contexto Familiar</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Análise dos antecedentes, dados de nascimento e histórico de saúde familiar.
                </p>
              </FadeIn>

              <FadeIn delay={0.5} className="bg-seda p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-lilas/40 rounded-2xl flex items-center justify-center text-ametista mb-6 group-hover:bg-ametista group-hover:text-white transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#5A5350] mb-3">Exame Físico Detalhado</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Avaliação minuciosa da saúde física e crescimento.
                </p>
              </FadeIn>

              <FadeIn delay={0.6} className="bg-seda p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-verde-agua/20 rounded-2xl flex items-center justify-center text-verde-agua mb-6 group-hover:bg-verde-agua group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#5A5350] mb-3">Raciocínio Diagnóstico</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Elaboração baseada nas evidências coletadas.
                </p>
              </FadeIn>

              <FadeIn delay={0.7} className="bg-seda p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-lilas/40 rounded-2xl flex items-center justify-center text-ametista mb-6 group-hover:bg-ametista group-hover:text-white transition-colors">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#5A5350] mb-3">Plano Terapêutico</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Definição conjunta das estratégias de tratamento.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* --- Depoimentos Section --- */}
      <section className="py-20 bg-lilas/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Depoimentos</h2>
            <div className="w-16 h-1 bg-verde-agua mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600">O que as famílias dizem sobre o nosso cuidado.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <FadeIn delay={0.1} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">M</div>
                <div className="ml-4">
                  <h4 className="font-medium text-[#5A5350]">Mariana Silva</h4>
                  <div className="flex text-yellow-400 text-sm mt-1">
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic text-left sm:text-justify">
                "Sou grata a Deus por ter encontrado a Dra. Patricia. Ela sempre nos atende com muito carinho e paciência, tirando todas as nossas dúvidas. Recomendo fortemente!"
              </p>
            </FadeIn>

            {/* Depoimento 2 */}
            <FadeIn delay={0.2} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">C</div>
                <div className="ml-4">
                  <h4 className="font-medium text-[#5A5350]">Camila Costa</h4>
                  <div className="flex text-yellow-400 text-sm mt-1">
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic text-left sm:text-justify">
                "Profissional extremamente competente e atenciosa. Chegamos ao consultório cheios de dúvidas sobre a alimentação do nosso bebê e saímos com o coração leve."
              </p>
            </FadeIn>

            {/* Depoimento 3 */}
            <FadeIn delay={0.3} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">A</div>
                <div className="ml-4">
                  <h4 className="font-medium text-[#5A5350]">Aline Barros</h4>
                  <div className="flex text-yellow-400 text-sm mt-1">
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                    <Star fill="currentColor" size={14} />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic text-left sm:text-justify">
                "Uma profissional excepcional! Explica cada detalhe com muita clareza. Obrigada Dra. por cuidar tão bem do meu filho. Recomendo de olhos fechados!"
              </p>
            </FadeIn>
          </div>
        </div>
      </section>




      {/* --- Localização Section --- */}
      <section id="localizacao" className="py-20 bg-seda bg-polka relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Atendimento</h2>
            <div className="w-16 h-1 bg-verde-agua mx-auto rounded-full"></div>
          </FadeIn>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Mapa Placeholder */}
            <FadeIn delay={0.2} className="w-full md:w-1/2 h-[400px] bg-gray-200 rounded-[30px] overflow-hidden shadow-inner relative border-4 border-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.8123456789!2d-49.1234567!3d-5.3644682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjEnNTIuMSJTIDQ5wrAwNycxMi40Ilc!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Marabá"
              ></iframe>
            </FadeIn>

            {/* Informações */}
            <FadeIn delay={0.4} className="w-full md:w-1/2 space-y-8 bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-verde-agua/20 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-verde-agua" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-[#5A5350]">Endereço</h3>
                  <p className="mt-1 text-gray-600 leading-relaxed">
                    Av. Itacaiúnas, 1730<br />
                    Cidade Nova<br />
                    Marabá - PA
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/kJfJT2VcvQ1pLhoQ9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-verde-agua hover:text-verde-agua/80 underline underline-offset-4"
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-verde-agua/20 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-verde-agua" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-[#5A5350]">Telefone / WhatsApp</h3>
                  <p className="mt-1 text-gray-600">(94) 992018972</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Dicas da Pediatra Section (Blog) --- */}
      <section id="dicas" className="py-20 bg-seda">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-sm font-semibold text-verde-agua tracking-widest uppercase mb-3">Blog & Informação</h2>
            <h3 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350]">Dicas da Pediatra</h3>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Artigos rápidos e orientações práticas para ajudar você a cuidar do seu maior tesouro com mais segurança e tranquilidade.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <FadeIn delay={0.1} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800" 
                  alt="APLV vs Intolerância à Lactose" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-verde-agua shadow-sm">
                  Alergia Alimentar
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-lg font-medium text-[#5A5350] mb-3 group-hover:text-verde-agua transition-colors line-clamp-2">
                  APLV x Intolerância a lactose.
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  Muitos pais confundem APLV com Intolerância à Lactose, mas são condições bem diferentes.
                </p>
                <a 
                  href="https://www.instagram.com/reel/C_6qcpiykGA/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-verde-agua font-medium text-sm hover:text-verde-agua/80 transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn delay={0.2} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800" 
                  alt="Bebê no peniquinho" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-verde-agua shadow-sm">
                  Saúde Digestiva
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-lg font-medium text-[#5A5350] mb-3 group-hover:text-verde-agua transition-colors line-clamp-2">
                  Seu filho sofre com constipação intestinal?
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  A constipação é uma queixa comum, mas que exige atenção. Entenda os sinais e causas.
                </p>
                <a 
                  href="https://www.instagram.com/p/C_iXniNOvcm/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-verde-agua font-medium text-sm hover:text-verde-agua/80 transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn delay={0.3} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=800" 
                  alt="Refluxo no bebê" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-verde-agua shadow-sm">
                  Gastropediatria
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-lg font-medium text-[#5A5350] mb-3 group-hover:text-verde-agua transition-colors line-clamp-2">
                  Refluxo no bebê, quando me preocupar?
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  O refluxo é comum em bebês, mas quando ele deixa de ser fisiológico? Saiba identificar.
                </p>
                <a 
                  href="https://www.instagram.com/p/C_GmqlYy1MP/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-verde-agua font-medium text-sm hover:text-verde-agua/80 transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>

            {/* Card 4 */}
            <FadeIn delay={0.4} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800" 
                  alt="Suspeita de APLV" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-verde-agua shadow-sm">
                  Alergia Alimentar
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-lg font-medium text-[#5A5350] mb-3 group-hover:text-verde-agua transition-colors line-clamp-2">
                  Será que é APLV?
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  Sintomas gastrointestinais, pele irritada ou choro excessivo? Descubra se esses sinais podem indicar Alergia à Proteína do Leite de Vaca.
                </p>
                <a 
                  href="https://www.instagram.com/reel/C_rmOaANGJR/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-verde-agua font-medium text-sm hover:text-verde-agua/80 transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>
          </div>
          
          <FadeIn delay={0.4} className="mt-16 text-center">
            <a 
              href="https://www.instagram.com/dra.patriciapereiracarvalho/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-verde-agua text-base font-medium rounded-full text-verde-agua hover:bg-verde-agua hover:text-white transition-colors shadow-sm"
            >
              <Instagram className="w-5 h-5 mr-2" />
              Acompanhe mais dicas no Instagram
            </a>
          </FadeIn>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Perguntas Frequentes</h2>
            <div className="w-16 h-1 bg-verde-agua mx-auto rounded-full"></div>
          </FadeIn>

          <FadeIn delay={0.2} className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(0)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-seda hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#5A5350]">Qual a duração da consulta?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === 0 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 0 && (
                <div className="px-6 py-4 bg-white text-gray-600 border-t border-gray-100 text-left sm:text-justify">
                  A primeira consulta costuma durar cerca de 1 hora, pois faço questão de conhecer todo o histórico da criança, tirar todas as dúvidas dos pais e realizar um exame físico detalhado sem pressa.
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-[#FDFBF9] hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#5A5350]">Atende convênio?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="px-6 py-6 bg-white text-gray-600 border-t border-gray-100">
                  <p className="mb-4">Aceito os planos abaixo e também atendimentos particulares:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-16 h-12 flex items-center justify-center mb-2">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Vale_logo.svg/2560px-Vale_logo.svg.png" 
                          alt="Vale" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#5A5350]">Vale</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-16 h-12 flex items-center justify-center mb-2">
                        <img 
                          src="https://suldoparasaude.com.br/wp-content/uploads/2021/08/logo-sul-do-para-saude.png" 
                          alt="Sul do Pará Saúde" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#5A5350]">Sul do Pará</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-16 h-12 flex items-center justify-center mb-2">
                        <img 
                          src="https://salutebeneficios.com.br/wp-content/uploads/2022/07/logo-salute-beneficios.png" 
                          alt="Salute Benefícios" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#5A5350]">Salute</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <span className="text-xs font-semibold text-[#5A5350]">Particular</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-[#FDFBF9] hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#5A5350]">Qual a faixa etária atendida?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="px-6 py-4 bg-white text-gray-600 border-t border-gray-100 text-left sm:text-justify">
                  Atendimento especializado para crianças e adolescentes de 0 a 14 anos.
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-[#FDFBF9] hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#5A5350]">O que levar para a consulta?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 3 && (
                <div className="px-6 py-4 bg-white text-gray-600 border-t border-gray-100 text-left sm:text-justify">
                  Para uma avaliação completa, é importante trazer:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Caderneta da criança;</li>
                    <li>Dados do nascimento e Teste do Pezinho;</li>
                    <li>Fotos e vídeos que você considere relevantes (ex: comportamento, sintomas);</li>
                    <li>Lista de medicações ou vitaminas em uso atual.</li>
                  </ul>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-lilas/30 pt-20 pb-12 relative overflow-hidden mt-10">
        {/* Wave SVG */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF"></path>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Coluna 1: Sobre */}
            <div className="col-span-1 lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-32 md:h-40 w-auto mb-6">
                <Logo />
              </div>
            </div>

            {/* Coluna 2: Links Rápidos */}
            <div>
              <h3 className="font-serif text-lg font-medium text-[#5A5350] mb-4">Links Rápidos</h3>
              <ul className="space-y-3">
                <li><a href="#sobre" className="text-gray-600 hover:text-verde-agua text-sm transition-colors">Sobre mim</a></li>
                <li><a href="#servicos" className="text-gray-600 hover:text-verde-agua text-sm transition-colors">Serviços</a></li>
                <li><a href="#consulta" className="text-gray-600 hover:text-verde-agua text-sm transition-colors">A Consulta</a></li>
              </ul>
            </div>

            {/* Coluna 3: Contato */}
            <div>
              <h3 className="font-serif text-lg font-medium text-[#5A5350] mb-4">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-verde-agua mr-2 flex-shrink-0 mt-0.5" />
                  <span>Av. Itacaiúnas, 1730<br/>Cidade Nova, Marabá - PA</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-verde-agua mr-2 flex-shrink-0" />
                  <span>(94) 992018972</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Instagram className="w-4 h-4 text-dourado mr-2 flex-shrink-0" />
                  <a href="https://www.instagram.com/dra.patriciapereiracarvalho/" target="_blank" rel="noopener noreferrer" className="hover:text-dourado transition-colors">
                    @dra.patriciapereiracarvalho
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais */}
            <div>
              <h3 className="font-serif text-lg font-medium text-[#5A5350] mb-4">Conecte-se</h3>
              <div className="flex space-x-4 mb-6">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-verde-agua hover:bg-verde-agua hover:text-white transition-all shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/dra.patriciapereiracarvalho/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden group">
                  <div className="w-full h-full flex items-center justify-center bg-dourado text-white transition-transform group-hover:scale-110">
                    <Instagram className="w-5 h-5" />
                  </div>
                </a>
              </div>
            </div>
          </FadeIn>
          
          <div className="border-t border-[#D1AFA6]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Cuidado especializado e humanizado em saúde digestiva e pediatria.
              </p>
              <p className="text-dourado font-bold text-xs tracking-wider uppercase">
                CRM-PA 11040 | RQE 9802
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-gray-500 text-xs text-center md:text-right">
                &copy; {new Date().getFullYear()} Dra. Patricia Pereira Carvalho. Todos os direitos reservados.
              </p>
              <p className="text-gray-400 text-[10px] flex items-center mt-1">
                Feito com <Heart className="w-3 h-3 text-[#FF9B9B] mx-1 fill-current" /> para o seu bebê
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* --- WhatsApp Floating Button & Chat Widget --- */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* Chat Popover */}
        {isChatOpen && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 w-[calc(100vw-2rem)] md:w-80 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right pointer-events-auto">
            <div className="bg-verde-agua p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Dra. Patricia Carvalho</h4>
                  <p className="text-xs text-white/80">Atendimento online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleChatSubmit} className="p-5 space-y-4">
              <p className="text-sm text-gray-600 mb-2">Olá! Preencha os dados abaixo para iniciar o atendimento via WhatsApp.</p>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  value={chatData.nome}
                  onChange={(e) => setChatData({...chatData, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-agua/20 focus:border-verde-agua outline-none transition-all"
                  placeholder="Como podemos te chamar?"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assunto</label>
                <select 
                  required
                  value={chatData.assunto}
                  onChange={(e) => setChatData({...chatData, assunto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-agua/20 focus:border-verde-agua outline-none transition-all bg-white"
                >
                  <option value="" disabled>Selecione o assunto</option>
                  <option value="Agendar Consulta">Agendar Consulta</option>
                  <option value="Dúvida sobre Serviços">Dúvida sobre Serviços</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-dourado hover:bg-dourado/90 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4" />
                Iniciar Conversa
              </button>
            </form>
          </div>
        )}

        {/* Balão de mensagem (Desktop) - Oculta se o chat estiver aberto */}
        {!isChatOpen && (
          <div className="bg-white text-[#5A5350] px-5 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 animate-bounce origin-bottom-right hidden md:block pointer-events-auto relative cursor-pointer" onClick={() => setIsChatOpen(true)}>
            <p className="text-sm font-medium">Olá! Precisa de ajuda?</p>
            <p className="text-xs text-gray-500 mt-0.5">Fale com nossa equipe</p>
            {/* Triângulo do balão */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
          </div>
        )}
        
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`group flex items-center gap-3 text-white p-3.5 md:px-6 md:py-3.5 rounded-full shadow-[0_8px_30px_rgba(134,185,176,0.3)] transition-all duration-300 pointer-events-auto ${isChatOpen ? 'bg-gray-800 hover:bg-gray-700 shadow-gray-800/30' : 'bg-verde-agua hover:bg-verde-agua/90 hover:-translate-y-1'}`}
          aria-label="Fale conosco no WhatsApp"
        >
          <div className="relative flex items-center justify-center">
            {!isChatOpen && <div className="absolute inset-0 bg-white rounded-full opacity-40 animate-ping"></div>}
            {isChatOpen ? <X className="w-6 h-6 md:w-6 md:h-6 relative z-10" /> : <MessageCircle className="w-6 h-6 md:w-6 md:h-6 relative z-10" />}
          </div>
          <span className="hidden md:block font-medium text-sm tracking-wide">
            {isChatOpen ? 'Fechar' : 'Fale Conosco'}
          </span>
        </button>
      </div>

      {/* --- Bottom Navigation (Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-end h-16 px-2 pb-2">
          <a href="#" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-verde-agua active:text-verde-agua transition-colors">
            <Home className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Início</span>
          </a>
          <a href="#servicos" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-verde-agua active:text-verde-agua transition-colors">
            <Stethoscope className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Serviços</span>
          </a>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center w-full relative -top-5"
          >
            <div className="bg-verde-agua text-white p-4 rounded-full shadow-lg border-4 border-white flex items-center justify-center transform transition-transform active:scale-95">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-verde-agua mt-1 font-bold">Agendar</span>
          </a>
          <a href="#sobre" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-verde-agua active:text-verde-agua transition-colors">
            <User className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Sobre</span>
          </a>
          <a href="#localizacao" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-verde-agua active:text-verde-agua transition-colors">
            <MapPin className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Local</span>
          </a>
        </div>
      </nav>

    </div>
  );
}
