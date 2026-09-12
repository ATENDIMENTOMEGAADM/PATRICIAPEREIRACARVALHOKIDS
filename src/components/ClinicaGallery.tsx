import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Sparkles, Heart, Shield, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryImage {
  url: string;
  title: string;
  category: string;
}

const clinicImages: GalleryImage[] = [
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12.png?raw=true",
    title: "Fachada da Clínica",
    category: "Ambiente Externo",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(1).png?raw=true",
    title: "Entrada e Recepção",
    category: "Recepção",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(2).png?raw=true",
    title: "Área de Atendimento Integrada",
    category: "Recepção",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(3).png?raw=true",
    title: "Espaço Kids & Área Lúdica",
    category: "Espaço Kids",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(4).png?raw=true",
    title: "Sala de Espera e Conforto",
    category: "Área de Espera",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(5).png?raw=true",
    title: "Consultório Pediátrico",
    category: "Consultório",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(6).png?raw=true",
    title: "Ambiente de Avaliação Clínica",
    category: "Consultório",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(7).png?raw=true",
    title: "Espaço de Cuidado e Exames",
    category: "Consultório",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(8).png?raw=true",
    title: "Detalhes do Consultório",
    category: "Estrutura",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(9).png?raw=true",
    title: "Conforto e Serenidade",
    category: "Ambiente",
  },
  {
    url: "https://github.com/ATENDIMENTOMEGAADM/IMAGENS-patricia/blob/main/2026-09-12%20(10).png?raw=true",
    title: "Estrutura Moderna e Humanizada",
    category: "Estrutura",
  },
];

export default function ClinicaGallery() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'slideshow' | 'grid'>('slideshow');

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? clinicImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === clinicImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const currentImage = clinicImages[selectedIndex];

  return (
    <section id="clinica" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-verde-agua/15 text-verde-agua tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Estrutura & Acolhimento
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-[#5A5350] mb-4">
            Conheça a Nossa Clínica
          </h2>
          <div className="w-16 h-1 bg-verde-agua mx-auto rounded-full mb-5"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Um ambiente pensado em cada detalhe para acolher bebês, crianças e suas famílias com leveza, segurança, carinho e total conforto.
          </p>

          {/* Toggle de Visualização */}
          <div className="inline-flex p-1 bg-seda rounded-full mt-6 border border-gray-200">
            <button
              onClick={() => setActiveTab('slideshow')}
              className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'slideshow'
                  ? 'bg-white text-verde-agua shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-[#5A5350]'
              }`}
            >
              Tour em Destaque
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'grid'
                  ? 'bg-white text-verde-agua shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-[#5A5350]'
              }`}
            >
              Galeria Completa ({clinicImages.length} fotos)
            </button>
          </div>
        </div>

        {/* --- Modo 1: Tour em Destaque (Showcase interativo) --- */}
        {activeTab === 'slideshow' && (
          <div className="space-y-6">
            <div className="relative bg-seda rounded-3xl overflow-hidden shadow-sm border border-gray-100 group">
              {/* Foto Principal */}
              <div 
                className="relative h-[340px] sm:h-[460px] md:h-[540px] w-full overflow-hidden cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage.url}
                    src={currentImage.url}
                    alt={currentImage.title}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Gradiente inferior para legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Informações da Imagem */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white pointer-events-none">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md mb-2">
                      {currentImage.category}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-medium drop-shadow-sm">
                      {currentImage.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 text-[#5A5350] hover:bg-white text-xs font-semibold backdrop-blur-md shadow-md transition-all hover:scale-105"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-verde-agua" />
                      Ampliar Foto
                    </button>
                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-mono font-medium">
                      {selectedIndex + 1} / {clinicImages.length}
                    </span>
                  </div>
                </div>

                {/* Botões de Navegação Anterior / Próxima */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#5A5350] hover:text-verde-agua flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#5A5350] hover:text-verde-agua flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-20"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Faixa inferior de miniaturas clicáveis */}
              <div className="p-4 bg-white border-t border-gray-100 overflow-x-auto scrollbar-thin">
                <div className="flex items-center gap-3 w-max mx-auto px-2">
                  {clinicImages.map((img, idx) => (
                    <button
                      key={img.url}
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        idx === selectedIndex
                          ? 'border-dourado ring-2 ring-dourado/30 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Ver foto ${idx + 1}`}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Modo 2: Mosaico / Galeria Completa --- */}
        {activeTab === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {clinicImages.map((img, index) => (
              <div
                key={img.url}
                onClick={() => {
                  setSelectedIndex(index);
                  setIsLightboxOpen(true);
                }}
                className={`group relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-seda cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  index === 0 ? 'col-span-2 row-span-2 h-[340px] sm:h-[420px]' : 'h-48 sm:h-56'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <span className="text-[11px] font-medium text-dourado uppercase tracking-wider">
                    {img.category}
                  </span>
                  <h4 className="font-serif text-sm sm:text-base font-medium leading-snug">
                    {img.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-200">
                    <Maximize2 className="w-3 h-3" />
                    Clique para ampliar
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Destaques do Espaço da Clínica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-seda p-6 rounded-2xl border border-gray-100 flex items-start space-x-4">
            <div className="p-3 bg-verde-agua/15 text-verde-agua rounded-xl flex-shrink-0">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#5A5350] mb-1">
                Espaço Kids Integrado
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Brinquedos e livrinhos lúdicos para distrair e divertir as crianças antes da consulta.
              </p>
            </div>
          </div>

          <div className="bg-seda p-6 rounded-2xl border border-gray-100 flex items-start space-x-4">
            <div className="p-3 bg-dourado/15 text-dourado rounded-xl flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#5A5350] mb-1">
                Acolhimento Familiar
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Ambiente confortável com poltronas pensadas no aconchego de pais e bebês.
              </p>
            </div>
          </div>

          <div className="bg-seda p-6 rounded-2xl border border-gray-100 flex items-start space-x-4">
            <div className="p-3 bg-ametista/15 text-ametista rounded-xl flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#5A5350] mb-1">
                Segurança & Higiene
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Ambientes climatizados com rigorosos cuidados de assepsia e bem-estar infantil.
              </p>
            </div>
          </div>

          <div className="bg-seda p-6 rounded-2xl border border-gray-100 flex items-start space-x-4">
            <div className="p-3 bg-verde-agua/15 text-verde-agua rounded-xl flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#5A5350] mb-1">
                Localização Privilegiada
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Na Nova Marabá, com fácil estacionamento e total acessibilidade para carrinhos de bebê.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* --- Lightbox / Modal Fullscreen --- */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-sm"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Barra superior do Modal */}
            <div className="flex items-center justify-between text-white z-10">
              <div>
                <span className="text-xs uppercase tracking-wider text-dourado font-medium">
                  {currentImage.category}
                </span>
                <h3 className="text-lg sm:text-xl font-serif">{currentImage.title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono bg-white/10 px-3 py-1 rounded-full">
                  {selectedIndex + 1} de {clinicImages.length}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Fechar galeria"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Imagem Central */}
            <div 
              className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage.url}
                alt={currentImage.title}
                className="max-h-[75vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {/* Botões de Navegação no Modal */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* Miniaturas de navegação rápida inferior */}
            <div 
              className="overflow-x-auto scrollbar-thin py-2 px-4 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 w-max mx-auto">
                {clinicImages.map((img, idx) => (
                  <button
                    key={img.url}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedIndex ? 'border-dourado scale-105' : 'border-transparent opacity-40 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
