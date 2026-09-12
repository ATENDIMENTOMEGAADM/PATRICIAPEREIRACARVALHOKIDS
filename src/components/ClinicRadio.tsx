import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Music, Sparkles, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X, Volume1, SkipForward, SkipBack, ListMusic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface RadioTrack {
  id: string;
  title: string;
  subtitle: string;
  src: string;
}

const PLAYLIST: RadioTrack[] = [
  {
    id: 'cancilla-sonriente',
    title: 'Cancilla Sonriente',
    subtitle: 'Sons suaves para os pequenos',
    src: 'https://raw.githubusercontent.com/ATENDIMENTOMEGAADM/AUDIOSPATRICIA/refs/heads/main/Cancilla%20Sonriente.mp3',
  },
  {
    id: 'lullaby-of-the-stars',
    title: 'Lullaby of the Stars',
    subtitle: 'Melodia relaxante e serena',
    src: 'https://raw.githubusercontent.com/ATENDIMENTOMEGAADM/AUDIOSPATRICIA/refs/heads/main/Lullaby%20of%20the%20Stars.mp3',
  },
  {
    id: 'drowsy-lullaby',
    title: 'Drowsy Lullaby',
    subtitle: 'Canção de ninar doce e acolhedora',
    src: 'https://raw.githubusercontent.com/ATENDIMENTOMEGAADM/AUDIOSPATRICIA/refs/heads/main/Drowsy%20Lullaby.mp3',
  },
];

export default function ClinicRadio() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.30);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopHidden, setIsDesktopHidden] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Iniciar reprodução com tratamento de erro
  const playTrack = useCallback((index: number, shouldAutoPlay = true) => {
    if (!audioRef.current) return;
    const track = PLAYLIST[index];
    if (!track) return;

    setCurrentTrackIndex(index);
    audioRef.current.src = track.src;
    audioRef.current.load();

    if (shouldAutoPlay) {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setShowAutoplayPrompt(false);
        })
        .catch((err) => {
          console.warn("Autoplay bloqueado pelo navegador:", err);
          setIsPlaying(false);
          setIsLoading(false);
          setShowAutoplayPrompt(true);
        });
    }
  }, []);

  const handleNextTrack = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    playTrack(nextIndex, isPlaying);
  }, [currentTrackIndex, isPlaying, playTrack]);

  const handlePrevTrack = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    playTrack(prevIndex, isPlaying);
  }, [currentTrackIndex, isPlaying, playTrack]);

  const startPlayback = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setShowAutoplayPrompt(false);
      })
      .catch((err) => {
        console.warn("Autoplay bloqueado pelo navegador até interação:", err);
        setShowAutoplayPrompt(true);
      });
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = new Audio();
    audio.src = PLAYLIST[0].src;
    audio.preload = 'auto';
    audio.volume = 0.30;
    audioRef.current = audio;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setShowAutoplayPrompt(false);
    };
    const handlePause = () => setIsPlaying(false);
    
    // Quando a música atual terminar, avançar automaticamente para a próxima da fila
    const handleEnded = () => {
      setCurrentTrackIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % PLAYLIST.length;
        if (audioRef.current) {
          audioRef.current.src = PLAYLIST[nextIndex].src;
          audioRef.current.play().catch(() => {});
        }
        return nextIndex;
      });
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Tentativa 1 imediata
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setShowAutoplayPrompt(false);
      })
      .catch(() => {
        setShowAutoplayPrompt(true);
      });

    // Tentativa 2: Em qualquer toque, clique ou tecla
    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            setShowAutoplayPrompt(false);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    window.addEventListener('scroll', handleUserInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
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
      startPlayback();
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
      {/* 🔔 BANNER TOAST DE ATIVAÇÃO DE SOM (SE NAVEGADOR BLOQUEOU AUTOPLAY) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAutoplayPrompt && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] sm:w-auto"
          >
            <div 
              onClick={() => {
                startPlayback();
                setShowAutoplayPrompt(false);
              }}
              className="bg-white/95 backdrop-blur-xl border border-dourado/40 shadow-2xl p-3 sm:px-4 sm:py-2.5 rounded-full flex items-center justify-between gap-3 cursor-pointer hover:border-verde-agua transition-all active:scale-95 group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-verde-agua/20 text-verde-agua flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Volume1 className="w-4 h-4 animate-pulse" />
                </span>
                <div className="text-left pr-1">
                  <p className="text-xs font-semibold text-[#5A5350] leading-snug">
                    Ouvir a Rádio da Clínica
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Toque para ativar o som ambiente ({currentTrack.title})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startPlayback();
                    setShowAutoplayPrompt(false);
                  }}
                  className="px-3 py-1 bg-verde-agua text-white text-[11px] font-semibold rounded-full shadow-sm hover:bg-verde-agua/90"
                >
                  Tocar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAutoplayPrompt(false);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label="Dispensar aviso de som"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 📱 MODO MOBILE: BOTÃO LATERAL OCULTO / RETRÁTIL (ABA LATERAL) */}
      {/* ========================================================= */}
      <div className="md:hidden">
        {/* Aba retrátil fixada na borda lateral esquerda (ultra fina e hiper transparente) */}
        {!isMobileDrawerOpen && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed top-1/2 -translate-y-1/2 left-0 z-40"
          >
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`flex items-center gap-1 py-2 px-1 pl-1.5 rounded-r-lg shadow-sm backdrop-blur-sm border border-l-0 transition-all active:scale-95 ${
                isPlaying 
                  ? 'bg-verde-agua/25 text-verde-agua border-verde-agua/30 hover:bg-verde-agua/40' 
                  : 'bg-white/20 text-[#5A5350]/80 border-gray-200/30 hover:bg-white/40'
              }`}
              aria-label="Abrir Rádio da Clínica"
            >
              <div className="flex flex-col items-center gap-0.5">
                {isPlaying ? (
                  <div className="flex items-end justify-center gap-0.5 h-3.5 w-2.5">
                    <span className="w-0.5 bg-verde-agua rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-1.5"></span>
                    <span className="w-0.5 bg-verde-agua rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.2s] h-3"></span>
                    <span className="w-0.5 bg-verde-agua rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-2"></span>
                  </div>
                ) : (
                  <Radio className="w-3 h-3 text-dourado/70" />
                )}
                
                <span className="[writing-mode:vertical-rl] rotate-180 text-[8.5px] font-medium tracking-wider uppercase font-serif py-0.5 opacity-70">
                  {isPlaying ? 'No Ar' : 'Rádio'}
                </span>

                <ChevronRight className="w-2 h-2 opacity-40" />
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
                className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-50"
              />

              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-1/2 -translate-y-1/2 left-2.5 z-50 w-[290px] bg-white/95 rounded-3xl shadow-2xl border border-dourado/20 p-4 sm:p-5 text-[#5A5350] backdrop-blur-xl max-h-[90vh] overflow-y-auto"
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
                      <p className="text-[11px] text-gray-400">Música ambiente relaxante (30%)</p>
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

                {/* Informações da Música Atual */}
                <div className="py-3 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-verde-agua/20 to-dourado/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Music className={`w-6 h-6 text-verde-agua ${isPlaying ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-[#5A5350] truncate">{currentTrack.title}</p>
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-dourado flex-shrink-0" />
                      {currentTrack.subtitle}
                    </p>
                  </div>
                </div>

                {/* Controles de Reprodução com Avançar / Voltar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handlePrevTrack}
                      className="p-2.5 rounded-full bg-seda text-gray-600 hover:text-verde-agua hover:bg-gray-100 transition-colors active:scale-95"
                      title="Música anterior"
                      aria-label="Música anterior"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={togglePlay}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-verde-agua hover:bg-verde-agua/90 active:scale-95 text-white rounded-2xl text-xs font-semibold shadow-sm transition-all"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          Pausar Música
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                          Tocar Música
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleNextTrack}
                      className="p-2.5 rounded-full bg-seda text-gray-600 hover:text-verde-agua hover:bg-gray-100 transition-colors active:scale-95"
                      title="Próxima música da fila"
                      aria-label="Próxima música da fila"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>

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
                    <span className="text-[11px] font-mono text-gray-500 w-8 text-right">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  {/* Fila de Reprodução (Playlist) */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                        <ListMusic className="w-3.5 h-3.5 text-dourado" />
                        Fila de Reprodução ({PLAYLIST.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {PLAYLIST.map((track, idx) => {
                        const isCurrent = idx === currentTrackIndex;
                        return (
                          <button
                            key={track.id}
                            onClick={() => playTrack(idx, true)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-verde-agua/15 text-verde-agua font-semibold border border-verde-agua/30'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="truncate text-[11px]">{track.title}</p>
                              <p className="text-[9.5px] text-gray-400 truncate">{track.subtitle}</p>
                            </div>
                            {isCurrent && (
                              <div className="flex items-end gap-0.5 h-3 w-2.5 flex-shrink-0">
                                <span className={`w-0.5 bg-verde-agua rounded-full h-1.5 ${isPlaying ? 'animate-[pulse_0.6s_ease-in-out_infinite]' : ''}`}></span>
                                <span className={`w-0.5 bg-verde-agua rounded-full h-3 ${isPlaying ? 'animate-[pulse_0.4s_ease-in-out_infinite_0.2s]' : ''}`}></span>
                                <span className={`w-0.5 bg-verde-agua rounded-full h-2 ${isPlaying ? 'animate-[pulse_0.8s_ease-in-out_infinite_0.4s]' : ''}`}></span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
      {/* 💻 MODO DESKTOP: BOTÃO FLUTUANTE INFERIOR COM OPÇÃO DE OCULTAR LATERALMENTE */}
      {/* ========================================================= */}
      <div className="hidden md:block select-none">
        <AnimatePresence>
          {isDesktopHidden ? (
            /* Mini-aba na lateral esquerda quando oculto */
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="fixed bottom-6 left-0 z-40"
            >
              <button
                onClick={() => setIsDesktopHidden(false)}
                className={`flex items-center gap-2 py-2 px-3 pl-2.5 rounded-r-2xl shadow-lg border border-l-0 backdrop-blur-md transition-all active:scale-95 group ${
                  isPlaying
                    ? 'bg-verde-agua/90 text-white border-verde-agua hover:bg-verde-agua'
                    : 'bg-white/95 text-[#5A5350] border-gray-200/90 hover:bg-white hover:border-dourado/40'
                }`}
                aria-label="Restaurar player da rádio"
                title="Mostrar rádio da clínica"
              >
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5">
                      <span className="w-0.5 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2"></span>
                      <span className="w-0.5 bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.2s] h-3.5"></span>
                      <span className="w-0.5 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-2.5"></span>
                    </div>
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-dourado" />
                  )}
                </div>
                <span className="text-xs font-serif font-medium flex items-center gap-1">
                  Rádio
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </motion.div>
          ) : (
            /* Player Completo / Flutuante no Desktop */
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed bottom-6 left-6 z-40"
            >
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="mb-3 w-84 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-dourado/20 text-[#5A5350]"
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
                          <p className="text-[11px] text-gray-400">Música ambiente relaxante (30%)</p>
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
                        <p className="text-xs font-semibold text-[#5A5350] truncate">{currentTrack.title}</p>
                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-dourado flex-shrink-0" />
                          {currentTrack.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Controles de Reprodução com Avançar / Voltar */}
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handlePrevTrack}
                            className="p-2 rounded-full bg-seda text-gray-600 hover:text-verde-agua hover:bg-gray-100 transition-colors active:scale-95"
                            title="Música anterior"
                            aria-label="Música anterior"
                          >
                            <SkipBack className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3.5 py-2 bg-verde-agua hover:bg-verde-agua/90 active:scale-95 text-white rounded-full text-xs font-medium shadow-sm transition-all"
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                Tocar
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleNextTrack}
                            className="p-2 rounded-full bg-seda text-gray-600 hover:text-verde-agua hover:bg-gray-100 transition-colors active:scale-95"
                            title="Próxima música da fila"
                            aria-label="Próxima música da fila"
                          >
                            <SkipForward className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>

                        {/* Controle de Volume */}
                        <div className="flex items-center gap-2 flex-1 max-w-[130px]">
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
                          <span className="text-[10px] font-mono text-gray-400">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Lista da Fila de Reprodução */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10.5px] font-medium text-gray-500 flex items-center gap-1">
                            <ListMusic className="w-3 h-3 text-dourado" />
                            Fila de Músicas ({PLAYLIST.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {PLAYLIST.map((track, idx) => {
                            const isCurrent = idx === currentTrackIndex;
                            return (
                              <button
                                key={track.id}
                                onClick={() => playTrack(idx, true)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  isCurrent
                                    ? 'bg-verde-agua/15 text-verde-agua font-medium border border-verde-agua/20'
                                    : 'hover:bg-gray-50 text-gray-600'
                                }`}
                              >
                                <span className="truncate text-[11px]">{idx + 1}. {track.title}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-mono uppercase bg-verde-agua text-white px-1.5 py-0.5 rounded-full">
                                    {isPlaying ? 'Tocando' : 'Pausado'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão Flutuante Principal Desktop */}
              <div className="flex items-center gap-2">
                {/* Botão para ocultar/recolher para o lado */}
                <button
                  onClick={() => setIsDesktopHidden(true)}
                  className="w-8 h-8 rounded-full bg-white/90 border border-gray-200/80 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                  aria-label="Ocultar rádio para o lado"
                  title="Ocultar para a lateral"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

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
                    <span className="text-[10px] text-gray-500 leading-tight mt-0.5 truncate max-w-[140px]">
                      {isPlaying ? currentTrack.title : 'Clique para ouvir'}
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
                  title="Ver fila de reprodução"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

