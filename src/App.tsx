import React, { useState, useEffect } from 'react';
import { Home, User, MapPin, Phone, Clock, Baby, Stethoscope, Apple, Heart, ChevronDown, Star, MessageCircle, Instagram, FileText, AlertCircle, Calendar, Info, X, Send, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

// --- Cores do Tema ---
// Verde Menta: #A8D0C6
// Rosa Antigo: #EAD5D1
// Fundo Claro: #FDFBF9
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

const timelineData = [
  {
    id: 'newborn',
    title: 'Recém-nascido',
    age: '0 a 1 mês',
    icon: <Baby className="w-6 h-6" />,
    milestones: ['Reflexos primitivos', 'Fixa o olhar brevemente', 'Reconhece a voz da mãe'],
    consultations: ['Primeira consulta (5 a 7 dias)', 'Avaliação do ganho de peso', 'Apoio e orientação à amamentação'],
    vaccines: ['BCG (Tuberculose)', 'Hepatite B (1ª dose)']
  },
  {
    id: '3months',
    title: '3 Meses',
    age: '3 meses',
    icon: <Star className="w-6 h-6" />,
    milestones: ['Sustenta bem a cabeça', 'Sorriso social', 'Acompanha objetos com os olhos'],
    consultations: ['Consulta mensal de puericultura', 'Acompanhamento do desenvolvimento motor'],
    vaccines: ['Meningocócica C (1ª dose)', 'Pneumocócica 10 (1ª dose)', 'Rotavírus (1ª dose)']
  },
  {
    id: '6months',
    title: '6 Meses',
    age: '6 meses',
    icon: <Apple className="w-6 h-6" />,
    milestones: ['Senta com apoio', 'Rola sobre o próprio corpo', 'Balbucia os primeiros sons'],
    consultations: ['Consulta de rotina', 'Orientações sobre introdução alimentar', 'Avaliação do sono'],
    vaccines: ['Pentavalente (3ª dose)', 'VIP (3ª dose)', 'Rotavírus (3ª dose)']
  },
  {
    id: '1year',
    title: '1 Ano',
    age: '12 meses',
    icon: <Heart className="w-6 h-6" />,
    milestones: ['Fica em pé sozinho', 'Dá os primeiros passos', 'Fala as primeiras palavras'],
    consultations: ['Consulta de 1 ano', 'Avaliação do crescimento', 'Transição para a dieta da família'],
    vaccines: ['Tríplice Viral (1ª dose)', 'Pneumocócica 10 (Reforço)', 'Meningocócica C (Reforço)']
  }
];

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [chatData, setChatData] = useState({ nome: '', assunto: '' });
  const [formData, setFormData] = useState({
    responsavel: '',
    crianca: '',
    nascimento: '',
    motivo: '',
    alergias: '',
    medicamentos: '',
    data1: '', horario1: '',
    data2: '', horario2: '',
    data3: '', horario3: ''
  });

  const getAvailableTimes = (dateStr: string) => {
    if (!dateStr) return [];
    const [year, month, dayStr] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(dayStr));
    const dayOfWeek = date.getDay();

    // Domingo fechado
    if (dayOfWeek === 0) return [];

    // Sábado só de manhã, dias de semana o dia todo
    const baseSlots = dayOfWeek === 6 
      ? ['08:00', '09:00', '10:00', '11:00'] 
      : ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

    // Simula alguns horários já agendados de forma determinística
    const seed = Number(dayStr) + Number(month);
    return baseSlots.filter((time, index) => (seed + index) % 4 !== 0);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formatData = (d: string) => d ? d.split('-').reverse().join('/') : '';

    let opcoesTexto = `1ª Opção: ${formatData(formData.data1)} às ${formData.horario1}`;
    if (formData.data2 && formData.horario2) {
      opcoesTexto += `\n2ª Opção: ${formatData(formData.data2)} às ${formData.horario2}`;
    }
    if (formData.data3 && formData.horario3) {
      opcoesTexto += `\n3ª Opção: ${formatData(formData.data3)} às ${formData.horario3}`;
    }

    const text = `Olá Dra. Patricia! Gostaria de agendar uma consulta.\n\n*📅 Opções de Agendamento:*\n${opcoesTexto}\n\n*📋 Dados da Pré-Anamnese:*\n*Responsável:* ${formData.responsavel}\n*Criança:* ${formData.crianca}\n*Data de Nascimento:* ${formData.nascimento.split('-').reverse().join('/')}\n*Motivo da Consulta:* ${formData.motivo}\n*Alergias:* ${formData.alergias || 'Nenhuma'}\n*Medicamentos em uso:* ${formData.medicamentos || 'Nenhum'}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/5594981539045?text=${encodedText}`, '_blank');
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá! Meu nome é ${chatData.nome}. Gostaria de falar sobre: ${chatData.assunto}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/5594981539045?text=${encodedText}`, '_blank');
    setIsChatOpen(false);
    setChatData({ nome: '', assunto: '' });
  };

  const whatsappLink = "https://wa.me/5594981539045?text=Olá,%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Patricia.";
  const urgenciaLink = "https://wa.me/5594981539045?text=URGÊNCIA:%20Preciso%20de%20atendimento%20pediátrico%20imediato!";

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#5A5350] font-sans pb-20 md:pb-0">
      
      {/* --- Navegação --- */}
      <nav className="absolute md:sticky top-0 z-40 w-full pointer-events-none md:pointer-events-auto md:bg-white/95 md:backdrop-blur-xl md:border-b md:border-gray-100 md:shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-0 pointer-events-auto">
          <div className="flex justify-center md:justify-between items-center h-auto md:h-40 py-2 md:py-0">
            {/* Logo / Nome */}
            <a href="#" className="flex-shrink-0 flex items-center">
              <img src="https://github.com/patriciapereiracarvalhokids-ctrl/logo/blob/main/logo%20compactada.png?raw=true" alt="Dra. Patricia Carvalho" className="h-32 sm:h-48 md:h-36 lg:h-40 w-auto object-contain drop-shadow-md md:drop-shadow-none" referrerPolicy="no-referrer" />
            </a>

            {/* Menu Desktop */}
            <div className="hidden md:flex space-x-8">
              <a href="#sobre" className="text-sm font-medium text-gray-600 hover:text-[#A8D0C6] transition-colors">Sobre mim</a>
              <a href="#servicos" className="text-sm font-medium text-gray-600 hover:text-[#A8D0C6] transition-colors">Serviços</a>
              <a href="#consulta" className="text-sm font-medium text-gray-600 hover:text-[#A8D0C6] transition-colors">A Consulta</a>
              <a href="#anamnese" className="text-sm font-medium text-gray-600 hover:text-[#A8D0C6] transition-colors">Pré-Consulta</a>
              <a href="#localizacao" className="text-sm font-medium text-gray-600 hover:text-[#A8D0C6] transition-colors">Localização</a>
            </div>

            {/* Botão Agendar Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <a 
                href="https://instagram.com/patricia.gastroped" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#A8D0C6] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#anamnese"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-[#A8D0C6] hover:bg-[#95C0B5] transition-colors shadow-sm"
              >
                Agendar Consulta
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative bg-[#EAD5D1]/30 overflow-hidden bg-polka">
        {/* Elementos Flutuantes */}
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-70">🎈</div>
        <div className="absolute top-40 right-20 text-3xl animate-float-slow opacity-60">⭐</div>
        <div className="absolute bottom-20 left-1/3 text-5xl animate-float-fast opacity-50">🧸</div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            {/* Texto */}
            <FadeIn delay={0.1} className="w-full md:w-1/2 px-6 pt-44 sm:pt-56 md:py-24 lg:py-32 z-10">
              <h2 className="text-sm font-semibold text-[#A8D0C6] tracking-widest uppercase mb-3">Dra. Patricia Pereira Carvalho</h2>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-[#5A5350] leading-tight mb-6">
                Cuidando da saúde e do bem-estar do seu maior tesouro.
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed text-left sm:text-justify">
                Atendimento pediátrico e gastropediátrico humanizado, focado no desenvolvimento saudável e na tranquilidade da sua família.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <a 
                  href="#anamnese"
                  className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-[#A8D0C6] hover:bg-[#95C0B5] transition-colors shadow-md"
                >
                  Agendar Consulta
                </a>
                <a 
                  href={urgenciaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-[#FF9B9B] hover:bg-[#FF8282] transition-colors shadow-md"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Urgência
                </a>
                <a 
                  href="https://instagram.com/patricia.gastroped"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center items-center px-8 py-3.5 border-2 border-[#EAD5D1] text-base font-medium rounded-full text-[#5A5350] hover:bg-[#EAD5D1]/20 transition-colors"
                >
                  <Instagram className="w-5 h-5 mr-2 text-[#A8D0C6]" />
                  @patricia.gastroped
                </a>
              </div>
            </FadeIn>
            
            {/* Imagem */}
            <FadeIn delay={0.3} className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
              <img 
                src="https://github.com/patriciapereiracarvalhokids-ctrl/fotos/blob/main/IMG_2247.PNG?raw=true" 
                alt="Dra. Patricia Carvalho" 
                className="absolute inset-0 w-full h-full object-cover object-top rounded-bl-[100px] md:rounded-bl-[200px]"
                referrerPolicy="no-referrer"
              />
              {/* Gradiente para suavizar a borda da imagem no mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF9] via-transparent to-transparent md:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF9] via-transparent to-transparent hidden md:block w-32"></div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Banner Faixa --- */}
      <FadeIn delay={0.2} className="bg-[#EAD5D1] py-8 text-center px-4">
        <h3 className="font-serif text-2xl md:text-3xl text-[#5A5350] font-medium">
          Guiando para uma maternidade <span className="italic text-white">tranquila e segura</span>
        </h3>
      </FadeIn>

      {/* --- Serviços Section --- */}
      <section id="servicos" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-4xl animate-float opacity-40">🪁</div>
        <div className="absolute bottom-10 left-10 text-3xl animate-float-slow opacity-40">🍼</div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Serviços</h2>
            <div className="w-16 h-1 bg-[#A8D0C6] mx-auto rounded-full"></div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <FadeIn delay={0.1} className="bg-[#FDFBF9] rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 mx-auto bg-[#A8D0C6]/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#A8D0C6]/30 transition-colors">
                <Baby className="w-8 h-8 text-[#A8D0C6]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#5A5350] mb-3">Puericultura</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-left sm:text-justify">
                Acompanhamento integral do crescimento e desenvolvimento da criança, desde o nascimento até a adolescência.
              </p>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn delay={0.2} className="bg-[#FDFBF9] rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 mx-auto bg-[#EAD5D1]/40 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#EAD5D1]/60 transition-colors">
                <Stethoscope className="w-8 h-8 text-[#D1AFA6]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#5A5350] mb-3">Gastropediatria</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-left sm:text-justify">
                Diagnóstico e tratamento de doenças do aparelho digestivo, como refluxo, alergias alimentares e constipação.
              </p>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn delay={0.3} className="bg-[#FDFBF9] rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 mx-auto bg-[#A8D0C6]/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#A8D0C6]/30 transition-colors">
                <Heart className="w-8 h-8 text-[#A8D0C6]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#5A5350] mb-3">Consulta Pré-natal</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-left sm:text-justify">
                Orientação para os pais antes do nascimento, preparando para a chegada do bebê, amamentação e primeiros cuidados.
              </p>
            </FadeIn>

            {/* Card 4 */}
            <FadeIn delay={0.4} className="bg-[#FDFBF9] rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 mx-auto bg-[#EAD5D1]/40 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#EAD5D1]/60 transition-colors">
                <Apple className="w-8 h-8 text-[#D1AFA6]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#5A5350] mb-3">Introdução Alimentar</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-left sm:text-justify">
                Guia prático e seguro para iniciar a alimentação sólida do seu bebê, respeitando o tempo e as necessidades dele.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Sobre Mim Section --- */}
      <section id="sobre" className="py-20 bg-[#FDFBF9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Imagem */}
            <FadeIn delay={0.1} className="w-full lg:w-5/12 relative">
              <div className="absolute -top-6 -left-6 text-5xl animate-float-slow z-20">🩺</div>
              <div className="absolute -bottom-6 -right-6 text-4xl animate-float z-20">👶</div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#EAD5D1] rounded-[40px] transform translate-x-4 translate-y-4"></div>
                <img 
                  src="https://github.com/patriciapereiracarvalhokids-ctrl/fotos/blob/main/IMG_2246.PNG?raw=true" 
                  alt="Dra. Patricia Carvalho" 
                  className="relative rounded-[40px] shadow-lg w-full object-cover object-top aspect-[4/5]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </FadeIn>

            {/* Texto */}
            <FadeIn delay={0.3} className="w-full lg:w-7/12">
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-2">
                Dra. Patricia Pereira Carvalho
              </h2>
              <p className="text-[#A8D0C6] font-medium mb-2">CRM-PA 11040 | RQE 9798 (Pediatria) | RQE 9802 (Gastropediatria)</p>
              <a 
                href="https://instagram.com/patricia.gastroped" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center text-gray-500 hover:text-[#A8D0C6] transition-colors mb-6 text-sm font-medium"
              >
                <Instagram className="w-4 h-4 mr-1.5" />
                @patricia.gastroped
              </a>
              
              <div className="space-y-4 text-gray-600 leading-relaxed mb-8 text-left sm:text-justify">
                <p>
                  Sou médica formada pela Universidade do Estado do Pará (UEPA) no ano de 2012. Desde então, dedico minha vida a cuidar da saúde e do desenvolvimento das crianças.
                </p>
                <p>
                  Especializei-me em Pediatria e, posteriormente, em Gastroenterologia Pediátrica, para poder oferecer um cuidado ainda mais completo e aprofundado aos meus pequenos pacientes.
                </p>
                <p>
                  Acredito que a pediatria vai muito além de tratar doenças. É sobre construir relacionamentos de confiança com as famílias, ouvir atentamente as preocupações dos pais e garantir que cada criança seja tratada com o carinho, respeito e cuidado que merece.
                </p>
              </div>

              {/* Box Destaque */}
              <div className="bg-[#A8D0C6] rounded-2xl p-8 text-center text-white shadow-md">
                <h3 className="font-serif text-xl font-medium mb-4">
                  Atendimento completo e atencioso, em um ambiente seguro e acolhedor.
                </h3>
                <a 
                  href="#anamnese"
                  className="inline-block bg-white text-[#A8D0C6] font-medium px-8 py-3 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Agendar Consulta
                </a>
                <p className="text-sm mt-4 opacity-90">Atendimento exclusivo particular</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Linha do Tempo do Desenvolvimento --- */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-sm font-semibold text-[#A8D0C6] tracking-widest uppercase mb-3">Acompanhamento</h2>
            <h3 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350]">Linha do Tempo do Bebê</h3>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Descubra os principais marcos do desenvolvimento do seu filho, além das consultas e vacinas recomendadas para cada fase.
            </p>
          </FadeIn>

          {/* Timeline Tabs */}
          <FadeIn delay={0.1} className="flex overflow-x-auto hide-scrollbar justify-start md:justify-center gap-3 md:gap-4 mb-8 md:mb-12 pb-4 px-4 sm:px-0 -mx-4 sm:mx-0">
            {timelineData.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTimeline(index)}
                className={`flex-shrink-0 flex items-center px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                  activeTimeline === index 
                    ? 'bg-[#A8D0C6] text-white shadow-md transform scale-105' 
                    : 'bg-[#FDFBF9] text-gray-500 hover:bg-[#A8D0C6]/10 border border-gray-100'
                }`}
              >
                <div className={`mr-3 ${activeTimeline === index ? 'text-white' : 'text-[#A8D0C6]'}`}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <div className="font-serif font-medium text-base md:text-lg leading-tight">{tab.title}</div>
                  <div className={`text-xs ${activeTimeline === index ? 'text-white/80' : 'text-gray-400'}`}>{tab.age}</div>
                </div>
              </button>
            ))}
          </FadeIn>

          {/* Timeline Content */}
          <FadeIn delay={0.2} className="bg-[#FDFBF9] rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#A8D0C6]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              {/* Marcos */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#EAD5D1]/30 flex items-center justify-center text-[#5A5350] mr-4">
                    <Baby className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xl font-medium text-[#5A5350]">Marcos Esperados</h4>
                </div>
                <ul className="space-y-4">
                  {timelineData[activeTimeline].milestones.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#A8D0C6] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Consultas */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#A8D0C6]/20 flex items-center justify-center text-[#A8D0C6] mr-4">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xl font-medium text-[#5A5350]">Consultas</h4>
                </div>
                <ul className="space-y-4">
                  {timelineData[activeTimeline].consultations.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#A8D0C6] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vacinas */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 mr-4">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xl font-medium text-[#5A5350]">Vacinas</h4>
                </div>
                <ul className="space-y-4">
                  {timelineData[activeTimeline].vaccines.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Depoimentos Section --- */}
      <section className="py-20 bg-[#EAD5D1]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Depoimentos</h2>
            <div className="w-16 h-1 bg-[#A8D0C6] mx-auto rounded-full"></div>
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

      {/* --- A Consulta Section --- */}
      <section id="consulta" className="py-20 bg-white relative">
        <div className="absolute top-1/2 right-5 text-4xl animate-float-fast opacity-50">🧩</div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="flex flex-col lg:flex-row rounded-[40px] overflow-hidden shadow-lg">
            {/* Imagem */}
            <div className="w-full lg:w-1/2 relative min-h-[400px]">
              <img 
                src="https://github.com/patriciapereiracarvalhokids-ctrl/fotos/blob/main/IMG_2251.PNG?raw=true" 
                alt="Dra. Patricia Carvalho em consulta" 
                className="absolute inset-0 w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <h3 className="text-white font-serif text-3xl font-medium">Acompanhamento completo</h3>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="w-full lg:w-1/2 bg-[#A8D0C6] p-10 lg:p-16 text-white">
              <h2 className="font-serif text-2xl md:text-3xl font-medium mb-6">
                Minha consulta é dividida em momentos importantes para a saúde do seu filho!
              </h2>
              <p className="mb-8 text-white/90 leading-relaxed text-left sm:text-justify">
                Eu me preocupo em entender cada detalhe para oferecer o melhor cuidado possível, sem pressa.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                  <span className="font-serif font-bold text-xl mr-4 opacity-80">1.</span>
                  <span>Foco na queixa atual do paciente;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-serif font-bold text-xl mr-4 opacity-80">2.</span>
                  <span>Análise dos antecedentes pessoais da criança;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-serif font-bold text-xl mr-4 opacity-80">3.</span>
                  <span>Avaliação de rotina e alimentação atuais;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-serif font-bold text-xl mr-4 opacity-80">4.</span>
                  <span>Avaliação minuciosa do desenvolvimento;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-serif font-bold text-xl mr-4 opacity-80">5.</span>
                  <span>Elaboração das possibilidades diagnósticas;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-serif font-bold text-xl mr-4 opacity-80">6.</span>
                  <span>Estratégia de tratamento e orientações.</span>
                </li>
              </ul>

              <a 
                href="#anamnese"
                className="inline-block bg-white text-[#A8D0C6] font-medium px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
              >
                Agende uma consulta
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Anamnese / Formulário Section --- */}
      <section id="anamnese" className="py-20 bg-[#EAD5D1]/20 relative">
        <div className="absolute top-10 left-10 text-4xl animate-float opacity-50">📝</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-float-slow opacity-50">✨</div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Agendamento & Pré-Consulta</h2>
            <div className="w-16 h-1 bg-[#A8D0C6] mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-left sm:text-justify">
              Escolha a data e horário de sua preferência e preencha os dados abaixo para agilizar o seu atendimento. As informações serão enviadas diretamente para o nosso WhatsApp para finalizarmos o seu agendamento.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <form onSubmit={handleFormSubmit} className="bg-white p-8 md:p-10 rounded-[30px] shadow-sm border border-gray-100">
              
              {/* Seção 1: Data e Horário */}
              <div className="mb-10">
              <h3 className="flex items-center text-xl font-serif font-medium text-[#5A5350] mb-4 pb-2 border-b border-gray-100">
                <Calendar className="w-5 h-5 mr-2 text-[#A8D0C6]" />
                1. Sugira até 3 opções de Data e Horário
              </h3>
              
              {/* Box de Informação sobre Confirmação */}
              <div className="bg-[#A8D0C6]/10 border border-[#A8D0C6]/30 rounded-2xl p-4 mb-6 flex items-start">
                <Info className="w-5 h-5 text-[#A8D0C6] mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-[#5A5350] mb-1">Como funciona a confirmação?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed text-left sm:text-justify">
                    Para agilizar seu atendimento, pedimos que sugira até 3 opções. Nossa equipe receberá sua solicitação e <strong>confirmará a data mais próxima disponível</strong> entre as suas escolhas através do WhatsApp. Caso nenhuma das opções esteja livre, sugeriremos o horário mais próximo possível.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Opção 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#FDFBF9] rounded-2xl border border-[#EAD5D1]/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1ª Opção de Data *</label>
                    <input 
                      type="date" name="data1" required min={new Date().toISOString().split('T')[0]}
                      value={formData.data1} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1ª Opção de Horário *</label>
                    <select 
                      name="horario1" required disabled={!formData.data1 || getAvailableTimes(formData.data1).length === 0}
                      value={formData.horario1} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Selecione um horário</option>
                      {getAvailableTimes(formData.data1).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {formData.data1 && getAvailableTimes(formData.data1).length === 0 && (
                      <p className="text-xs text-red-500 mt-2">Não há atendimento nesta data (Domingo).</p>
                    )}
                  </div>
                </div>

                {/* Opção 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#FDFBF9] rounded-2xl border border-[#EAD5D1]/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2ª Opção de Data (Opcional)</label>
                    <input 
                      type="date" name="data2" min={new Date().toISOString().split('T')[0]}
                      value={formData.data2} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2ª Opção de Horário</label>
                    <select 
                      name="horario2" required={!!formData.data2} disabled={!formData.data2 || getAvailableTimes(formData.data2).length === 0}
                      value={formData.horario2} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Selecione um horário</option>
                      {getAvailableTimes(formData.data2).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {formData.data2 && getAvailableTimes(formData.data2).length === 0 && (
                      <p className="text-xs text-red-500 mt-2">Não há atendimento nesta data (Domingo).</p>
                    )}
                  </div>
                </div>

                {/* Opção 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#FDFBF9] rounded-2xl border border-[#EAD5D1]/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">3ª Opção de Data (Opcional)</label>
                    <input 
                      type="date" name="data3" min={new Date().toISOString().split('T')[0]}
                      value={formData.data3} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">3ª Opção de Horário</label>
                    <select 
                      name="horario3" required={!!formData.data3} disabled={!formData.data3 || getAvailableTimes(formData.data3).length === 0}
                      value={formData.horario3} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Selecione um horário</option>
                      {getAvailableTimes(formData.data3).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {formData.data3 && getAvailableTimes(formData.data3).length === 0 && (
                      <p className="text-xs text-red-500 mt-2">Não há atendimento nesta data (Domingo).</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Dados do Paciente */}
            <div>
              <h3 className="flex items-center text-xl font-serif font-medium text-[#5A5350] mb-6 pb-2 border-b border-gray-100">
                <FileText className="w-5 h-5 mr-2 text-[#A8D0C6]" />
                2. Dados do Paciente
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Responsável */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-2">Nome do Responsável *</label>
                  <input 
                    type="text" 
                    id="responsavel" 
                    name="responsavel" 
                    required
                    value={formData.responsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>

                {/* Nome da Criança */}
                <div>
                  <label htmlFor="crianca" className="block text-sm font-medium text-gray-700 mb-2">Nome da Criança *</label>
                  <input 
                    type="text" 
                    id="crianca" 
                    name="crianca" 
                    required
                    value={formData.crianca}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all"
                    placeholder="Nome do paciente"
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label htmlFor="nascimento" className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
                  <input 
                    type="date" 
                    id="nascimento" 
                    name="nascimento" 
                    required
                    value={formData.nascimento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all text-gray-600"
                  />
                </div>

                {/* Motivo da Consulta */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">Motivo da Consulta *</label>
                  <textarea 
                    id="motivo" 
                    name="motivo" 
                    required
                    rows={3}
                    value={formData.motivo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Descreva brevemente o motivo da consulta (ex: rotina, dor de barriga, febre...)"
                  ></textarea>
                </div>

                {/* Alergias */}
                <div>
                  <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-2">Alergias (Opcional)</label>
                  <input 
                    type="text" 
                    id="alergias" 
                    name="alergias" 
                    value={formData.alergias}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Leite, Dipirona..."
                  />
                </div>

                {/* Medicamentos */}
                <div>
                  <label htmlFor="medicamentos" className="block text-sm font-medium text-gray-700 mb-2">Medicamentos em uso (Opcional)</label>
                  <input 
                    type="text" 
                    id="medicamentos" 
                    name="medicamentos" 
                    value={formData.medicamentos}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8D0C6] focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Vitamina D, Paracetamol..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-4 rounded-xl transition-colors shadow-md text-lg"
              >
                <MessageCircle className="w-6 h-6" />
                Confirmar Agendamento via WhatsApp
              </button>
            </div>
          </form>
          </FadeIn>
        </div>
      </section>

      {/* --- Localização Section --- */}
      <section id="localizacao" className="py-20 bg-[#FDFBF9] bg-polka relative">
        <div className="absolute top-20 left-20 text-4xl animate-float opacity-60">📍</div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350] mb-4">Atendimento Presencial</h2>
            <div className="w-16 h-1 bg-[#A8D0C6] mx-auto rounded-full"></div>
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
                <div className="flex-shrink-0 mt-1 bg-[#A8D0C6]/20 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-[#A8D0C6]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-[#5A5350]">Endereço</h3>
                  <p className="mt-1 text-gray-600 leading-relaxed">
                    Folha 16, Quadra 01, Lote 14 A<br />
                    Bairro Nova Marabá<br />
                    Marabá - PA, CEP: 68511-000
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/f7oCbssotdMv9kad7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-[#A8D0C6] hover:text-[#95C0B5] underline underline-offset-4"
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-[#A8D0C6]/20 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-[#A8D0C6]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-[#5A5350]">Telefone / WhatsApp</h3>
                  <p className="mt-1 text-gray-600">(94) 981539045</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-[#A8D0C6]/20 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-[#A8D0C6]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-[#5A5350]">Horário de Atendimento</h3>
                  <p className="mt-1 text-gray-600">
                    Segunda a Sexta: 08:00 às 18:00<br />
                    Atendimento com hora marcada.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Dicas da Pediatra Section (Blog) --- */}
      <section id="dicas" className="py-20 bg-[#FDFBF9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-sm font-semibold text-[#A8D0C6] tracking-widest uppercase mb-3">Blog & Informação</h2>
            <h3 className="font-serif text-3xl md:text-4xl font-medium text-[#5A5350]">Dicas da Pediatra</h3>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Artigos rápidos e orientações práticas para ajudar você a cuidar do seu maior tesouro com mais segurança e tranquilidade.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <FadeIn delay={0.1} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800" 
                  alt="Introdução Alimentar" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#A8D0C6] shadow-sm">
                  Nutrição
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-xl font-medium text-[#5A5350] mb-3 group-hover:text-[#A8D0C6] transition-colors">
                  Introdução Alimentar: Por onde começar?
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  O início da introdução alimentar gera muitas dúvidas. Saiba quais os melhores alimentos para os primeiros contatos do bebê e como tornar esse momento prazeroso e sem estresse.
                </p>
                <a 
                  href="https://instagram.com/patricia.gastroped" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#A8D0C6] font-medium text-sm hover:text-[#95C0B5] transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn delay={0.2} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src="https://github.com/patriciapereiracarvalhokids-ctrl/fotos/blob/main/IMG_2249.PNG?raw=true" 
                  alt="Dra. Patricia Carvalho" 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#A8D0C6] shadow-sm">
                  Recém-nascido
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-xl font-medium text-[#5A5350] mb-3 group-hover:text-[#A8D0C6] transition-colors">
                  Mala da Maternidade: O que não pode faltar?
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  Um checklist completo com tudo o que você e seu bebê vão precisar nos primeiros dias na maternidade. Evite exageros e não esqueça o essencial para o conforto de ambos.
                </p>
                <a 
                  href="https://instagram.com/patricia.gastroped" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#A8D0C6] font-medium text-sm hover:text-[#95C0B5] transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn delay={0.3} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group flex flex-col h-full">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=800" 
                  alt="Febre na criança" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#A8D0C6] shadow-sm">
                  Saúde
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-serif text-xl font-medium text-[#5A5350] mb-3 group-hover:text-[#A8D0C6] transition-colors">
                  Febre na criança: Quando devo me preocupar?
                </h4>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  A febre é um mecanismo de defesa do corpo, mas sempre assusta os pais. Aprenda a identificar os sinais de alerta e saiba o momento exato de procurar o pronto-socorro.
                </p>
                <a 
                  href="https://instagram.com/patricia.gastroped" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#A8D0C6] font-medium text-sm hover:text-[#95C0B5] transition-colors mt-auto"
                >
                  Ler no Instagram <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>
          </div>
          
          <FadeIn delay={0.4} className="mt-16 text-center">
            <a 
              href="https://instagram.com/patricia.gastroped" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-[#A8D0C6] text-base font-medium rounded-full text-[#A8D0C6] hover:bg-[#A8D0C6] hover:text-white transition-colors shadow-sm"
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
            <div className="w-16 h-1 bg-[#A8D0C6] mx-auto rounded-full"></div>
          </FadeIn>

          <FadeIn delay={0.2} className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(0)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-[#FDFBF9] hover:bg-gray-50 transition-colors"
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
                <span className="font-medium text-[#5A5350]">O atendimento é só particular?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="px-6 py-4 bg-white text-gray-600 border-t border-gray-100 text-left sm:text-justify">
                  Sim, no momento realizo apenas atendimentos particulares para garantir o tempo e a qualidade de atenção que cada paciente merece. Fornecemos recibo para solicitação de reembolso junto ao seu plano de saúde.
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-[#FDFBF9] hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#5A5350]">Qual a idade para consulta com gastropediatra?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="px-6 py-4 bg-white text-gray-600 border-t border-gray-100 text-left sm:text-justify">
                  Atendo desde recém-nascidos até adolescentes (18 anos) que apresentem sintomas relacionados ao aparelho digestivo, como refluxo, cólicas intensas, dificuldade alimentar, constipação ou diarreia crônica.
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-[#EAD5D1]/30 pt-20 pb-12 relative overflow-hidden mt-10">
        {/* Wave SVG */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF"></path>
          </svg>
        </div>

        {/* Elementos Flutuantes no Footer */}
        <div className="absolute top-20 right-10 text-3xl animate-float opacity-40">🌙</div>
        <div className="absolute bottom-20 left-10 text-2xl animate-float-slow opacity-40">⭐</div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Coluna 1: Sobre */}
            <div className="col-span-1 lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
              <img src="https://github.com/patriciapereiracarvalhokids-ctrl/logo/blob/main/logo%20compactada.png?raw=true" alt="Dra. Patricia Carvalho" className="h-24 md:h-32 w-auto object-contain mb-6" referrerPolicy="no-referrer" />
              <p className="text-gray-600 text-sm leading-relaxed mb-4 text-left sm:text-justify">
                Cuidando da saúde e do bem-estar do seu maior tesouro com amor, dedicação e ciência.
              </p>
              <p className="text-[#A8D0C6] font-medium text-sm">CRM-PA 11040 | RQE 9798</p>
            </div>

            {/* Coluna 2: Links Rápidos */}
            <div>
              <h3 className="font-serif text-lg font-medium text-[#5A5350] mb-4">Links Rápidos</h3>
              <ul className="space-y-3">
                <li><a href="#sobre" className="text-gray-600 hover:text-[#A8D0C6] text-sm transition-colors">Sobre mim</a></li>
                <li><a href="#servicos" className="text-gray-600 hover:text-[#A8D0C6] text-sm transition-colors">Serviços</a></li>
                <li><a href="#consulta" className="text-gray-600 hover:text-[#A8D0C6] text-sm transition-colors">A Consulta</a></li>
                <li><a href="#anamnese" className="text-gray-600 hover:text-[#A8D0C6] text-sm transition-colors">Pré-Consulta</a></li>
              </ul>
            </div>

            {/* Coluna 3: Contato */}
            <div>
              <h3 className="font-serif text-lg font-medium text-[#5A5350] mb-4">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[#A8D0C6] mr-2 flex-shrink-0 mt-0.5" />
                  <span>Folha 16, Quadra 01, Lote 14 A<br/>Nova Marabá, Marabá - PA</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-[#A8D0C6] mr-2 flex-shrink-0" />
                  <span>(94) 981539045</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Instagram className="w-4 h-4 text-[#A8D0C6] mr-2 flex-shrink-0" />
                  <a href="https://instagram.com/patricia.gastroped" target="_blank" rel="noopener noreferrer" className="hover:text-[#A8D0C6] transition-colors">
                    @patricia.gastroped
                  </a>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-[#A8D0C6] mr-2 flex-shrink-0 mt-0.5" />
                  <span>Seg a Sex: 08:00 às 18:00</span>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais & Urgência */}
            <div>
              <h3 className="font-serif text-lg font-medium text-[#5A5350] mb-4">Conecte-se</h3>
              <div className="flex space-x-4 mb-6">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#A8D0C6] hover:bg-[#A8D0C6] hover:text-white transition-all shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/patricia.gastroped" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#A8D0C6] hover:bg-[#A8D0C6] hover:text-white transition-all shadow-sm">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
              <a 
                href={urgenciaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-[#FF9B9B] hover:bg-[#FF8282] transition-colors shadow-sm w-full"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Plantão / Urgência
              </a>
            </div>
          </FadeIn>
          
          <div className="border-t border-[#D1AFA6]/30 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Dra. Patricia Pereira Carvalho. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-sm flex items-center">
              Feito com <Heart className="w-4 h-4 text-[#FF9B9B] mx-1 fill-current" /> para o seu bebê
            </p>
          </div>
        </div>
      </footer>

      {/* --- WhatsApp Floating Button & Chat Widget --- */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* Chat Popover */}
        {isChatOpen && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 w-[calc(100vw-2rem)] md:w-80 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right pointer-events-auto">
            <div className="bg-[#25D366] p-4 flex justify-between items-center text-white">
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] outline-none transition-all"
                  placeholder="Como podemos te chamar?"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assunto</label>
                <select 
                  required
                  value={chatData.assunto}
                  onChange={(e) => setChatData({...chatData, assunto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] outline-none transition-all bg-white"
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
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
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
          className={`group flex items-center gap-3 text-white p-3.5 md:px-6 md:py-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.3)] transition-all duration-300 pointer-events-auto ${isChatOpen ? 'bg-gray-800 hover:bg-gray-700 shadow-gray-800/30' : 'bg-[#25D366] hover:bg-[#20bd5a] hover:-translate-y-1'}`}
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
          <a href="#" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-[#A8D0C6] active:text-[#A8D0C6] transition-colors">
            <Home className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Início</span>
          </a>
          <a href="#servicos" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-[#A8D0C6] active:text-[#A8D0C6] transition-colors">
            <Stethoscope className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Serviços</span>
          </a>
          <a href="#anamnese" className="flex flex-col items-center justify-center w-full relative -top-5">
            <div className="bg-[#A8D0C6] text-white p-4 rounded-full shadow-lg border-4 border-white flex items-center justify-center transform transition-transform active:scale-95">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#A8D0C6] mt-1 font-bold">Agendar</span>
          </a>
          <a href="#sobre" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-[#A8D0C6] active:text-[#A8D0C6] transition-colors">
            <User className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Sobre</span>
          </a>
          <a href="#localizacao" className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-[#A8D0C6] active:text-[#A8D0C6] transition-colors">
            <MapPin className="w-[22px] h-[22px] mb-1" />
            <span className="text-[11px] font-medium">Local</span>
          </a>
        </div>
      </nav>

    </div>
  );
}
