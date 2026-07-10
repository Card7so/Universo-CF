import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getLargeFile } from "../utils/indexedDB";
import { 
  ArrowLeft, 
  Code, 
  BookOpen, 
  Music, 
  Lightbulb, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Download, 
  Star, 
  MessageSquare, 
  Send, 
  User,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  X
} from "lucide-react";
import { CustomProject } from "../types";
// @ts-ignore
import minsaLogo from "../assets/images/minsa_prep_cf_logo_1782517690942.jpg";

interface PillarViewProps {
  category: "apps" | "books" | "music" | "outros";
  onBack: () => void;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export default function PillarView({ category, onBack }: PillarViewProps) {
  const [projects, setProjects] = useState<CustomProject[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  
  // Interactive UI States for cards
  const [hoveredStars, setHoveredStars] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [newCommentAuthor, setNewCommentAuthor] = useState<Record<string, string>>({});
  const [successRating, setSuccessRating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load projects
    const loadProjects = async () => {
      const stored = localStorage.getItem("universo_cf_published_projects");
      if (stored) {
        try {
          const parsed: CustomProject[] = JSON.parse(stored);
          const filtered = parsed.filter((p) => p.type === category);
          
          const hydrated = await Promise.all(
            filtered.map(async (p) => {
              let fileData = p.fileData;
              let coverImageData = p.coverImageData;
              
              if (fileData === "indexeddb") {
                const storedFile = await getLargeFile(`file_${p.id}`);
                if (storedFile) fileData = storedFile;
              }
              if (coverImageData === "indexeddb") {
                const storedCover = await getLargeFile(`cover_${p.id}`);
                if (storedCover) coverImageData = storedCover;
              }
              
              return {
                ...p,
                fileData,
                coverImageData,
              };
            })
          );
          
          setProjects(hydrated);
        } catch (e) {
          console.error("Error loading projects in PillarView", e);
        }
      } else {
        setProjects([]);
      }
    };

    // Load Ratings
    const storedRatings = localStorage.getItem("universo_cf_ratings");
    if (storedRatings) {
      try {
        setRatings(JSON.parse(storedRatings));
      } catch (e) {
        console.error("Error loading ratings", e);
      }
    }

    // Load Comments
    const storedComments = localStorage.getItem("universo_cf_comments");
    if (storedComments) {
      try {
        setComments(JSON.parse(storedComments));
      } catch (e) {
        console.error("Error loading comments", e);
      }
    }

    loadProjects();
    window.addEventListener("universo-projects-updated", loadProjects);
    return () => {
      window.removeEventListener("universo-projects-updated", loadProjects);
    };
  }, [category]);

  const handleRate = (projectId: string, score: number) => {
    const updated = { ...ratings, [projectId]: score };
    setRatings(updated);
    localStorage.setItem("universo_cf_ratings", JSON.stringify(updated));
    
    // Set success state for feedback animation
    setSuccessRating(prev => ({ ...prev, [projectId]: true }));
    setTimeout(() => {
      setSuccessRating(prev => ({ ...prev, [projectId]: false }));
    }, 2000);
  };

  const handleSendComment = (projectId: string) => {
    const text = newCommentText[projectId]?.trim();
    if (!text) return;

    const author = newCommentAuthor[projectId]?.trim() || "Visitante";
    const newComment: Comment = {
      id: "comment_" + Date.now(),
      author,
      text,
      date: new Date().toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    const projectComments = comments[projectId] || [];
    const updatedComments = {
      ...comments,
      [projectId]: [...projectComments, newComment]
    };

    setComments(updatedComments);
    localStorage.setItem("universo_cf_comments", JSON.stringify(updatedComments));

    // Reset input fields
    setNewCommentText(prev => ({ ...prev, [projectId]: "" }));
    setNewCommentAuthor(prev => ({ ...prev, [projectId]: "" }));
    
    // Ensure comments section is expanded to see the new comment
    setExpandedComments(prev => ({ ...prev, [projectId]: true }));
  };

  const handleDownload = (project: CustomProject) => {
    // If the project has an external download link and no fileData uploaded directly, open that link in a new tab
    if (!project.fileData && project.link && project.link !== "#" && (project.link.startsWith("http") || project.link.includes("."))) {
      window.open(project.link, "_blank");
      return;
    }

    let filename = project.fileName || `${project.title.toLowerCase().replace(/\s+/g, "_")}_universo_cf.zip`;
    const lowerFn = filename.toLowerCase();

    // Sanitize filename: if it is generic (e.g. "base.apk", "app.apk", "file.apk") or if it's an APK,
    // customize it beautifully based on the project's title to avoid browser collision warnings ("Do you want to download again?") and look high-trust.
    const isGeneric = lowerFn === "base.apk" || lowerFn === "app.apk" || lowerFn === "file.apk" || lowerFn === "universo.apk" || !filename;
    
    if (isGeneric || lowerFn.endsWith(".apk")) {
      const cleanTitle = project.title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
        .replace(/[^a-zA-Z0-9]/g, "_")   // keep alphanumeric and replace rest with underscores
        .replace(/_+/g, "_")             // remove repeated underscores
        .replace(/^_+|_+$/g, "");        // trim leading/trailing underscores
      
      const extension = lowerFn.endsWith(".apk") ? "apk" : (lowerFn.split(".").pop() || "zip");
      filename = `${cleanTitle || "App"}_Universo_CF.${extension}`;
    }

    const element = document.createElement("a");
    
    if (project.fileData) {
      element.href = project.fileData;
    } else {
      // Generate simulated file to download
      const file = new Blob(["Simulated Universo CF download content for " + project.title], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
    }
    
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCategoryDetails = () => {
    switch (category) {
      case "apps":
        return {
          title: "Aplicativos",
          subtitle: "Tecnologia & Utilidades",
          desc: "Ferramentas digitais desenhadas para otimizar o seu dia-a-dia, trazer soluções práticas e impulsionar a produtividade.",
          icon: Code,
          colorClass: "text-sky-450 bg-sky-500/10 border-sky-500/20",
          glowBg: "from-sky-500/10 via-sky-600/5 to-transparent",
          emptyText: "Novos aplicativos serão apresentados aqui quando estiverem prontos."
        };
      case "books":
        return {
          title: "Livros",
          subtitle: "Cultura & Conhecimento",
          desc: "Contos envolventes, ensaios instigantes e manuais de aprendizagem para alimentar a imaginação e a partilha intelectual.",
          icon: BookOpen,
          colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
          glowBg: "from-indigo-500/10 via-purple-600/5 to-transparent",
          emptyText: "Novos livros e contos serão apresentados aqui quando estiverem prontos."
        };
      case "music":
        return {
          title: "Músicas",
          subtitle: "Arte Sonora & Foco",
          desc: "Melodias, paisagens acústicas e sintetizadores interativos concebidos para inspirar foco, serenidade e harmonia.",
          icon: Music,
          colorClass: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
          glowBg: "from-fuchsia-500/10 via-pink-600/5 to-transparent",
          emptyText: "Novas músicas serão apresentadas aqui quando estiverem prontas."
        };
      case "outros":
      default:
        return {
          title: "Outros Projetos",
          subtitle: "Inovação & Experiências",
          desc: "Criações experimentais, ideias criativas multidisciplinares e novos horizontes em constante desenvolvimento.",
          icon: Lightbulb,
          colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          glowBg: "from-amber-500/10 via-orange-600/5 to-transparent",
          emptyText: "Outros projetos serão apresentados aqui quando estiverem prontos."
        };
    }
  };

  const details = getCategoryDetails();
  const IconComponent = details.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 pt-32 pb-24"
    >
      {/* Back Button */}
      <div className="mb-10 text-left">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase tracking-wider focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[2rem] border border-white/10 overflow-hidden bg-[#09090e] p-8 sm:p-10 mb-12 text-left">
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${details.glowBg} rounded-full blur-3xl pointer-events-none`} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${details.colorClass} mb-4`}>
              <IconComponent className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest">
                {details.subtitle}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              {details.title}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              {details.desc}
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center text-slate-200 shadow-xl">
              <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {projects.length > 0 ? (
        <div className="space-y-12">
          {projects.map((project) => {
            const currentRating = ratings[project.id] || 0;
            const currentHoverRating = hoveredStars[project.id] || 0;
            const projectCommentsList = comments[project.id] || [];
            const isCommentsExpanded = !!expandedComments[project.id];
            const hasRatedSuccessfully = !!successRating[project.id];

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-white/10 rounded-3xl bg-[#09090e]/90 hover:border-white/15 transition-all shadow-xl group relative overflow-hidden text-left"
              >
                {/* Accent glow on card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-full blur-3xl pointer-events-none" />

                {/* Main content flex layout */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    
                    {/* App Image container */}
                    <div className="w-full md:w-44 flex-shrink-0">
                      <div className="w-full aspect-video md:aspect-square rounded-2xl overflow-hidden border border-white/10 relative shadow-inner bg-black/40">
                        <img
                          src={project.coverImageData || (
                            project.title.toLowerCase().includes("minsa") || 
                            project.title.toLowerCase().includes("prep") || 
                            project.title.toLowerCase().includes("cf")
                              ? minsaLogo
                              : (
                                  category === "apps" ? minsaLogo :
                                  category === "books" ? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80" :
                                  category === "music" ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80" :
                                  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80"
                                )
                          )}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* App Details */}
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-md uppercase mr-3">
                            {project.publishedAt}
                          </span>
                        </div>

                        {/* Top Link button */}
                        {project.link && project.link !== "#" && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <h2 className="text-2xl font-display font-extrabold text-white tracking-tight leading-none">
                        {project.title}
                      </h2>

                      {/* Full un-truncated description */}
                      <div className="text-slate-300 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                        {project.desc || "Sem descrição disponível para este projeto."}
                      </div>

                      {/* Call to Actions bar */}
                      <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                        {/* Rating System Area */}
                        <div className="space-y-1.5 min-w-[200px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                            Avaliar este aplicativo:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((starValue) => {
                                const active = starValue <= (currentHoverRating || currentRating);
                                return (
                                  <button
                                    key={starValue}
                                    type="button"
                                    onClick={() => handleRate(project.id, starValue)}
                                    onMouseEnter={() => setHoveredStars(prev => ({ ...prev, [project.id]: starValue }))}
                                    onMouseLeave={() => setHoveredStars(prev => ({ ...prev, [project.id]: 0 }))}
                                    className="p-0.5 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                                  >
                                    <Star 
                                      className={`w-5 h-5 transition-colors ${
                                        active 
                                          ? "text-yellow-400 fill-yellow-400" 
                                          : "text-slate-600 hover:text-slate-400"
                                      }`} 
                                    />
                                  </button>
                                );
                              })}
                            </div>
                            <AnimatePresence mode="wait">
                              {hasRatedSuccessfully ? (
                                <motion.span
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 5 }}
                                  className="text-xs text-green-400 flex items-center gap-1 font-semibold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Avaliado!
                                </motion.span>
                              ) : currentRating > 0 ? (
                                <span className="text-xs text-yellow-500 font-bold">
                                  ({currentRating} / 5 estrelas)
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  Ainda não avaliado
                                </span>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Action Buttons: Download + Link */}
                        <div className="flex items-center gap-3">
                          {project.link && project.link !== "#" && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all hover:border-white/20"
                            >
                              <span>Aceder</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handleDownload(project)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-450 border border-amber-500/20 text-xs font-bold text-slate-950 transition-all shadow-md active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Baixar</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Collapsible Comments Section */}
                <div className="border-t border-white/5 bg-[#050508]/60 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [project.id]: !isCommentsExpanded }))}
                      className="text-xs font-bold text-slate-450 hover:text-slate-200 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none select-none"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span>Escreve comentários ({projectCommentsList.length})</span>
                    </button>
                    
                    <span className="text-[10px] font-mono text-slate-600">
                      Ver comentários
                    </span>
                  </div>

                  <AnimatePresence>
                    {isCommentsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6 pt-2 space-y-4 border-t border-white/2"
                      >
                        {/* List of Comments */}
                        {projectCommentsList.length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {projectCommentsList.map((comm) => (
                              <div 
                                key={comm.id} 
                                className="bg-[#0b0b12]/80 border border-white/5 rounded-2xl p-3.5 flex gap-3 text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h5 className="text-xs font-bold text-white truncate">
                                      {comm.author}
                                    </h5>
                                    <span className="text-[9px] font-mono text-slate-500">
                                      {comm.date}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-350 leading-relaxed break-words whitespace-pre-wrap">
                                    {comm.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2 text-left">
                            Nenhum comentário publicado ainda. Seja o primeiro a comentar!
                          </p>
                        )}

                        {/* Add Comment Form */}
                        <div className="pt-3 border-t border-white/5 space-y-3">
                          <h4 className="text-xs font-bold text-slate-300 font-display">
                            Escreve comentários
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              value={newCommentAuthor[project.id] || ""}
                              onChange={(e) => setNewCommentAuthor(prev => ({ ...prev, [project.id]: e.target.value }))}
                              placeholder="Seu nome (opcional)"
                              className="sm:col-span-1 bg-[#020204]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                            />
                            <div className="sm:col-span-2 flex gap-2">
                              <textarea
                                value={newCommentText[project.id] || ""}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [project.id]: e.target.value }))}
                                placeholder="Adicione o seu comentário..."
                                rows={1}
                                className="flex-1 bg-[#020204]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all"
                              />
                              <button
                                onClick={() => handleSendComment(project.id)}
                                disabled={!newCommentText[project.id]?.trim()}
                                className="px-4 bg-amber-500 hover:bg-amber-450 disabled:bg-white/5 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Enviar</span>
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Dynamic beautiful "Em breve" view */
        <div className="border border-dashed border-white/10 rounded-[2.5rem] bg-[#030712]/40 p-12 sm:p-20 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-8 shadow-inner animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <h3 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Em breve
          </h3>

          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed px-4">
            {details.emptyText}
          </p>

          <div className="mt-8">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 border border-amber-500/15 px-4 py-2 rounded-full">
              🚧 Sob Desenvolvimento
            </span>
          </div>
        </div>
      )}

    </motion.div>
  );
}
