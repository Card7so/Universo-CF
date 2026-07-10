import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BookOpen, ShieldCheck, HeartPulse, GraduationCap, Code, Music, Sparkles, X, Info, Calendar, ExternalLink, Globe, Lightbulb } from "lucide-react";
import { CustomProject } from "../types";

interface HeroProps {
  onExplore: (sectionId: string) => void;
}

export default function Hero({ onExplore }: HeroProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [publishedProjects, setPublishedProjects] = useState<CustomProject[]>([]);

  // Function to load projects from localStorage
  const loadPublishedProjects = () => {
    const stored = localStorage.getItem("universo_cf_published_projects");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPublishedProjects(parsed);
        } else {
          setPublishedProjects([]);
        }
      } catch (e) {
        console.error("Error parsing projects in Hero", e);
        setPublishedProjects([]);
      }
    } else {
      setPublishedProjects([]);
    }
  };

  useEffect(() => {
    loadPublishedProjects();

    // Listen to admin creations
    window.addEventListener("universo-projects-updated", loadPublishedProjects);
    return () => {
      window.removeEventListener("universo-projects-updated", loadPublishedProjects);
    };
  }, []);

  const ecosystemPillars = [
    {
      id: "apps",
      icon: Code,
      title: "Aplicativos",
      desc: "Ferramentas digitais focadas em produtividade, educação e utilidade diária.",
      launcherBg: "bg-gradient-to-b from-sky-450 via-sky-500 to-indigo-600",
      iconColor: "text-white",
      sectionLink: "apps"
    },
    {
      id: "books",
      icon: BookOpen,
      title: "Livros",
      desc: "Histórias e conhecimentos embalados em páginas de inspiração e ficção.",
      launcherBg: "bg-gradient-to-b from-indigo-400 via-indigo-550 to-purple-600",
      iconColor: "text-white",
      sectionLink: "livros"
    },
    {
      id: "music",
      icon: Music,
      title: "Músicas",
      desc: "Paisagens sonoras que acompanham o ritmo do universo criativo.",
      launcherBg: "bg-gradient-to-b from-purple-500 via-fuchsia-500 to-pink-600",
      iconColor: "text-white",
      sectionLink: "music"
    },
    {
      id: "outros",
      icon: Lightbulb,
      title: "Outros Projetos",
      desc: "Novas ideias e criações que expandem os horizontes do universo criativo.",
      launcherBg: "bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600",
      iconColor: "text-white",
      sectionLink: "outros"
    }
  ];

  const handlePillarClick = (sectionLink: string) => {
    onExplore(sectionLink);
  };

  useEffect(() => {
    const handleTriggerToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string }>;
      const type = customEvent.detail?.type;
      if (type) {
        onExplore(type);
      }
    };

    window.addEventListener("universo-trigger-toast", handleTriggerToast);
    return () => {
      window.removeEventListener("universo-trigger-toast", handleTriggerToast);
    };
  }, []);

  return (
    <section id="inicio" className="relative pt-36 pb-24 overflow-hidden hero-gradient min-h-screen flex flex-col justify-center">
      {/* Vibrant and evocative background galaxy image - clearly visible, representing "Universo CF" */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none select-none z-0 mix-blend-screen"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80')" }}
      />

      {/* Dark overlay to ensure text remains highly readable on top of the galaxy */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/40 to-[#020617] pointer-events-none select-none z-0" />

      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80 z-0" />

      {/* Radiant glow spotlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full z-10">
        {/* Intro Tag */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-white/10 mb-8 shadow-lg"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold font-mono text-sky-400 uppercase tracking-widest">
              Onde a imaginação encontra a inovação
            </span>
          </motion.div>
        </div>

        {/* Hero Title and Description */}
        <div className="text-center max-w-4xl mx-auto relative py-6">
          
          {/* Swirling Galaxy visual backdrop centered directly behind "Bem-vindo ao Universo CF" */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] pointer-events-none select-none z-0 opacity-80 mix-blend-screen overflow-hidden flex items-center justify-center">
            {/* Inner Spiral Galaxy Graphic with spinning rotation */}
            <div 
              className="w-[85%] h-[85%] rounded-full bg-cover bg-center animate-[spin_100s_linear_infinite] filter contrast-125 saturate-150"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=80')",
                maskImage: "radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)",
                WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)"
              }}
            />
            {/* Secondary cosmic glow to ensure beautiful colors (cyan & indigo) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-indigo-600/30 to-purple-600/20 rounded-full blur-3xl opacity-90 scale-90" />
            
            {/* Star burst rays */}
            <div className="absolute w-[60%] h-[60%] rounded-full bg-slate-950/20 border border-sky-400/10 animate-pulse blur-sm" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-7xl font-display font-extrabold tracking-tight text-white leading-tight relative z-10"
          >
            Bem-vindo ao <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 accent-glow">Universo CF</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-300 font-normal leading-relaxed mx-auto max-w-2xl relative z-10"
          >
            O Universo CF nasceu da vontade de transformar ideias em projetos reais e acessíveis para todos. Um espaço criativo dedicado à aprendizagem, tecnologia e arte.
          </motion.p>

        </div>

        {/* Nossas (Mission & Quote) Section */}
        <div className="mt-32 text-center max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mb-6">
            Nossas
          </h3>
          <p className="text-slate-350 text-sm sm:text-base italic leading-relaxed max-w-3xl mx-auto px-4">
            "A nossa missão é criar e compartilhar aplicativos, livros, músicas e conteúdos educativos que inspirem, ensinem e entretenham pessoas de diferentes idades. Cada projeto é desenvolvido com dedicação, buscando oferecer algo útil e significativo para quem o utiliza."
          </p>
        </div>

        {/* Explore o Universo Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            Explore o Universo
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">
            Quatro pilares de criação. Uma única visão. Descubra os projetos que compõem este ecossistema criativo.
          </p>

          {/* Exquisite Card Grid (Side-by-Side horizontally on desktop, highly polished & optimized tight spacing) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-6xl mx-auto mt-16 px-4">
            {ecosystemPillars.map((pillar, index) => {
              const PillarIcon = pillar.icon;
              return (
                <motion.div
                  id={`hero-pillar-${pillar.id}`}
                  key={pillar.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border border-white/10 rounded-[2.5rem] overflow-hidden text-left flex flex-col justify-between transition-all duration-300 bg-[#09090e] hover:bg-[#0c0c14] p-5 cursor-pointer group hover:border-amber-500/30 hover:shadow-[0_20px_50px_rgba(245,158,11,0.08)]"
                  onClick={() => handlePillarClick(pillar.sectionLink)}
                >
                  <div className="flex flex-col">
                    {/* Glowing Top graphic representing the card thumbnail in the screenshot */}
                    <div className="relative h-48 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden mb-5 z-0 bg-[#020205]">
                      {/* Custom themed glowing backdrop inside each thumbnail based on category */}
                      {pillar.id === "apps" && (
                        <>
                          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-amber-500/20 via-orange-600/30 to-slate-950" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-orange-500/35 blur-xl mix-blend-screen" />
                          <svg className="absolute inset-0 w-full h-full opacity-60 z-0 scale-95" viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="35" stroke="url(#goldGrad)" strokeWidth="0.5" strokeDasharray="1 3" />
                            <circle cx="50" cy="50" r="28" stroke="url(#goldGrad)" strokeWidth="0.75" />
                            <circle cx="50" cy="50" r="18" stroke="url(#goldGrad)" strokeWidth="1" />
                            <circle cx="50" cy="50" r="8" stroke="url(#goldGrad)" strokeWidth="0.5" strokeDasharray="2 1" />
                            <line x1="50" y1="10" x2="50" y2="90" stroke="url(#goldGrad)" strokeWidth="0.5" strokeDasharray="3 3" />
                            <line x1="10" y1="50" x2="90" y2="50" stroke="url(#goldGrad)" strokeWidth="0.5" strokeDasharray="3 3" />
                            <path d="M50 32 L50 24 M50 76 L50 68 M32 50 L24 50 M76 50 L68 50" stroke="url(#goldGrad)" strokeWidth="1.25" />
                            <path d="M38 38 L34 34 M62 38 L66 34 M38 62 L34 66 M62 62 L66 66" stroke="url(#goldGrad)" strokeWidth="0.75" />
                            <defs>
                              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#ea580c" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.2" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </>
                      )}

                      {pillar.id === "books" && (
                        <>
                          <div className="absolute inset-0 bg-[#030712] bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-35" />
                          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-[#1e1b4b]/45 via-[#311042]/30 to-slate-950" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-36 h-36 rounded-full bg-indigo-500/20 blur-xl mix-blend-screen" />
                          <svg className="absolute inset-0 w-full h-full opacity-70 scale-90" viewBox="0 0 100 100" fill="none">
                            <ellipse cx="50" cy="45" rx="32" ry="12" stroke="url(#indigoGrad)" strokeWidth="0.5" transform="rotate(-15 50 45)" />
                            <ellipse cx="50" cy="45" rx="32" ry="12" stroke="url(#indigoGrad)" strokeWidth="0.5" transform="rotate(45 50 45)" />
                            <ellipse cx="50" cy="45" rx="32" ry="12" stroke="url(#indigoGrad)" strokeWidth="0.5" transform="rotate(105 50 45)" />
                            <circle cx="50" cy="13" r="1.5" fill="#fef08a" />
                            <circle cx="34" cy="22" r="1" fill="#fbbf24" />
                            <circle cx="66" cy="22" r="1.25" fill="#f59e0b" />
                            <circle cx="21" cy="45" r="1.5" fill="#fef08a" />
                            <circle cx="79" cy="45" r="1" fill="#fff" />
                            <circle cx="50" cy="77" r="1.5" fill="#fbbf24" />
                            <circle cx="34" cy="68" r="1.25" fill="#fff" />
                            <circle cx="66" cy="68" r="1" fill="#fbbf24" />
                            <line x1="50" y1="13" x2="34" y2="22" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="50" y1="13" x2="66" y2="22" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="34" y1="22" x2="21" y2="45" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="66" y1="22" x2="79" y2="45" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="21" y1="45" x2="34" y2="68" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="79" y1="45" x2="66" y2="68" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="34" y1="68" x2="50" y2="77" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="66" y1="68" x2="50" y2="77" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
                            <line x1="50" y1="13" x2="50" y2="77" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1 2" strokeOpacity="0.3" />
                            <line x1="21" y1="45" x2="79" y2="45" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1 2" strokeOpacity="0.3" />
                            <defs>
                              <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                                <stop offset="55%" stopColor="#a855f7" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute bottom-4 inset-x-0 text-center tracking-[0.35em] text-[7px] font-extrabold text-[#fbbf24]/50 uppercase font-mono">
                            S Y N A P T I C
                          </div>
                        </>
                      )}

                      {pillar.id === "music" && (
                        <>
                          <div className="absolute inset-0 bg-[#02040a] bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-40" />
                          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-[#111827]/60 via-[#1f1625]/45 to-slate-950" />
                          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-indigo-500 blur-md opacity-95 group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-orange-500/25 blur-2xl" />
                          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-[#05070f] shadow-[inset_0_-4px_12px_rgba(255,255,255,0.06),0_0_20px_rgba(0,0,0,0.95)] border border-white/5 z-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1e1b4b]/40 to-[#0c0a0f] opacity-80" />
                          </div>
                          <div className="absolute top-[28%] left-[62%] w-4 h-4 rounded-full bg-white shadow-[0_0_15px_6px_rgba(255,255,255,1),0_0_30px_10px_rgba(251,191,36,0.8)] z-10" />
                          <div className="absolute top-[29%] left-[63%] w-20 h-[1px] bg-white/40 rotate-[35deg] blur-[0.5px] pointer-events-none" />
                          <div className="absolute top-[29%] left-[51%] w-[1px] h-20 bg-white/40 rotate-[35deg] blur-[0.5px] pointer-events-none" />
                        </>
                      )}

                      {pillar.id === "outros" && (
                        <>
                          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-b from-amber-500/20 via-yellow-600/10 to-slate-950" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-amber-500/15 blur-xl group-hover:scale-110 transition-transform duration-500" />
                          
                          <svg className="absolute inset-0 w-full h-full opacity-70 scale-95" viewBox="0 0 100 100" fill="none">
                            <ellipse cx="50" cy="45" rx="36" ry="14" stroke="url(#amberGrad)" strokeWidth="0.5" strokeDasharray="2 3" transform="rotate(-10 50 45)" />
                            <circle cx="50" cy="45" r="24" stroke="url(#amberGrad)" strokeWidth="0.75" />
                            
                            <path d="M50 20 C40 20 36 28 36 38 C36 46 42 52 44 56 L44 64 C44 65 45 66 46 66 L54 66 C55 66 56 65 56 64 L56 56 C58 52 64 46 64 38 C64 28 60 20 50 20 Z" stroke="url(#goldLightGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            
                            <path d="M46 38 L49 46 L51 46 L54 38" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                            
                            <path d="M45 69 L55 69 M47 72 L53 72" stroke="url(#amberGrad)" strokeWidth="1.5" strokeLinecap="round" />
                            
                            <circle cx="30" cy="25" r="1" fill="#fef08a" />
                            <circle cx="70" cy="25" r="1" fill="#fef08a" />
                            <circle cx="24" cy="48" r="1.5" fill="#f59e0b" />
                            <circle cx="76" cy="48" r="1.25" fill="#fef08a" />
                            <circle cx="50" cy="13" r="1.5" fill="#fff" />
                            
                            <defs>
                              <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#78350f" stopOpacity="0.2" />
                              </linearGradient>
                              <linearGradient id="goldLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute bottom-4 inset-x-0 text-center tracking-[0.35em] text-[7px] font-extrabold text-[#fbbf24]/50 uppercase font-mono">
                            I N N O V A T I O N
                          </div>
                        </>
                      )}

                      {/* Tactile floating container in upper left */}
                      <div className="absolute top-4 left-4 z-10 w-11 h-11 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 flex items-center justify-center text-amber-500 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-amber-500/30">
                        <PillarIcon className="w-5 h-5 stroke-[2.25]" />
                      </div>
                    </div>

                    <h4 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight px-1 transition-colors duration-200 group-hover:text-amber-400">
                      {pillar.title}
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed px-1 min-h-[4rem]">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="px-1.5 pb-2 pt-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 group-hover:text-amber-400 transition-colors">
                      Explorar <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 z-55 max-w-sm glass border border-sky-500/25 bg-slate-950/95 text-white rounded-2xl p-4.5 shadow-2xl flex items-start gap-3.5"
          >
            <div className="mt-0.5 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-grow text-left">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono">Universo CF</h4>
              <p className="mt-1 text-xs text-slate-350 leading-relaxed">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
