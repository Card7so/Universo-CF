import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle,
  CheckCircle2,
  Trash2,
  Play,
  Plus,
  Mic,
  MicOff,
  Paperclip,
  File,
  Image,
  FileText,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CustomProject } from "../types";

interface ChatMessage {
  id: string;
  role: "user" | "model" | "error";
  text: string;
  files?: { id: string; name: string; type: string; size: number; url?: string }[];
  action?: {
    type: "add_project" | "edit_project" | "delete_project" | "edit_settings" | "none";
    project?: any;
    settings?: any;
  };
}

interface UniversoIAChatProps {
  mode: "admin" | "visitor";
  publishedProjects?: CustomProject[];
  commentsData?: Record<string, any[]>;
  onExecuteAction?: (action: any) => void;
  onClose?: () => void;
}

export default function UniversoIAChat({
  mode,
  publishedProjects = [],
  commentsData = {},
  onExecuteAction,
  onClose
}: UniversoIAChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [activeProjects, setActiveProjects] = useState<CustomProject[]>([]);

  // Maintain local context list and keep it aligned with local browser mutations
  useEffect(() => {
    if (publishedProjects && publishedProjects.length > 0) {
      setActiveProjects(publishedProjects);
    } else {
      const stored = localStorage.getItem("universo_cf_published_projects");
      if (stored) {
        try {
          setActiveProjects(JSON.parse(stored));
        } catch (e) {
          setActiveProjects([]);
        }
      }
    }
  }, [publishedProjects]);

  useEffect(() => {
    const handleProjectsUpdate = () => {
      const stored = localStorage.getItem("universo_cf_published_projects");
      if (stored) {
        try {
          setActiveProjects(JSON.parse(stored));
        } catch (e) {
          setActiveProjects([]);
        }
      }
    };

    window.addEventListener("universo-projects-updated", handleProjectsUpdate);
    return () => {
      window.removeEventListener("universo-projects-updated", handleProjectsUpdate);
    };
  }, []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // File attachments state
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; type: string; size: number; url?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice/Microphone recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "pt-PT";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMsg(prev => prev ? prev + " " + transcript : transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("O seu navegador não suporta reconhecimento de voz ou esta funcionalidade precisa de permissão de microfone.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Não foi possível iniciar o microfone:", e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file: any) => {
        const isImg = file.type.startsWith("image/");
        return {
          id: "file_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.type,
          size: file.size,
          url: isImg ? URL.createObjectURL(file) : undefined
        };
      });
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Check if we are running in the offline/static exported version
  const isOffline = typeof window !== "undefined" && (
    window.location.protocol === "file:" || 
    window.location.hostname.includes("github.io")
  );

  // Load saved chat history and Gemini key on mount
  useEffect(() => {
    let key = localStorage.getItem("universo_cf_gemini_key") || "";
    // Se a chave for a chave falsa antiga, limpamos para priorizar a chave do servidor
    if (key === "AIzaSyCgbJcoMVmJwk-U95FbUI1hqjd7sPiLJwk") {
      key = "";
      localStorage.removeItem("universo_cf_gemini_key");
    }
    setGeminiKey(key);

    const initialGreeting = mode === "admin" 
      ? "Olá, Administrador Cardoso Francisco! Sou o **Universo IA**, o seu co-desenvolvedor virtual de elite. Posso ajudar a gerir o mural de lançamentos, analisar métricas, redigir sinopses ou revisar comentários em tempo real. O que gostaria de fazer hoje?"
      : "Olá! Sou o **Universo IA**, o assistente digital de Cardoso Francisco. Posso apresentar os aplicativos desenvolvidos, falar sobre os seus livros de contos, recomendar melodias relaxantes ou ajudá-lo a enviar mensagens diretas. O que deseja explorar?";

    const savedHistory = sessionStorage.getItem(`universo_ia_chat_${mode}`);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        setMessages([{ id: "welcome", role: "model", text: initialGreeting }]);
      }
    } else {
      setMessages([{ id: "welcome", role: "model", text: initialGreeting }]);
    }
  }, [mode]);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`universo_ia_chat_${mode}`, JSON.stringify(messages));
    }
  }, [messages, mode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("universo_cf_gemini_key", geminiKey.trim());
    setSuccessMsg("Chave de API Gemini salva com sucesso para uso offline!");
    setShowKeyModal(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleClearHistory = () => {
    const initialGreeting = mode === "admin" 
      ? "Olá, Administrador Cardoso Francisco! Sou o **Universo IA**, o seu co-desenvolvedor virtual de elite. Posso ajudar a gerir o mural de lançamentos, analisar métricas, redigir sinopses ou revisar comentários em tempo real. O que gostaria de fazer hoje?"
      : "Olá! Sou o **Universo IA**, o assistente digital de Cardoso Francisco. Posso apresentar os aplicativos desenvolvidos, falar sobre os seus livros de contos, recomendar melodias relaxantes ou ajudá-lo a enviar mensagens diretas. O que deseja explorar?";
    
    setMessages([{ id: "welcome", role: "model", text: initialGreeting }]);
    sessionStorage.removeItem(`universo_ia_chat_${mode}`);
  };

  // Simulated AI mode fallback for when offline and no API key is provided
  const handleSimulatedAI = (userText: string) => {
    const text = userText.toLowerCase().trim();
    let reply = "";
    let action: any = null;

    let attachmentNote = "";
    if (userText.includes("[Ficheiros Anexados:")) {
      const match = userText.match(/\[Ficheiros Anexados:\s*([^\]]+)\]/);
      if (match && match[1]) {
        attachmentNote = `Recebi e analisei com sucesso o(s) seguinte(s) anexo(s) com inteligência artificial: **${match[1]}**!\n\n`;
      }
    }

    if (text.includes("ajuda") || text.includes("comando") || text.includes("o que podes fazer")) {
      reply = mode === "admin"
        ? "No painel de administração offline, posso simular a adição de projetos. Tente digitar:\n- `adicionar livro O Sonho de Cardoso`\n- `adicionar app Calculadora Offline`\n\nAlém disso, posso detalhar estatísticas e ajudar na revisão geral do mural."
        : "Posso ajudar com as seguintes informações:\n1. **Aplicativos**: digite `aplicativos` ou `apps` para ver o que temos.\n2. **Livros**: digite `livros` ou `literatura` para ver as publicações.\n3. **Músicas**: digite `músicas` ou `áudio` para ver os sons.\n4. **Sobre o Autor**: digite `autor` ou `quem é Cardoso`.";
    } else if (text.includes("app") || text.includes("aplicativo") || text.includes("software")) {
      const apps = activeProjects.filter(p => p.type === "apps");
      if (apps.length === 0) {
        reply = "De momento, não existem aplicativos publicados no mural. Pode simular um novo enviando `adicionar app [Nome]`.";
      } else {
        reply = `Encontrei **${apps.length} aplicativo(s)** no mural:\n` + apps.map(a => `- **${a.title}**: ${a.desc || "Sem descrição"}`).join("\n");
      }
    } else if (text.includes("livro") || text.includes("conto") || text.includes("literatura") || text.includes("livros")) {
      const books = activeProjects.filter(p => p.type === "books");
      if (books.length === 0) {
        reply = "Atualmente, não temos livros publicados no mural. Tente simular a criação de um novo livro.";
      } else {
        reply = `Encontrei **${books.length} livro(s)** publicados por Cardoso Francisco:\n` + books.map(b => `- **${b.title}**: ${b.desc || "Sem descrição"}`).join("\n");
      }
    } else if (text.includes("música") || text.includes("som") || text.includes("musicas") || text.includes("audio")) {
      const music = activeProjects.filter(p => p.type === "music");
      if (music.length === 0) {
        reply = "De momento, nenhuma composição musical ou sintetizador foi publicado no mural.";
      } else {
        reply = `Temos **${music.length} composição(ões) sonoras** prontas para ouvir:\n` + music.map(m => `- **${m.title}**: ${m.desc || "Sem descrição"}`).join("\n");
      }
    } else if (text.includes("autor") || text.includes("cardoso") || text.includes("quem é") || text.includes("criador")) {
      reply = "**Cardoso Francisco** é um programador, escritor e artista digital apaixonado por rigor científico e soluções tecnológicas minimalistas. Fundou o portal **Universo CF** para hospedar suas criações digitais e partilhar literatura offline/online com o mundo.";
    } else if (mode === "admin" && (text.startsWith("adicionar app") || text.startsWith("criar app"))) {
      const title = userText.replace(/adicionar app|criar app/i, "").trim();
      if (!title) {
        reply = "Por favor, indique o título do aplicativo que deseja criar. Exemplo: `adicionar app Calculadora Pró`";
      } else {
        const newId = "sim_" + Date.now();
        action = {
          type: "add_project",
          project: {
            id: newId,
            title: title,
            desc: "Um aplicativo inteligente gerado e catalogado offline pelo Universo IA.",
            type: "apps",
            publishedAt: new Date().toLocaleDateString("pt-PT"),
            allowDownload: true
          }
        };
        reply = `Excelente escolha! Preparei a estrutura para publicar o aplicativo **"${title}"** no mural do portal. O efeito está pronto a ser aplicado.`;
      }
    } else if (mode === "admin" && (text.startsWith("adicionar livro") || text.startsWith("criar livro"))) {
      const title = userText.replace(/adicionar livro|criar livro/i, "").trim();
      if (!title) {
        reply = "Por favor, indique o título do livro que deseja criar. Exemplo: `adicionar livro O Mistério da Noite`";
      } else {
        const newId = "sim_" + Date.now();
        action = {
          type: "add_project",
          project: {
            id: newId,
            title: title,
            desc: "Uma obra literária inspiradora, idealizada e estruturada de forma automática pelo Universo IA.",
            type: "books",
            publishedAt: new Date().toLocaleDateString("pt-PT"),
            allowDownload: true
          }
        };
        reply = `Esplêndido! Adicionei o rascunho de livro **"${title}"** às obras literárias públicas do mural do site.`;
      }
    } else if (mode === "admin" && text.startsWith("apagar")) {
      const title = userText.replace(/apagar/i, "").trim();
      const match = activeProjects.find(p => p.title.toLowerCase().includes(title.toLowerCase()));
      if (match) {
        action = {
          type: "delete_project",
          project: { id: match.id }
        };
        reply = `Compreendido. Ordenei a remoção imediata do lançamento **"${match.title}"** das bases de dados locais.`;
      } else {
        reply = `Lamento, não consegui localizar nenhum projeto com o termo "${title}" para remover.`;
      }
    } else if (mode === "admin" && (text.includes("alterar email") || text.includes("mudar email") || text.includes("atualizar email"))) {
      const email = userText.replace(/alterar email|mudar email|atualizar email|para/gi, "").trim();
      if (!email) {
        reply = "Por favor, indique o novo e-mail de contacto. Exemplo: `mudar email cardoso@gmail.com`";
      } else {
        action = {
          type: "edit_settings",
          settings: { contactEmail: email }
        };
        reply = `Perfeito! Procedi com a atualização do e-mail de contacto para **${email}** na estrutura do site.`;
      }
    } else if (mode === "admin" && (text.includes("alterar telefone") || text.includes("mudar telefone") || text.includes("atualizar telefone") || text.includes("alterar contacto") || text.includes("mudar contacto"))) {
      const phone = userText.replace(/alterar telefone|mudar telefone|atualizar telefone|alterar contacto|mudar contacto|para/gi, "").trim();
      if (!phone) {
        reply = "Por favor, indique o novo número de telefone. Exemplo: `mudar telefone 975 221 805`";
      } else {
        action = {
          type: "edit_settings",
          settings: { contactPhone: phone }
        };
        reply = `Entendido! Atualizei o número de telefone de contacto para **${phone}** com sucesso.`;
      }
    } else if (mode === "admin" && (text.includes("alterar instagram") || text.includes("mudar instagram") || text.includes("atualizar instagram"))) {
      const ig = userText.replace(/alterar instagram|mudar instagram|atualizar instagram|para/gi, "").trim();
      if (!ig) {
        reply = "Por favor, indique o novo link ou handle do Instagram. Exemplo: `mudar instagram @cardoso`";
      } else {
        action = {
          type: "edit_settings",
          settings: { instagram: ig }
        };
        reply = `Concluído. O perfil do Instagram foi atualizado para **${ig}** na estrutura do site.`;
      }
    } else if (mode === "admin" && (text.includes("alterar youtube") || text.includes("mudar youtube") || text.includes("atualizar youtube"))) {
      const yt = userText.replace(/alterar youtube|mudar youtube|atualizar youtube|para/gi, "").trim();
      if (!yt) {
        reply = "Por favor, indique o link ou nome do canal de YouTube.";
      } else {
        action = {
          type: "edit_settings",
          settings: { youtube: yt }
        };
        reply = `Ótimo! O canal de YouTube foi atualizado para **${yt}** nas configurações.`;
      }
    } else if (mode === "admin" && (text.includes("alterar twitter") || text.includes("mudar twitter") || text.includes("atualizar twitter"))) {
      const tw = userText.replace(/alterar twitter|mudar twitter|atualizar twitter|para/gi, "").trim();
      if (!tw) {
        reply = "Por favor, indique o link ou handle do Twitter/X.";
      } else {
        action = {
          type: "edit_settings",
          settings: { twitter: tw }
        };
        reply = `Pronto. Perfil do Twitter/X alterado para **${tw}** com sucesso.`;
      }
    } else if (mode === "admin" && (text.includes("alterar tiktok") || text.includes("mudar tiktok") || text.includes("atualizar tiktok"))) {
      const tk = userText.replace(/alterar tiktok|mudar tiktok|atualizar tiktok|para/gi, "").trim();
      if (!tk) {
        reply = "Por favor, indique o link ou handle do TikTok.";
      } else {
        action = {
          type: "edit_settings",
          settings: { tiktok: tk }
        };
        reply = `Perfeito! O perfil do TikTok foi atualizado para **${tk}**.`;
      }
    } else if (mode === "admin" && (text.includes("alterar facebook") || text.includes("mudar facebook") || text.includes("atualizar facebook"))) {
      const fb = userText.replace(/alterar facebook|mudar facebook|atualizar facebook|para/gi, "").trim();
      if (!fb) {
        reply = "Por favor, indique o link ou handle do Facebook.";
      } else {
        action = {
          type: "edit_settings",
          settings: { facebook: fb }
        };
        reply = `Concluído! O perfil do Facebook foi atualizado para **${fb}**.`;
      }
    } else {
      reply = "Compreendi o seu ponto. Como estamos a correr em modo offline (simulação local), pode experimentar me pedir para listar ou criar lançamentos digitais escrevendo termos como `adicionar livro [Nome]` ou `aplicativos`!";
    }

    if (attachmentNote) {
      reply = attachmentNote + (reply.startsWith("Compreendi o seu ponto") ? "Obrigado por partilhar o ficheiro. Consigo ler e integrar as informações desse anexo para enriquecer a nossa conversa e simular interações avançadas!" : reply);
    }

    return { response: reply, action };
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() && attachedFiles.length === 0) return;
    if (isGenerating) return;

    const userText = inputMsg.trim() || (attachedFiles.length > 0 ? "Envio de ficheiros" : "");
    const currentFiles = [...attachedFiles];

    setInputMsg("");
    setAttachedFiles([]);

    // Detect request to clear/delete chat history
    const normalized = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (
      normalized === "eliminar historico" || 
      normalized === "limpar historico" || 
      normalized === "apagar historico" ||
      normalized.includes("eliminar historico") ||
      normalized.includes("limpar historico") ||
      normalized.includes("apagar historico")
    ) {
      handleClearHistory();
      return;
    }

    const newUserMessage: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      text: userText,
      files: currentFiles
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsGenerating(true);
    setErrorMsg("");

    let processedMessageText = userText;
    if (currentFiles.length > 0) {
      const fileNames = currentFiles.map(f => `${f.name} (${f.type}, ${Math.round(f.size/1024)}KB)`).join(", ");
      processedMessageText = `${userText}\n\n[Ficheiros Anexados: ${fileNames}]`;
    }

    try {
      // 1. Check if we must use real Gemini API in offline environment
      if (isOffline) {
        const storedKey = localStorage.getItem("universo_cf_gemini_key");
        if (storedKey) {
          // Direct fetch to Gemini raw API
          const prompt = `Atue como Universo IA na plataforma Universo CF.
Mensagem do utilizador: "${processedMessageText}"
Projetos atuais: ${JSON.stringify(activeProjects)}
Comentários: ${JSON.stringify(commentsData)}

Responda rigorosamente no formato JSON abaixo:
{
  "response": "Sua resposta explicativa em pt-PT.",
  "action": {
    "type": "add_project" | "edit_project" | "delete_project" | "none",
    "project": {
      "id": "ID",
      "title": "...",
      "desc": "...",
      "type": "apps" | "books" | "music" | "outros",
      "publishedAt": "DD/MM/YYYY"
    }
  }
}`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${storedKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          if (!res.ok) {
            throw new Error(`Erro na API Gemini (${res.status}). Verifique a sua Chave.`);
          }

          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const parsed = JSON.parse(rawText);

          const modelMessage: ChatMessage = {
            id: "mdl_" + Date.now(),
            role: "model",
            text: parsed.response || "Comando processado com sucesso.",
            action: parsed.action
          };

          setMessages(prev => [...prev, modelMessage]);

          if (parsed.action && parsed.action.type !== "none" && onExecuteAction) {
            onExecuteAction(parsed.action);
          }
        } else {
          // Run Simulated AI
          setTimeout(() => {
            const simulated = handleSimulatedAI(processedMessageText);
            const modelMessage: ChatMessage = {
              id: "mdl_" + Date.now(),
              role: "model",
              text: simulated.response,
              action: simulated.action
            };
            setMessages(prev => [...prev, modelMessage]);

            if (simulated.action && onExecuteAction) {
              onExecuteAction(simulated.action);
            }
            setIsGenerating(false);
          }, 600);
          return;
        }
      } else {
        // 2. We are in live full-stack environment -> fetch from our server-side API proxy
        const res = await fetch("/api/universo-ia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: processedMessageText,
            history: messages.slice(-10).map(m => ({ role: m.role, text: m.text })),
            projects: activeProjects,
            comments: commentsData,
            clientApiKey: geminiKey
          })
        });

        if (!res.ok) {
          throw new Error("Falha ao comunicar com o servidor do Universo IA.");
        }

        const parsed = await res.json();

        const modelMessage: ChatMessage = {
          id: "mdl_" + Date.now(),
          role: "model",
          text: parsed.response,
          action: parsed.action
        };

        setMessages(prev => [...prev, modelMessage]);

        // If an administrative database action is proposed and callback exists
        if (parsed.action && parsed.action.type !== "none" && onExecuteAction) {
          onExecuteAction(parsed.action);
        }
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Não foi possível ligar ao servidor de inteligência artificial.");
      
      const errorResponse: ChatMessage = {
        id: "err_" + Date.now(),
        role: "model",
        text: "Lamento imenso, encontrei um contratempo de comunicação ao tentar processar a sua instrução. Pode tentar novamente dentro de instantes."
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  const executeSuggestedPrompt = (prompt: string) => {
    setInputMsg(prompt);
    setTimeout(() => {
      // Small timeout to allow input update
      const submitBtn = document.getElementById("universo-ia-submit-btn");
      submitBtn?.click();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-[#030712]/30 border border-white/5 rounded-[2rem] overflow-hidden text-left font-sans">
      
      {/* Upper branding bar */}
      <div className="p-5 border-b border-white/5 bg-[#09090e]/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-sm text-white tracking-wider uppercase">Universo IA</h3>
              {isOffline && (
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold px-1.5 py-0.5 rounded uppercase">
                  Offline
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {mode === "admin" ? "Administrador Virtual Ativo" : "Assistente de Consulta Geral"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Key Management Icon (Always accessible to easily override or configure a key) */}
          <button 
            onClick={() => setShowKeyModal(true)}
            title="Configurar Chave de API Gemini"
            className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <Key className="w-4 h-4" />
          </button>

          <a 
            href="/api/download-zip" 
            download="Universo-CF.zip"
            title="Descarregar Código do Projeto (ZIP)"
            className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descarregar ZIP</span>
          </a>

          <button 
            onClick={handleClearHistory}
            title="Limpar Histórico"
            className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main chat log */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4 scrollbar-thin max-h-[500px]">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isUser 
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-500" 
                  : "bg-[#09090e] border border-white/10 text-indigo-400"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser 
                    ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-amber-500/5" 
                    : "bg-[#09090e] border border-white/5 text-slate-200 rounded-tl-none font-sans"
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* File attachments display within the message bubble */}
                  {msg.files && msg.files.length > 0 && (
                    <div className={`mt-3 pt-2.5 border-t space-y-2 ${isUser ? "border-slate-950/10 text-slate-950" : "border-white/5 text-slate-400"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Anexos:</p>
                      <div className="flex flex-col gap-1.5">
                        {msg.files.map((file) => {
                          const isImg = file.type.startsWith("image/");
                          return (
                            <div 
                              key={file.id} 
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isUser 
                                  ? "bg-slate-950/5 hover:bg-slate-950/10 border-slate-950/10" 
                                  : "bg-white/2 hover:bg-white/5 border-white/5"
                              }`}
                            >
                              {isImg && file.url ? (
                                <img src={file.url} alt={file.name} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              ) : isImg ? (
                                <Image className="w-4 h-4 flex-shrink-0" />
                              ) : file.type.includes("pdf") ? (
                                <FileText className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <File className="w-4 h-4 flex-shrink-0" />
                              )}
                              <div className="text-left overflow-hidden">
                                <p className="text-[10px] font-bold truncate">{file.name}</p>
                                <p className="text-[9px] opacity-60 font-mono">{Math.round(file.size / 1024)} KB</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* If the AI performed a database/mural action */}
                {!isUser && msg.action && msg.action.type !== "none" && (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-mono animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Ação automática: {msg.action.type === "add_project" ? "Publicou Lançamento" : msg.action.type === "edit_project" ? "Atualizou Lançamento" : "Removeu Lançamento"}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-[#09090e] border border-white/10 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#09090e] border border-white/5 text-slate-400 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              <span className="font-mono text-[10px] text-slate-500">Universo IA está a processar...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt suggestions layout */}
      {messages.length === 1 && mode !== "admin" && (
        <div className="px-5 pb-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            <span>Sugestões Rápidas:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => executeSuggestedPrompt("Quais são os livros disponíveis de Cardoso Francisco?") }
              className="px-3 py-2 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-[11px] text-slate-300 transition-all text-left cursor-pointer"
            >
              📖 Ver livros do mural
            </button>
            <button 
              onClick={() => executeSuggestedPrompt("Fala-me sobre os aplicativos criados neste portal") }
              className="px-3 py-2 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-[11px] text-slate-300 transition-all text-left cursor-pointer"
            >
              💻 Ver aplicativos do mural
            </button>
          </div>
        </div>
      )}

      {/* Attached Files Preview Strip */}
      {attachedFiles.length > 0 && (
        <div className="px-5 py-3 bg-[#020205] border-t border-white/5 flex flex-wrap gap-2 animate-fade-in max-h-32 overflow-y-auto">
          {attachedFiles.map(file => {
            const isImg = file.type.startsWith("image/");
            return (
              <div key={file.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs text-white group relative pr-7 hover:border-white/25 transition-all">
                {isImg && file.url ? (
                  <img src={file.url} alt={file.name} className="w-5 h-5 rounded object-cover" referrerPolicy="no-referrer" />
                ) : isImg ? (
                  <Image className="w-3.5 h-3.5 text-indigo-400" />
                ) : file.type.includes("pdf") ? (
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <File className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="text-[10px] font-medium truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachedFile(file.id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input controls block */}
      <form onSubmit={handleSendMessage} className="p-5 border-t border-white/5 bg-[#09090e]/50 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          {/* File input (Hidden) */}
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {/* Plus / Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar ficheiros, fotos e muito mais"
            className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Parar gravação de voz" : "Falar por voz"}
            className={`p-3 border rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 flex-shrink-0 ${
              isListening 
                ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white"
            }`}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5 text-rose-400" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          {/* Input field */}
          <input 
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={
              isListening 
                ? "A escutar... fale agora..." 
                : mode === "admin" 
                  ? "Instrua o Universo IA para criar, apagar..." 
                  : "Converse com o assistente do Universo CF..."
            }
            disabled={isGenerating}
            className="flex-grow bg-[#020205] border border-white/10 focus:border-indigo-500/50 rounded-xl py-3 px-4.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
          />

          {/* Submit Button */}
          <button 
            id="universo-ia-submit-btn"
            type="submit"
            disabled={(!inputMsg.trim() && attachedFiles.length === 0) || isGenerating}
            className="p-3 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex-shrink-0 mr-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Offline API Key configuration overlay */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a14] border border-white/10 rounded-3xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Chave API Gemini</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pode colar aqui a sua Chave de API Gemini grátis obtida em <strong>aistudio.google.com</strong> (deve começar com <code>AIzaSy</code>).
                Esta chave será guardada de forma segura no seu navegador para ligar a inteligência artificial diretamente, seja no painel online ou ao correr o projeto localmente!
              </p>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4 mt-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Sua Chave API Gemini</label>
                <input 
                  type="password"
                  required
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Salvar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
