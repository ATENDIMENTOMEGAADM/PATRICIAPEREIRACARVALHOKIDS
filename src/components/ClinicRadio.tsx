import React, { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Music, Sparkles, ChevronDown, ChevronUp, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AUDIO_SRC = "https://raw.githubusercontent.com/ATENDIMENTOMEGAADM/AUDIOSPATRICIA/refs/heads/main/Cancilla%20Sonriente.mp3";

export default function ClinicRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao tocar áudio:", err);
          setIsLoading(false);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.muted = newMuteState;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 📱 MODO MOBILE: BOTÃO LATERAL OCULTO / RETRÁTIL (ABA LATERAL) */}
      {/* ========================================================= */}
      <div className="md:hidden">
        {/* Aba retrátil fixada na borda lateral esquerda */}
        {!isMobileDrawerOpen && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed top-1/2 -translate-y-1/2 left-0 z-40"
          >
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`flex items-center gap-1.5 py-3 px-2 pl-2.5 rounded-r-2xl shadow-[2px_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-md border border-l-0 transition-transform active:scale-95 ${
                isPlaying 
                  ? 'bg-verde-agua text-white border-verde-agua shadow-verde-agua/20' 
                  : 'bg-white/95 text-[#5A5350] border-dourado/30 hover:bg-white'
              }`}
              aria-label="Abrir Rádio da Clínica"
            >
              <div className="flex flex-col items-center gap-1">
                {isPlaying ? (
                  <div className="flex items-end justify-center gap-0.5 h-4 w-3">
                    <span className="w-0.5 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2"></span>
                    <span className="w-0.5 bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.2s] h-4"></span>
                    <span className="w-0.5 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-2.5"></span>
                  </div>
                ) : (
                  <Radio className="w-4 h-4 text-dourado" />
                )}
                
                <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-medium tracking-wider uppercase font-serif py-1">
                  {isPlaying ? 'No Ar' : 'Rádio'}
                </span>

                <ChevronRight className="w-3 h-3 opacity-60" />
              </div>
            </button>
          </motion.div>
        )}

        {/* Painel lateral que desliza ao clicar na aba mobile */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              {/* Backdrop transparente para fechar ao tocar fora */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
              />

              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-1/2 -translate-y-1/2 left-3 z-50 w-[290px] bg-white/98 rounded-3xl shadow-2xl border border-dourado/20 p-5 text-[#5A5350] backdrop-blur-xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-dourado/15 rounded-xl text-dourado">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#5A5350] flex items-center gap-1.5">
                        Rádio da Clínica
                        {isPlaying && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verde-agua opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-verde-agua"></span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400">Música ambiente relaxante</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Ocultar rádio lateral"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Informações da Música */}
                <div className="py-4 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-verde-agua/20 to-dourado/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Music className={`w-6 h-6 text-verde-agua ${isPlaying ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-[#5A5350] truncate">Cancilla Sonriente</p>
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-dourado flex-shrink-0" />
                      Sons suaves para os pequenos
                    </p>
                  </div>
                </div>

                {/* Controles de Reprodução */}
                <div className="space-y-3">
                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-verde-agua hover:bg-verde-agua/90 active:scale-95 text-white rounded-2xl text-xs font-semibold shadow-sm transition-all"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        Pausar Música
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        Tocar Música da Clínica
                      </>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-3 bg-seda p-2.5 rounded-2xl border border-gray-100">
                    <button
                      onClick={toggleMute}
                      className="text-gray-500 hover:text-verde-agua transition-colors"
                      aria-label={isMuted ? "Desmutar" : "Mutar"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-verde-agua" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-verde-agua"
                      aria-label="Volume da música"
                    />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 underline"
                  >
                    Ocultar painel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================= */}
      {/* 💻 MODO DESKTOP: BOTÃO FLUTUANTE INFERIOR CLÁSSICO */}
      {/* ========================================================= */}
      <div className="hidden md:block fixed bottom-6 left-6 z-40 select-none">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-80 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-dourado/20 text-[#5A5350]"
            >
              {/* Header da Radiozinha */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-dourado/15 rounded-lg text-dourado">
                    <Radio className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#5A5350] flex items-center gap-1.5">
                      Rádio da Clínica
                      {isPlaying && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verde-agua opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-verde-agua"></span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-gray-400">Música ambiente relaxante</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Minimizar rádio"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Faixa Atual */}
              <div className="py-3 flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-verde-agua/30 to-dourado/30 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                  <Music className={`w-5 h-5 text-verde-agua ${isPlaying ? 'animate-bounce' : ''}`} />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-dourado/10 animate-pulse" />
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-[#5A5350] truncate">Cancilla Sonriente</p>
                  <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-dourado flex-shrink-0" />
                    Sons suaves para os pequenos
                  </p>
                </div>
              </div>

              {/* Controles de Reprodução */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-verde-agua hover:bg-verde-agua/90 active:scale-95 text-white rounded-full text-xs font-medium shadow-sm transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      Tocar Música
                    </>
                  )}
                </button>

                {/* Controle de Volume */}
                <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                  <button
                    onClick={toggleMute}
                    className="text-gray-500 hover:text-verde-agua transition-colors"
                    aria-label={isMuted ? "Desmutar" : "Mutar"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-verde-agua" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-verde-agua"
                    aria-label="Volume da música"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão Flutuante Principal Desktop */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 active:scale-95 border ${
              isPlaying
                ? 'bg-white/95 text-verde-agua border-verde-agua/40 ring-2 ring-verde-agua/20'
                : 'bg-white/95 text-[#5A5350] border-gray-200/80 hover:border-dourado/40'
            }`}
            aria-label={isPlaying ? "Pausar rádio da clínica" : "Ouvir rádio da clínica"}
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-seda flex-shrink-0">
              {isPlaying ? (
                <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5">
                  <span className="w-0.5 bg-verde-agua rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2"></span>
                  <span className="w-0.5 bg-verde-agua rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.2s] h-3.5"></span>
                  <span className="w-0.5 bg-verde-agua rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-2.5"></span>
                </div>
              ) : (
                <Radio className="w-3.5 h-3.5 text-dourado" />
              )}
            </div>

            <div className="flex flex-col text-left pr-1">
              <span className="text-[11px] font-semibold font-serif text-[#5A5350] leading-none flex items-center gap-1">
                Rádio da Clínica
                {isPlaying && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-verde-agua/15 text-verde-agua rounded">
                    No ar
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-500 leading-tight mt-0.5">
                {isPlaying ? 'Cancilla Sonriente' : 'Clique para ouvir'}
              </span>
            </div>

            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isPlaying ? 'bg-verde-agua text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-verde-agua group-hover:text-white'
            }`}>
              {isPlaying ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </div>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-white/95 border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-verde-agua hover:bg-white transition-colors"
            aria-label={isExpanded ? "Fechar detalhes da rádio" : "Abrir detalhes da rádio"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
