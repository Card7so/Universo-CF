import JSZip from "jszip";
import { CustomProject } from "../types";

/**
 * Generates a full-stack offline-ready static website bundle (HTML + CSS + JS) as a ZIP file.
 * The website features a dynamic theme, real-time updated copyright and clock widgets,
 * full-text search, star ratings, and custom comment posting with LocalStorage state persistence,
 * as well as direct decoding and downloading of embedded files.
 */
export async function generateSiteZip(
  projects: CustomProject[],
  comments: Record<string, any[]>,
  ratings: Record<string, number>
): Promise<Blob> {
  const zip = new JSZip();

  // Create clean dehydrated array of projects to embed (including their files/covers if hydrated)
  const cleanProjects = projects.map(p => ({
    id: p.id,
    type: p.type,
    title: p.title,
    desc: p.desc,
    link: p.link,
    publishedAt: p.publishedAt,
    fileName: p.fileName,
    fileSize: p.fileSize,
    fileData: p.fileData,
    coverImageData: p.coverImageData,
    allowDownload: p.allowDownload ?? true
  }));

  // Build index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-PT" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Universo CF — Cardoso Francisco</title>
  
  <!-- Font Integrations -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Tailwind Configuration -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            display: ['Space Grotesk', 'sans-serif'],
            mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
          },
          colors: {
            sky: {
              450: '#38bdf8',
            },
            amber: {
              450: '#fbbf24',
            },
            fuchsia: {
              450: '#e879f9',
            }
          }
        }
      }
    }
  </script>

  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-[#020617] text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-sky-500/10 selection:text-sky-400 overflow-x-hidden">

  <!-- Glow Background Accents -->
  <div class="fixed top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-indigo-900/15 blur-[120px] pointer-events-none z-0"></div>
  <div class="fixed bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-amber-900/10 blur-[120px] pointer-events-none z-0"></div>

  <!-- Header Navigation -->
  <header class="fixed top-0 inset-x-0 z-40 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 transition-all">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="#inicio" onclick="navigateTo('home')" class="flex items-center gap-3.5 group select-none">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
          <svg class="w-5.5 h-5.5 text-slate-950 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        </div>
        <div>
          <span class="font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Universo CF</span>
          <p class="text-[9px] text-amber-500 font-mono tracking-widest font-bold uppercase mt-0.5">Cardoso Francisco</p>
        </div>
      </a>

      <!-- Desktop Navbar Items -->
      <nav class="hidden md:flex items-center gap-1 bg-white/2 border border-white/5 rounded-full p-1.5 backdrop-blur-md">
        <button onclick="navigateTo('home')" id="nav-inicio" class="nav-item px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-amber-500 text-slate-950">Início</button>
        <button onclick="scrollToId('about-section')" class="nav-item px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-slate-400 hover:text-white">Sobre</button>
        <button onclick="scrollToId('mural-section')" class="nav-item px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-slate-400 hover:text-white">Mural</button>
        <button onclick="openContactModal()" class="nav-item px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-slate-400 hover:text-white">Contacto</button>
      </nav>

      <!-- Action Button -->
      <div class="flex items-center gap-3">
        <button onclick="openContactModal()" class="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-white transition-all cursor-pointer">
          Contacto
        </button>
      </div>
    </div>
  </header>

  <!-- Main View Container -->
  <main class="flex-grow pt-20 z-10 relative">

    <!-- VIEW: HOME -->
    <section id="view-home" class="view-panel block">
      
      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center relative">
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 select-none animate-pulse">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span class="text-[9px] font-bold font-mono uppercase tracking-widest">Portal Oficial de Lançamentos</span>
          </div>

          <h1 class="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-[1.05]">
            Explora o Universo <span class="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Digital</span> de Cardoso Francisco
          </h1>

          <p class="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
            Um hub de inovação, arte sonora, literatura e tecnologia desenhado de forma minimalista para inspirar, empoderar e partilhar soluções offline e online.
          </p>

          <!-- Digital Clock Widget & System Status -->
          <div class="flex flex-wrap justify-center gap-4 mt-8">
            <div class="bg-white/2 border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-3.5 backdrop-blur-md">
              <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-left font-mono">
                <span id="live-clock" class="text-sm font-bold text-white tracking-widest">00:00:00</span>
                <p id="live-date" class="text-[9px] text-slate-500 font-bold uppercase mt-0.5">A carregar data...</p>
              </div>
            </div>

            <div class="bg-white/2 border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-3.5 backdrop-blur-md">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div class="text-left font-mono">
                <span class="text-xs font-bold text-white uppercase tracking-wider">Mural Ativo</span>
                <p class="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">Online 24/7 • UTC-1</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16 text-left">
          <div class="bg-[#09090e] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
            <span class="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">Aplicativos</span>
            <h4 id="stat-apps" class="text-2xl font-display font-black text-white mt-1">0</h4>
            <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">Utilitários & APKs</p>
          </div>
          <div class="bg-[#09090e] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
            <span class="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">Livros</span>
            <h4 id="stat-books" class="text-2xl font-display font-black text-white mt-1">0</h4>
            <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">Contos & Literaturas</p>
          </div>
          <div class="bg-[#09090e] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
            <span class="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">Músicas</span>
            <h4 id="stat-music" class="text-2xl font-display font-black text-white mt-1">0</h4>
            <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">Sintetizadores & Beats</p>
          </div>
          <div class="bg-[#09090e] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
            <span class="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">Feedback</span>
            <h4 id="stat-comments" class="text-2xl font-display font-black text-white mt-1">0</h4>
            <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">Comentários Ativos</p>
          </div>
        </div>

        <!-- Pillars Navigation Container -->
        <div id="mural-section" class="max-w-6xl mx-auto mt-24">
          <div class="text-left mb-10">
            <span class="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-3.5 py-1.5 rounded-full">Pilares do Mural</span>
            <h3 class="text-2xl sm:text-3xl font-display font-black text-white mt-3.5">Navega Pelos Conteúdos</h3>
            <p class="text-slate-400 text-xs mt-1.5 max-w-lg">Clica num dos pilares abaixo para abrir a galeria interativa de projetos publicados no mural.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Pillar Apps -->
            <div onclick="navigateTo('apps')" class="group cursor-pointer border border-white/10 rounded-[2rem] overflow-hidden text-left bg-[#09090e] p-5 hover:border-sky-500/30 hover:bg-[#0c0c14] transition-all duration-300">
              <div class="relative h-44 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-[#020205] mb-5">
                <div class="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-sky-600/5 to-transparent"></div>
                <div class="absolute w-32 h-32 rounded-full bg-sky-500/10 blur-xl"></div>
                <svg class="w-10 h-10 text-sky-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 class="font-display font-bold text-white text-base">Aplicativos</h4>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">Ferramentas e utilidades digitais completas.</p>
            </div>

            <!-- Pillar Books -->
            <div onclick="navigateTo('books')" class="group cursor-pointer border border-white/10 rounded-[2rem] overflow-hidden text-left bg-[#09090e] p-5 hover:border-indigo-500/30 hover:bg-[#0c0c14] transition-all duration-300">
              <div class="relative h-44 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-[#020205] mb-5">
                <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent"></div>
                <div class="absolute w-32 h-32 rounded-full bg-indigo-500/10 blur-xl"></div>
                <svg class="w-10 h-10 text-indigo-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 class="font-display font-bold text-white text-base">Livros</h4>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">Contos e manuscritos literários de Cardoso Francisco.</p>
            </div>

            <!-- Pillar Music -->
            <div onclick="navigateTo('music')" class="group cursor-pointer border border-white/10 rounded-[2rem] overflow-hidden text-left bg-[#09090e] p-5 hover:border-fuchsia-500/30 hover:bg-[#0c0c14] transition-all duration-300">
              <div class="relative h-44 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-[#020205] mb-5">
                <div class="absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 via-fuchsia-600/5 to-transparent"></div>
                <div class="absolute w-32 h-32 rounded-full bg-fuchsia-500/10 blur-xl"></div>
                <svg class="w-10 h-10 text-fuchsia-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h4 class="font-display font-bold text-white text-base">Músicas</h4>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">Soluções sonoras, MP3s e ambientes relaxantes.</p>
            </div>

            <!-- Pillar Others -->
            <div onclick="navigateTo('outros')" class="group cursor-pointer border border-white/10 rounded-[2rem] overflow-hidden text-left bg-[#09090e] p-5 hover:border-amber-500/30 hover:bg-[#0c0c14] transition-all duration-300">
              <div class="relative h-44 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-[#020205] mb-5">
                <div class="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent"></div>
                <div class="absolute w-32 h-32 rounded-full bg-amber-500/10 blur-xl"></div>
                <svg class="w-10 h-10 text-amber-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 113.536 0V21h-3.536v-5.457z" />
                </svg>
              </div>
              <h4 class="font-display font-bold text-white text-base">Outros</h4>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">Experimentações artísticas, links e ideias gerais.</p>
            </div>
          </div>
        </div>

        <!-- About Author Section -->
        <div id="about-section" class="max-w-5xl mx-auto mt-32 text-left border-t border-white/5 pt-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6">
              <span class="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-3.5 py-1.5 rounded-full">Sobre o Autor</span>
              <h3 class="text-3xl font-display font-black text-white">Cardoso Francisco</h3>
              <p class="text-slate-400 text-sm leading-relaxed font-sans">
                Fundador do <strong class="text-white">Universo CF</strong>, Cardoso Francisco é programador, escritor e artista digital empenhado em construir caminhos simplificados para soluções inteligentes. Com foco no desenvolvimento de aplicações eficientes e literaturas cativantes, este portal é a sua montra e mural de partilha para o mundo.
              </p>
              <div class="flex gap-4">
                <a href="#contacto" onclick="openContactModal()" class="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-450 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all select-none">
                  Falar com Cardoso
                </a>
              </div>
            </div>

            <!-- Beautiful Tech/Terminal Column -->
            <div class="lg:col-span-5 bg-[#040409] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden font-mono text-[11px] text-slate-300">
              <div class="flex items-center gap-1.5 pb-3.5 border-b border-white/5 mb-4">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-[9px] text-slate-500 ml-2 font-bold uppercase tracking-wider">cardoso_sys.log</span>
              </div>
              <div class="space-y-2 select-none">
                <p class="text-amber-500">> sys.init_sequence()</p>
                <p class="text-slate-500">A iniciar canais de comunicação com Angola...</p>
                <p class="text-emerald-500">OK — Canal síncrono estabelecido com sucesso.</p>
                <p class="text-amber-500">> sys.check_copyright()</p>
                <p class="text-slate-300">Copyright ativo: © <span class="auto-update-year">2026</span> Universo CF.</p>
                <p class="text-slate-400">> Cardoso Francisco status: <span class="text-emerald-500 font-bold">ONLINE</span></p>
                <p class="text-slate-500">// Atualizado diariamente e anualmente...</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- VIEW: PILLAR DETAILS -->
    <section id="view-pillar" class="view-panel hidden max-w-4xl mx-auto px-6 py-12">
      <!-- Back Button -->
      <div class="mb-10 text-left">
        <button onclick="navigateTo('home')" class="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase tracking-wider">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Voltar ao Início</span>
        </button>
      </div>

      <!-- Header Banner -->
      <div class="relative rounded-[2rem] border border-white/10 overflow-hidden bg-[#09090e] p-8 sm:p-10 mb-12 text-left">
        <div id="pillar-glow" class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="flex-1">
            <div id="pillar-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 text-amber-500 bg-amber-500/10 mb-4">
              <span id="pillar-badge-text" class="text-[9px] font-bold font-mono uppercase tracking-widest">Categoria</span>
            </div>
            <h1 id="pillar-title" class="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">Título</h1>
            <p id="pillar-desc" class="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">Descrição...</p>
          </div>
          <div id="pillar-icon-box" class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center text-slate-200">
            <!-- Icon is injected here dynamically -->
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-10 text-left">
        <div class="relative max-w-md">
          <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            id="project-search"
            type="text"
            oninput="handleSearch(this.value)"
            placeholder="Pesquisar projetos pelo título..."
            class="w-full bg-[#09090e] border border-white/10 focus:border-amber-500/50 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
          />
        </div>
      </div>

      <!-- Project List Container -->
      <div id="project-list" class="space-y-12">
        <!-- Projects will be rendered dynamically here -->
      </div>

      <!-- Empty Category View -->
      <div id="empty-pillar" class="hidden border border-dashed border-white/10 rounded-[2.5rem] bg-[#030712]/40 p-12 sm:p-20 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-8 shadow-inner animate-pulse">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 class="text-3xl font-display font-extrabold text-white tracking-tight">Em breve</h3>
        <p id="empty-pillar-text" class="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed px-4">Novos ficheiros serão disponibilizados nesta secção quando estiverem concluídos.</p>
        <div class="mt-8">
          <span class="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 border border-amber-500/15 px-4 py-2 rounded-full">🚧 Sob Desenvolvimento</span>
        </div>
      </div>
    </section>

  </main>

  <!-- Global Footer -->
  <footer class="border-t border-white/5 bg-[#01030a] py-16 z-20 relative text-left">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
      
      <div class="md:col-span-5 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-slate-950 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
            </svg>
          </div>
          <span class="font-display font-black text-xs tracking-wider uppercase">Universo CF</span>
        </div>
        <p class="text-slate-400 text-xs leading-relaxed max-w-sm font-sans">
          Uma plataforma digital exclusiva para partilhar conhecimento, softwares independentes, publicações e soluções que melhoram o seu dia.
        </p>
      </div>

      <div class="md:col-span-4 space-y-4">
        <h5 class="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Navegação Rápida</h5>
        <div class="grid grid-cols-2 gap-2">
          <a href="#inicio" onclick="navigateTo('home')" class="text-slate-500 hover:text-amber-500 text-xs transition-colors font-sans">Início</a>
          <a href="#mural" onclick="scrollToId('mural-section')" class="text-slate-500 hover:text-amber-500 text-xs transition-colors font-sans">Mural de Ficheiros</a>
          <a href="#sobre" onclick="scrollToId('about-section')" class="text-slate-500 hover:text-amber-500 text-xs transition-colors font-sans">Sobre Cardoso</a>
          <a href="#contacto" onclick="openContactModal()" class="text-slate-500 hover:text-amber-500 text-xs transition-colors font-sans">Enviar Mensagem</a>
        </div>
      </div>

      <div class="md:col-span-3 space-y-4 font-mono text-[10px]">
        <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status Local</h5>
        <p class="text-slate-500">Angola, Luanda</p>
        <p class="text-amber-500">UTC-1 • Fuso Horário de Luanda</p>
      </div>

    </div>

    <!-- Sub-Footer -->
    <div class="max-w-7xl mx-auto px-6 border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
      <span>
        © <span id="copyright-year">2026</span> Universo CF — Cardoso Francisco. Todos os direitos reservados.
      </span>
      <div class="flex gap-6">
        <span class="font-mono text-[9px] text-slate-600 uppercase tracking-wider font-bold">Desenvolvido com Rigor Científico</span>
      </div>
    </div>
  </footer>

  <!-- Contact Modal -->
  <div id="contact-modal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0a0a14] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-8 sm:p-10 relative text-left">
      <button onclick="closeContactModal()" class="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="space-y-4">
        <span class="text-[9px] font-bold text-amber-500 font-mono uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-3.5 py-1.5 rounded-full">Mensagem Direta</span>
        <h3 class="text-2xl font-display font-black text-white">Contactar Cardoso</h3>
        <p class="text-slate-400 text-xs leading-relaxed max-w-sm">Insira os seus dados abaixo e envie-me uma mensagem direta. Responderei o mais rápido possível!</p>
      </div>

      <form id="contact-form" onsubmit="handleContactSubmit(event)" class="space-y-4 mt-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Nome</label>
            <input type="text" id="contact-name" required class="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">E-mail</label>
            <input type="email" id="contact-email" required class="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Assunto</label>
          <input type="text" id="contact-subject" required class="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all" />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Mensagem</label>
          <textarea id="contact-msg" required rows="4" class="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-4.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all">Enviar Mensagem</button>
      </form>
    </div>
  </div>

  <!-- Global Toast Notification -->
  <div id="toast-notif" class="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4.5 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-2xl hidden">
    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span id="toast-msg" class="text-xs font-bold font-sans">Mensagem de sucesso!</span>
  </div>

  <!-- Client-side Interactive Script -->
  <script src="script.js"></script>
</body>
</html>`;

  // Build style.css
  const cssContent = `/* Custom Base Styles and Transitions */
body {
  font-family: 'Inter', sans-serif;
  overflow-y: scroll;
}

.font-display {
  font-family: 'Space Grotesk', sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Custom Scrollbar Styles */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #020617;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 9999px;
  border: 2.5px solid #020617;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

/* Custom Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Backdrop-filter fallback for older browsers */
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}
`;

  // Build script.js
  const jsContent = `/**
 * Standalone Client-Side Application Script for Universo CF
 * Dynamically generated by Cardoso Francisco's Portal Exporter.
 * Fully self-updating and offline-ready with database local synchronizations.
 */

// Embedded database snapshots (at time of download)
const embeddedProjects = ${JSON.stringify(cleanProjects, null, 2)};
const embeddedComments = ${JSON.stringify(comments, null, 2)};
const embeddedRatings = ${JSON.stringify(ratings, null, 2)};

// Local storage active state
let projects = [];
let localComments = {};
let localRatings = {};

// Current active categories and states
let currentCategory = 'apps';
let currentSearchQuery = '';

// Default fallback assets
const fallbackLogo = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=150&q=80";

// Standard Portuguese date and clock logic
function updateClock() {
  const now = new Date();
  
  // Update live digital clock widget
  const liveClock = document.getElementById('live-clock');
  if (liveClock) {
    liveClock.textContent = now.toLocaleTimeString('pt-PT', { hour12: false });
  }

  // Update live date
  const liveDate = document.getElementById('live-date');
  if (liveDate) {
    liveDate.textContent = now.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  // Update footer copyright dynamically (always kept up-to-date every day and every year)
  const currentYear = now.getFullYear();
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = currentYear;
  }
  const yearEls = document.querySelectorAll('.auto-update-year');
  yearEls.forEach(el => el.textContent = currentYear);
}

// Start live updates immediately
setInterval(updateClock, 1000);
updateClock();

// Initial database hydration from localStorage and snapshot merging
function initializeDatabase() {
  // 1. Projects merging
  const storedProjects = localStorage.getItem('universo_cf_published_projects');
  if (storedProjects) {
    try {
      const parsed = JSON.parse(storedProjects);
      // Create projects list merging localStorage values (gives preference to newer custom browser ones)
      const mergedMap = new Map();
      embeddedProjects.forEach(p => mergedMap.set(p.id, p));
      if (Array.isArray(parsed)) {
        parsed.forEach(p => p && mergedMap.set(p.id, p));
      }
      projects = Array.from(mergedMap.values());
    } catch(e) {
      console.error("Erro ao carregar projetos do localStorage", e);
      projects = embeddedProjects;
    }
  } else {
    projects = embeddedProjects;
  }

  // 2. Comments merging
  const storedComments = localStorage.getItem('universo_cf_comments');
  if (storedComments) {
    try {
      localComments = JSON.parse(storedComments);
      // Merge with embedded snapshot comments
      for (const pId in embeddedComments) {
        if (!localComments[pId]) {
          localComments[pId] = embeddedComments[pId];
        } else {
          // Merge lists avoiding duplicates
          const cMap = new Map();
          embeddedComments[pId].forEach(c => cMap.set(c.id, c));
          localComments[pId].forEach(c => cMap.set(c.id, c));
          localComments[pId] = Array.from(cMap.values());
        }
      }
    } catch(e) {
      localComments = embeddedComments;
    }
  } else {
    localComments = embeddedComments;
  }

  // 3. Ratings merging
  const storedRatings = localStorage.getItem('universo_cf_ratings');
  if (storedRatings) {
    try {
      localRatings = JSON.parse(storedRatings);
      // Merge with embedded ratings
      localRatings = { ...embeddedRatings, ...localRatings };
    } catch(e) {
      localRatings = embeddedRatings;
    }
  } else {
    localRatings = embeddedRatings;
  }

  // Save merged state back to localStorage so it stays perfectly synced
  localStorage.setItem('universo_cf_published_projects', JSON.stringify(projects));
  localStorage.setItem('universo_cf_comments', JSON.stringify(localComments));
  localStorage.setItem('universo_cf_ratings', JSON.stringify(localRatings));

  updateDashboardStats();
}

// Calculate and update metrics in real-time
function updateDashboardStats() {
  const appsCount = projects.filter(p => p.type === 'apps').length;
  const booksCount = projects.filter(p => p.type === 'books').length;
  const musicCount = projects.filter(p => p.type === 'music').length;
  
  // Count total comments
  let commentsTotal = 0;
  for (const pId in localComments) {
    commentsTotal += localComments[pId].length;
  }

  document.getElementById('stat-apps').textContent = appsCount;
  document.getElementById('stat-books').textContent = booksCount;
  document.getElementById('stat-music').textContent = musicCount;
  document.getElementById('stat-comments').textContent = commentsTotal;
}

// Global View Navigation Logic
function navigateTo(viewName) {
  const viewHome = document.getElementById('view-home');
  const viewPillar = document.getElementById('view-pillar');

  // Highlight Navbar Items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('bg-amber-500', 'text-slate-950');
    item.classList.add('text-slate-400', 'hover:text-white');
  });

  if (viewName === 'home') {
    viewPillar.classList.add('hidden');
    viewHome.classList.remove('hidden');
    viewHome.classList.add('animate-fade-in');
    
    const navInicio = document.getElementById('nav-inicio');
    if (navInicio) {
      navInicio.classList.add('bg-amber-500', 'text-slate-950');
      navInicio.classList.remove('text-slate-400', 'hover:text-white');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // It's a category/pillar view
    viewHome.classList.add('hidden');
    viewPillar.classList.remove('hidden');
    viewPillar.classList.add('animate-fade-in');
    
    currentCategory = viewName;
    currentSearchQuery = '';
    const searchInput = document.getElementById('project-search');
    if (searchInput) searchInput.value = '';

    setupPillarView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function scrollToId(elementId) {
  navigateTo('home');
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, 100);
}

// Configuration details for categories
const categoriesDetails = {
  apps: {
    title: 'Aplicativos',
    subtitle: 'Tecnologia & Utilidades',
    desc: 'Ferramentas digitais desenhadas para otimizar o seu dia-a-dia, trazer soluções práticas e impulsionar a produtividade.',
    glowClass: 'from-sky-500/10 via-sky-600/5 to-transparent',
    colorClass: 'text-sky-450 bg-sky-500/10 border-sky-500/20',
    emptyText: 'Novos aplicativos serão apresentados aqui quando estiverem prontos.',
    icon: \`<svg class="w-8 h-8 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>\`
  },
  books: {
    title: 'Livros',
    subtitle: 'Cultura & Conhecimento',
    desc: 'Contos envolventes, ensaios instigantes e manuais de aprendizagem para alimentar a imaginação e a partilha intelectual.',
    glowClass: 'from-indigo-500/10 via-purple-600/5 to-transparent',
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emptyText: 'Novos livros e contos serão apresentados aqui quando estiverem prontos.',
    icon: \`<svg class="w-8 h-8 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>\`
  },
  music: {
    title: 'Músicas',
    subtitle: 'Arte Sonora & Foco',
    desc: 'Melodias, paisagens acústicas e sintetizadores interativos concebidos para inspirar foco, serenidade e harmonia.',
    glowClass: 'from-fuchsia-500/10 via-pink-600/5 to-transparent',
    colorClass: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    emptyText: 'Novas músicas serão apresentadas aqui quando estiverem prontas.',
    icon: \`<svg class="w-8 h-8 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>\`
  },
  outros: {
    title: 'Outros Projetos',
    subtitle: 'Inovação & Experiências',
    desc: 'Criações experimentais, ideias criativas multidisciplinares e novos horizontes em constante desenvolvimento.',
    glowClass: 'from-amber-500/10 via-orange-600/5 to-transparent',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emptyText: 'Outros projetos serão apresentados aqui quando estiverem prontos.',
    icon: \`<svg class="w-8 h-8 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 113.536 0V21h-3.536v-5.457z" /></svg>\`
  }
};

// Render active category details
function setupPillarView(category) {
  const details = categoriesDetails[category] || categoriesDetails.outros;

  document.getElementById('pillar-title').textContent = details.title;
  document.getElementById('pillar-desc').textContent = details.desc;
  document.getElementById('pillar-badge-text').textContent = details.subtitle;
  
  const iconBox = document.getElementById('pillar-icon-box');
  iconBox.innerHTML = details.icon;

  const glow = document.getElementById('pillar-glow');
  glow.className = \`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br \${details.glowClass} rounded-full blur-3xl pointer-events-none\`;

  const badge = document.getElementById('pillar-badge');
  badge.className = \`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border \${details.colorClass} mb-4\`;

  renderProjects();
}

// Render filtered project cards list
function renderProjects() {
  const listContainer = document.getElementById('project-list');
  const emptyContainer = document.getElementById('empty-pillar');
  
  // Filter by category and search term
  const categoryProjects = projects.filter(p => p.type === currentCategory);
  const filtered = categoryProjects.filter(p => p.title.toLowerCase().includes(currentSearchQuery.toLowerCase()));

  if (categoryProjects.length === 0 || filtered.length === 0) {
    listContainer.innerHTML = '';
    listContainer.classList.add('hidden');
    emptyContainer.classList.remove('hidden');
    
    const details = categoriesDetails[currentCategory] || categoriesDetails.outros;
    document.getElementById('empty-pillar-text').textContent = currentSearchQuery 
      ? 'Nenhum projeto corresponde à pesquisa atual.' 
      : details.emptyText;
    return;
  }

  emptyContainer.classList.add('hidden');
  listContainer.classList.remove('hidden');

  let html = '';
  filtered.forEach(proj => {
    const commentsList = localComments[proj.id] || [];
    const ratingScore = localRatings[proj.id] || 0;
    
    // Default fallback image
    const coverUrl = proj.coverImageData && proj.coverImageData !== "indexeddb" ? proj.coverImageData : (
      proj.title.toLowerCase().includes("minsa") || proj.title.toLowerCase().includes("prep") || proj.title.toLowerCase().includes("cf")
        ? fallbackLogo
        : currentCategory === "books" 
          ? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80"
          : currentCategory === "music"
            ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80"
            : "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80"
    );

    html += \`
      <div id="card-\${proj.id}" class="border border-white/10 rounded-3xl bg-[#09090e]/90 hover:border-white/15 transition-all shadow-xl relative overflow-hidden text-left animate-fade-in">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="p-6 sm:p-8">
          <div class="flex flex-col md:flex-row gap-6 items-start">
            
            <!-- Cover image box -->
            <div class="w-full md:w-44 flex-shrink-0">
              <div class="w-full aspect-video md:aspect-square rounded-2xl overflow-hidden border border-white/10 relative shadow-inner bg-black/40">
                <img src="\${coverUrl}" alt="\${proj.title}" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Detail content box -->
            <div class="flex-grow min-w-0 space-y-4">
              <div>
                <div class="flex items-center gap-2 text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                  <span>MURAL</span>
                  <span>•</span>
                  <span>\${proj.publishedAt}</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-display font-black text-white leading-tight mt-1">\${proj.title}</h3>
              </div>

              <p class="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">\${proj.desc || 'Nenhuma descrição fornecida para este lançamento.'}</p>

              <!-- Ratings Row -->
              <div class="flex items-center gap-3 bg-white/2 border border-white/5 rounded-2xl p-3.5 w-fit">
                <div class="flex items-center gap-1 text-amber-500">
                  \${renderStars(proj.id, ratingScore)}
                </div>
                <span class="text-[10px] font-mono text-slate-400 font-bold uppercase mt-0.5">AVALIAÇÃO</span>
              </div>

              <!-- Primary action downloads button -->
              <div class="pt-2 flex flex-wrap items-center gap-3">
                \${renderDownloadButton(proj)}
              </div>
            </div>
          </div>

          <!-- Divider line -->
          <div class="border-t border-white/5 mt-8 pt-6 flex justify-between items-center">
            <button onclick="toggleComments('\${proj.id}')" class="flex items-center gap-2 text-[10px] font-bold font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-wider focus:outline-none">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Comentários (\${commentsList.length})</span>
            </button>
          </div>

          <!-- Collapsible comments container -->
          <div id="comments-section-\${proj.id}" class="hidden mt-6 pt-6 border-t border-white/5 space-y-4">
            <div class="space-y-4" id="comments-list-\${proj.id}">
              \${renderCommentsList(proj.id)}
            </div>

            <!-- New comment form -->
            <div class="pt-4 border-t border-white/5 flex flex-col gap-3">
              <h5 class="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Escrever Comentário</h5>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input id="cmt-author-\${proj.id}" type="text" placeholder="Seu nome..." class="bg-[#020204]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
                <input id="cmt-text-\${proj.id}" type="text" placeholder="Escreva a sua mensagem..." class="sm:col-span-2 bg-[#020204]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
              <button onclick="postComment('\${proj.id}')" class="w-fit self-end px-4 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold text-xs rounded-xl transition-all uppercase tracking-wider">Enviar</button>
            </div>
          </div>

        </div>
      </div>
    \`;
  });

  listContainer.innerHTML = html;
}

// Generate stars HTML
function renderStars(projectId, activeCount) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    const fill = i <= activeCount ? 'currentColor' : 'none';
    stars += \`<svg onclick="rateProject('\${projectId}', \${i})" class="w-4 h-4 cursor-pointer hover:scale-110 transition-transform" fill="\${fill}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" /></svg>\`;
  }
  return stars;
}

// Generate button HTML
function renderDownloadButton(proj) {
  if (proj.allowDownload === false) {
    return '<span class="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Acesso Protegido</span>';
  }

  // If there's embedded file base64 data
  if (proj.fileData && proj.fileData.startsWith('data:')) {
    return \`
      <button onclick="downloadEmbeddedFile('\${proj.id}', '\${proj.fileName}', '\${proj.fileData}')" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center gap-2">
        <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Baixar Ficheiro \${proj.fileSize ? \`(\${proj.fileSize})\` : ''}</span>
      </button>
    \`;
  }

  // Fallback to link
  const url = proj.link && proj.link !== '#' ? proj.link : 'javascript:void(0)';
  const disabled = url === 'javascript:void(0)' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return \`
    <a href="\${url}" target="_blank" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all border border-white/10 hover:border-white/15 \${disabled} flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <span>Aceder / Ver Online</span>
    </a>
  \`;
}

// Generate comments list HTML
function renderCommentsList(projectId) {
  const cList = localComments[projectId] || [];
  if (cList.length === 0) {
    return '<p class="text-slate-500 text-xs italic">Nenhum comentário feito ainda. Seja o primeiro!</p>';
  }

  let html = '';
  cList.forEach(cmt => {
    html += \`
      <div class="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-1.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-white font-display">\${cmt.author}</span>
          <span class="text-[9px] font-mono text-slate-500">\${cmt.date}</span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed font-sans">\${cmt.text}</p>
      </div>
    \`;
  });
  return html;
}

// Live search updates
function handleSearch(val) {
  currentSearchQuery = val;
  renderProjects();
}

// Toggle comment list expanding
function toggleComments(projectId) {
  const section = document.getElementById(\`comments-section-\${projectId}\`);
  section.classList.toggle('hidden');
}

// Save custom rating
function rateProject(projectId, score) {
  localRatings[projectId] = score;
  localStorage.setItem('universo_cf_ratings', JSON.stringify(localRatings));
  
  renderProjects();
  showToast("Obrigado pela sua classificação!");
}

// Submit a new user comment
function postComment(projectId) {
  const authorEl = document.getElementById(\`cmt-author-\${projectId}\`);
  const textEl = document.getElementById(\`cmt-text-\${projectId}\`);

  const author = authorEl.value.trim() || 'Anónimo';
  const text = textEl.value.trim();

  if (!text) {
    showToast("Por favor, preencha o seu comentário.");
    return;
  }

  const newCmt = {
    id: 'cmt_' + Date.now(),
    author: author,
    text: text,
    date: new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  if (!localComments[projectId]) {
    localComments[projectId] = [];
  }
  localComments[projectId].push(newCmt);
  localStorage.setItem('universo_cf_comments', JSON.stringify(localComments));

  // Reset inputs
  authorEl.value = '';
  textEl.value = '';

  // Rerender lists
  renderProjects();
  updateDashboardStats();
  
  showToast("Comentário enviado com sucesso!");
}

// File download from Base64 decoder
function downloadEmbeddedFile(projectId, filename, base64Data) {
  try {
    const proj = projects.find(p => p.id === projectId);
    const title = proj ? proj.title : '';
    
    let finalFilename = filename || \`download_universo_cf_\${projectId}\`;
    const lowerFn = finalFilename.toLowerCase();

    const isGeneric = lowerFn === "base.apk" || lowerFn === "app.apk" || lowerFn === "file.apk" || lowerFn === "universo.apk" || !finalFilename;
    
    if (isGeneric || lowerFn.endsWith(".apk")) {
      const cleanTitle = (title || "App")
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "") // remove accents
        .replace(/[^a-zA-Z0-9]/g, "_")   // replace non-alphanumeric with underscore
        .replace(/_+/g, "_")             // collapse multiple underscores
        .replace(/^_+|_+$/g, "");        // trim leading/trailing underscores
      
      const extension = lowerFn.endsWith(".apk") ? "apk" : (lowerFn.split(".").pop() || "zip");
      finalFilename = \`\${cleanTitle}_Universo_CF.\${extension}\`;
    }

    const link = document.createElement("a");
    link.href = base64Data;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("O download do seu ficheiro iniciou!");
  } catch(e) {
    showToast("Erro ao processar ficheiro para download.");
    console.error(e);
  }
}

// Modal handling
function openContactModal() {
  document.getElementById('contact-modal').classList.remove('hidden');
}

function closeContactModal() {
  document.getElementById('contact-modal').classList.add('hidden');
}

// Save contact submissions locally (reads on Admin Portal!)
function handleContactSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const subject = document.getElementById('contact-subject').value;
  const msg = document.getElementById('contact-msg').value;

  const newSubmission = {
    id: 'sub_' + Date.now(),
    name,
    email,
    subject,
    message: msg,
    date: new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  const stored = localStorage.getItem('universo_cf_contact_submissions') || '[]';
  let submissions = [];
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      submissions = parsed;
    } else {
      submissions = [];
    }
  } catch(e) {
    submissions = [];
  }

  submissions.unshift(newSubmission);
  localStorage.setItem('universo_cf_contact_submissions', JSON.stringify(submissions));

  // Reset and close
  document.getElementById('contact-form').reset();
  closeContactModal();
  showToast("Mensagem enviada com sucesso ao Cardoso!");
}

// Toast triggers
function showToast(msg) {
  const toast = document.getElementById('toast-notif');
  const msgEl = document.getElementById('toast-msg');
  msgEl.textContent = msg;

  toast.classList.remove('hidden');
  toast.classList.add('animate-fade-in');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// ==========================================
// UNIVERSO IA - OFFLINE INTERACTIVE ASSISTANT
// ==========================================

let offlineChatHistory = [];
const welcomeMsg = "Olá! Sou o **Universo IA**, o assistente digital de Cardoso Francisco. Posso apresentar os aplicativos desenvolvidos, falar sobre os seus livros de contos, recomendar melodias relaxantes ou ajudá-lo a enviar mensagens diretas. O que deseja explorar?";

function initOfflineChat() {
  const log = document.getElementById('universo-ia-chat-log');
  if (!log) return;

  // Load chat history or show welcome message
  const saved = localStorage.getItem('universo_offline_chat_history');
  if (saved) {
    try {
      offlineChatHistory = JSON.parse(saved);
    } catch (e) {
      offlineChatHistory = [{ id: 'welcome', role: 'model', text: welcomeMsg }];
    }
  } else {
    offlineChatHistory = [{ id: 'welcome', role: 'model', text: welcomeMsg }];
  }
  
  renderOfflineMessages();
}

function renderOfflineMessages() {
  const log = document.getElementById('universo-ia-chat-log');
  if (!log) return;
  log.innerHTML = '';

  offlineChatHistory.forEach(msg => {
    const container = document.createElement('div');
    container.className = "flex w-full " + (msg.role === 'user' ? "justify-end" : "justify-start");

    const bubble = document.createElement('div');
    bubble.className = "max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-sans " + 
      (msg.role === 'user' 
        ? "bg-indigo-600 text-white rounded-tr-none" 
        : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-none");
    
    // Parse mini markdown-like formatting for bold tags
    let formattedText = msg.text
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(new RegExp("\\u0060([^\\u0060]+)\\u0060", "g"), '<code class="px-1.5 py-0.5 rounded bg-white/10 text-amber-400 font-mono text-[10px]">$1</code>');
    
    bubble.innerHTML = formattedText;
    container.appendChild(bubble);
    log.appendChild(container);
  });
  
  // Scroll to bottom
  log.scrollTop = log.scrollHeight;
}

function toggleOfflineIAChat(open) {
  const panel = document.getElementById('universo-ia-chat-panel');
  if (!panel) return;
  
  if (open === undefined) {
    panel.classList.toggle('hidden');
  } else if (open) {
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
  
  if (!panel.classList.contains('hidden')) {
    initOfflineChat();
  }
}

function clearOfflineChatHistory() {
  offlineChatHistory = [{ id: 'welcome', role: 'model', text: welcomeMsg }];
  localStorage.removeItem('universo_offline_chat_history');
  renderOfflineMessages();
  showToast("Histórico do chat limpo!");
}

function toggleGeminiKeyModal(show) {
  const modal = document.getElementById('universo-ia-key-modal');
  if (!modal) return;
  
  if (show) {
    modal.classList.remove('hidden');
    // Pre-populate key if exists
    const key = localStorage.getItem('universo_cf_gemini_key') || '';
    document.getElementById('universo-ia-key-input').value = key;
  } else {
    modal.classList.add('hidden');
  }
}

function saveOfflineGeminiKey(event) {
  event.preventDefault();
  const key = document.getElementById('universo-ia-key-input').value.trim();
  if (key) {
    localStorage.setItem('universo_cf_gemini_key', key);
    showToast("Chave API Gemini salva com sucesso!");
    toggleGeminiKeyModal(false);
  }
}

function executeOfflinePrompt(text) {
  document.getElementById('universo-ia-text-input').value = text;
  handleOfflineMessageSubmit();
}

async function handleOfflineMessageSubmit(event) {
  if (event) event.preventDefault();
  
  const inputEl = document.getElementById('universo-ia-text-input');
  const userText = inputEl.value.trim();
  if (!userText) return;
  
  inputEl.value = '';
  
  // Detect request to clear/delete offline chat history
  const normalized = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (
    normalized === "eliminar historico" || 
    normalized === "limpar historico" || 
    normalized === "apagar historico" ||
    normalized.includes("eliminar historico") ||
    normalized.includes("limpar historico") ||
    normalized.includes("apagar historico")
  ) {
    clearOfflineChatHistory();
    return;
  }
  
  // Append user message
  const newUserMsg = { id: 'usr_' + Date.now(), role: 'user', text: userText };
  offlineChatHistory.push(newUserMsg);
  localStorage.setItem('universo_offline_chat_history', JSON.stringify(offlineChatHistory));
  renderOfflineMessages();
  
  // Show thinking indicator
  const log = document.getElementById('universo-ia-chat-log');
  
  const container = document.createElement('div');
  container.id = 'universo-ia-thinking';
  container.className = "flex w-full justify-start";
  
  const thinking = document.createElement('div');
  thinking.className = "text-slate-500 text-[10px] font-mono py-1 flex items-center gap-1.5";
  thinking.innerHTML = '<span class="animate-ping">●</span> <span class="uppercase font-bold tracking-wider">Universo IA está a pensar...</span>';
  container.appendChild(thinking);
  log.appendChild(container);
  log.scrollTop = log.scrollHeight;
  
  try {
    const apiKey = localStorage.getItem('universo_cf_gemini_key');
    let responseText = "";
    
    if (apiKey) {
      // Real API integration inside exported static HTML using standard fetch
      responseText = await callLiveGeminiAPI(userText, apiKey);
    } else {
      // Offline local smart fallback simulation
      responseText = getLocalOfflineSimulationResponse(userText);
    }
    
    // Remove thinking
    const thinkEl = document.getElementById('universo-ia-thinking');
    if (thinkEl) thinkEl.remove();
    
    // Append model response
    const newModelMsg = { id: 'mdl_' + Date.now(), role: 'model', text: responseText };
    offlineChatHistory.push(newModelMsg);
    localStorage.setItem('universo_offline_chat_history', JSON.stringify(offlineChatHistory));
    renderOfflineMessages();
    
  } catch (err) {
    const thinkEl = document.getElementById('universo-ia-thinking');
    if (thinkEl) thinkEl.remove();
    
    const errMsg = "Lamento, ocorreu um erro ao contactar a inteligência artificial. Por favor, verifique a sua chave API nas configurações do chat.";
    const errorMsgObj = { id: 'err_' + Date.now(), role: 'model', text: errMsg };
    offlineChatHistory.push(errorMsgObj);
    renderOfflineMessages();
  }
}

async function callLiveGeminiAPI(promptText, apiKey) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: "Atue como Universo IA, o assistente virtual do portal Universo CF (Estúdio Cardoso Francisco).\n" +
            "Cardoso Francisco é escritor angolano e engenheiro de software, criador de melodias relaxantes e contos literários.\n" +
            "Disponha de simpatia, elegância e responda em português de Angola/Portugal (pt-PT).\n\n" +
            "Projetos disponíveis no momento: " + JSON.stringify(projects) + "\n\n" +
            "Pergunta do utilizador: \"" + promptText + "\""
        }]
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error("Gemini API Error");
  }
  
  const data = await response.json();
  if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  }
  return "Desculpe, não consegui obter uma resposta da IA.";
}

function getLocalOfflineSimulationResponse(userText) {
  const text = userText.toLowerCase();
  
  if (text.includes("ajuda") || text.includes("comando") || text.includes("podes fazer")) {
    return "Consigo orientar-te sobre:\\n- **Aplicativos**: escreve 'apps' ou 'aplicativos' para listar as criações de software.\\n- **Livros**: escreve 'livros' para conheceres as obras publicadas por Cardoso.\\n- **Músicas**: escreve 'musicas' para ouvires faixas relaxantes.\\n- **Contacto**: escreve 'contacto' para saberes como falar com o autor.";
  }
  
  if (text.includes("app") || text.includes("aplicativo") || text.includes("software")) {
    const apps = projects.filter(p => p.type === 'apps');
    if (apps.length === 0) {
      return "De momento, não existem aplicativos móveis ou utilitários web no mural público.";
    }
    return "Encontrei **" + apps.length + " aplicativo(s)** no mural:\n" + apps.map(p => "- **" + p.title + "**: " + p.desc).join("\n");
  }
  
  if (text.includes("livro") || text.includes("conto") || text.includes("literatura") || text.includes("livros")) {
    const books = projects.filter(p => p.type === 'books');
    if (books.length === 0) {
      return "De momento, não há nenhum livro de contos ou romance publicado nas prateleiras virtuais.";
    }
    return "Cardoso Francisco tem **" + books.length + " obra(s) literária(s)** publicadas:\n" + books.map(p => "- **" + p.title + "**: " + p.desc).join("\n");
  }
  
  if (text.includes("música") || text.includes("som") || text.includes("musicas") || text.includes("audio")) {
    const music = projects.filter(p => p.type === 'music');
    if (music.length === 0) {
      return "Não há trilhas ou melodias relaxantes publicadas neste momento.";
    }
    return "Temos **" + music.length + " trilha(s) sonora(s)** no portfólio:\n" + music.map(p => "- **" + p.title + "**: " + p.desc).join("\n");
  }
  
  if (text.includes("contacto") || text.includes("enviar mensagem") || text.includes("email") || text.includes("falar com")) {
    return "Para falar com Cardoso Francisco, podes clicar no botão **'Falar Comigo'** no topo ou rodapé do site, preencher o formulário e enviar. Ele responderá assim que possível!";
  }
  
  if (text.includes("quem é") || text.includes("cardoso") || text.includes("biografia") || text.includes("autor")) {
    return "Cardoso Francisco é um brilhante **Engenheiro de Software** e **Escritor Angolano**, apaixonado por criar pontes entre a exatidão dos algoritmos e a sensibilidade das palavras. Desenvolve aplicativos de utilidade prática, compõe melodias para relaxamento e redige antologias de contos fantásticos e ficção.";
  }
  
  return "Compreendi perfeitamente! Como estamos no modo offline local do código baixado, podes obter respostas em tempo real configurando a tua chave API Gemini pessoal clicando na chave 🔑 no cabeçalho do chat, ou podes perguntar-me mais sobre 'livros' ou 'aplicativos'!";
}

// Run initial loading sequences
initializeDatabase();
initOfflineChat();
`;

  // Write files to ZIP
  zip.file("index.html", htmlContent);
  zip.file("style.css", cssContent);
  zip.file("script.js", jsContent);

  // Generate blob
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
}
