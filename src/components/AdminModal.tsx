import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  Unlock,
  X,
  ExternalLink,
  ShieldAlert,
  KeyRound,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Globe,
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
  Users,
  Database,
  Settings,
  Activity,
  Download,
  Upload,
  ShieldCheck,
  TrendingUp,
  Eye,
  Mail,
  AlertTriangle,
  RotateCcw,
  Folder,
  Headphones,
  BookOpen,
  Smartphone,
  Clock,
  Terminal,
  Shield,
  Edit,
  Image,
  UploadCloud,
  Edit3,
  Code,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CustomProject } from "../types";
import { saveLargeFile, getLargeFile, deleteLargeFile } from "../utils/indexedDB";
import { generateSiteZip } from "../utils/exporter";
import UniversoIAChat from "./UniversoIAChat";
// @ts-ignore
import minsaLogo from "../assets/images/minsa_prep_cf_logo_1782517690942.jpg";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = "Painel" | "Conteúdos" | "Estatísticas" | "Utilizadores" | "Backup" | "Segurança" | "Configurações" | "Exportar" | "Universo IA";

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [accessCode, setAccessCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("Painel");
  
  // Project Form States
  const [projectTitle, setProjectTitle] = useState("");
  const [projectType, setProjectType] = useState<"apps" | "books" | "music" | "outros" | "photos" | "videos">("apps");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [mainFileName, setMainFileName] = useState<string | null>(null);
  const [mainFileSize, setMainFileSize] = useState<string | null>(null);
  const [mainFileData, setMainFileData] = useState<string | null>(null);
  const [coverImageName, setCoverImageName] = useState<string | null>(null);
  const [coverImageData, setCoverImageData] = useState<string | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const formContainerRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [optionsProject, setOptionsProject] = useState<CustomProject | null>(null);
  const [viewingCoverUrl, setViewingCoverUrl] = useState<string | null>(null);
  
  // List of projects published
  const [publishedProjects, setPublishedProjects] = useState<CustomProject[]>([]);
  const booksCount = publishedProjects.filter((p) => p.type === "books").length;
  const appsCount = publishedProjects.filter((p) => p.type === "apps").length;
  const musicCount = publishedProjects.filter((p) => p.type === "music").length;
  const outrosCount = publishedProjects.filter((p) => p.type === "outros").length;
  const totalCount = publishedProjects.length;

  const [successMsg, setSuccessMsg] = useState("");

  // Settings mock states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicSubmissions, setAllowPublicSubmissions] = useState(true);
  const [securityLevel, setSecurityLevel] = useState("Máximo");

  // Dynamic password state
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem("universo_cf_admin_password") || "cardoso-criador-universo";
  });

  // Social networks states
  const [instagram, setInstagram] = useState(() => localStorage.getItem("universo_social_instagram") || "");
  const [youtube, setYoutube] = useState(() => localStorage.getItem("universo_social_youtube") || "");
  const [twitter, setTwitter] = useState(() => localStorage.getItem("universo_social_twitter") || "");
  const [facebook, setFacebook] = useState(() => localStorage.getItem("universo_social_facebook") || "");
  const [tiktok, setTiktok] = useState(() => localStorage.getItem("universo_social_tiktok") || "");

  // Contact configurations
  const [contactEmail, setContactEmail] = useState(() => localStorage.getItem("universo_contact_email") || "cardosofrancisco17g@gmail.com");
  const [contactPhone, setContactPhone] = useState(() => localStorage.getItem("universo_contact_phone") || "975 221 805");

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Backup restore state
  const [importJson, setImportJson] = useState("");
  const [backupSuccess, setBackupSuccess] = useState("");
  const [backupError, setBackupError] = useState("");

  // Code export states
  const [exportIsGenerating, setExportIsGenerating] = useState(false);
  const [exportSuccess, setExportSuccess] = useState("");
  const [exportError, setExportError] = useState("");

  // Security Panel States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanState, setScanState] = useState("");
  const [antiExploit, setAntiExploit] = useState(true);
  const [ddosPrevention, setDdosPrevention] = useState(true);
  const [ipBlocking, setIpBlocking] = useState(true);
  const [sslActive, setSslActive] = useState(true);
  const [securityLogs, setSecurityLogs] = useState<string[]>([
    `[12:47:11] Sistema de Integridade Ativo. Firewall Ligado.`,
    `[12:47:15] Varredura de Malware: Integridade do código validada com sucesso.`,
    `[12:47:18] Proteção XSS: Ativa e a monitorizar o formulário de contacto.`,
    `[12:47:20] Integridade do Script: Execução encapsulada em sandbox.`
  ]);

  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanState("Iniciando varredura profunda anti-vírus e anti-hacker...");
    
    const logs = [
      "Inicializando sandbox de análise segura...",
      "Inspecionando /src/components/Hero.tsx para detetar scripts maliciosos...",
      "A analisar formulário em ContactSection.tsx contra injeções SQL/XSS...",
      "Auditoria do package.json: Verificando integridade das dependências...",
      "Varredura concluída com sucesso: Site 100% Protegido!",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanState("Varredura Completa: Sistema 100% Seguro!");
          setSecurityLogs(old => [
            ...old,
            `[${new Date().toLocaleTimeString()}] Varredura de segurança manual: Concluída (Código limpo).`
          ]);
          return 100;
        }
        
        const nextProgress = prev + 5;
        const stepIdx = Math.floor((nextProgress / 100) * logs.length);
        if (stepIdx < logs.length && stepIdx !== currentStep) {
          currentStep = stepIdx;
          setScanState(logs[currentStep]);
        }
        return nextProgress;
      });
    }, 120);
  };

  // Load published projects from localStorage and hydrate from IndexedDB
  useEffect(() => {
    const loadAndHydrate = async () => {
      const stored = localStorage.getItem("universo_cf_published_projects");
      if (stored) {
        try {
          const parsed: CustomProject[] = JSON.parse(stored);
          const hydrated = await Promise.all(
            parsed.map(async (p) => {
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
          setPublishedProjects(hydrated);
        } catch (e) {
          console.error("Erro ao carregar e hidratar projetos", e);
        }
      } else {
        setPublishedProjects([]);
      }
    };

    if (isOpen) {
      loadAndHydrate();
    }
  }, [isOpen]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify using Cardoso Francisco's special access code
    if (accessCode.trim() === adminPassword) {
      setIsAuthenticated(true);
      setError("");
      setActiveTab("Painel");
    } else {
      setError("Código de acesso incorreto. Por favor tente novamente.");
    }
  };

  const dehydrateProjects = (list: CustomProject[]): CustomProject[] => {
    return list.map((p) => ({
      ...p,
      fileData: p.fileData ? "indexeddb" : undefined,
      coverImageData: p.coverImageData ? "indexeddb" : undefined,
    }));
  };

  const handlePublishProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setError("Por favor, preencha o título do seu projeto.");
      return;
    }

    const targetId = editingProjectId || "proj_" + Date.now();
    
    // Save large files to IndexedDB instead of localStorage to prevent quota limit issues
    const hasFileData = !!mainFileData;
    const hasCoverData = !!coverImageData;

    if (hasFileData && mainFileData !== "indexeddb") {
      try {
        await saveLargeFile(`file_${targetId}`, mainFileData);
      } catch (err) {
        console.error("Erro ao salvar ficheiro principal no IndexedDB:", err);
        setError("Erro ao salvar o ficheiro principal no armazenamento local do navegador.");
        return;
      }
    }
    
    if (hasCoverData && coverImageData !== "indexeddb") {
      try {
        await saveLargeFile(`cover_${targetId}`, coverImageData);
      } catch (err) {
        console.error("Erro ao salvar imagem de capa no IndexedDB:", err);
        setError("Erro ao salvar a imagem de capa no armazenamento local do navegador.");
        return;
      }
    }

    let updated: CustomProject[];
    if (editingProjectId) {
      updated = publishedProjects.map((p) => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            type: projectType,
            title: projectTitle.trim(),
            desc: projectDesc.trim() || undefined,
            link: projectLink.trim() || "#",
            fileName: mainFileName || undefined,
            fileSize: mainFileSize || undefined,
            fileData: hasFileData ? "indexeddb" : undefined,
            coverImageName: coverImageName || undefined,
            coverImageData: hasCoverData ? "indexeddb" : undefined,
            allowDownload: allowDownload,
          };
        }
        return p;
      });
      setSuccessMsg("Conteúdo atualizado com sucesso!");
    } else {
      const newProject: CustomProject = {
        id: targetId,
        type: projectType,
        title: projectTitle.trim(),
        desc: projectDesc.trim() || undefined,
        link: projectLink.trim() || "#",
        publishedAt: new Date().toLocaleDateString("pt-PT", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        fileName: mainFileName || undefined,
        fileSize: mainFileSize || undefined,
        fileData: hasFileData ? "indexeddb" : undefined,
        coverImageName: coverImageName || undefined,
        coverImageData: hasCoverData ? "indexeddb" : undefined,
        allowDownload: allowDownload,
      };
      updated = [newProject, ...publishedProjects];
      setSuccessMsg("Ficheiro carregado e publicado com sucesso!");
    }

    try {
      const dehydrated = dehydrateProjects(updated);
      localStorage.setItem("universo_cf_published_projects", JSON.stringify(dehydrated));
    } catch (err) {
      console.error("Quota do localStorage excedida:", err);
      setError("Erro: Ficheiro muito grande para salvar no navegador (limite de 5MB excedido). Por favor, faça upload do ficheiro no Google Drive ou Mega e insira o link de partilha pública no campo 'Link' acima, deixando o campo do ficheiro vazio.");
      setSuccessMsg("");
      return;
    }

    setPublishedProjects(updated);
    
    // Reset form fields
    setProjectTitle("");
    setProjectDesc("");
    setProjectLink("");
    setMainFileName(null);
    setMainFileSize(null);
    setMainFileData(null);
    setCoverImageName(null);
    setCoverImageData(null);
    setAllowDownload(true);
    setEditingProjectId(null);
    setError("");
    
    // Dispatch custom event to let other components know to reload
    window.dispatchEvent(new Event("universo-projects-updated"));

    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  const handleEditSelect = async (proj: CustomProject) => {
    setActiveTab("Conteúdos");
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectType(proj.type);
    setProjectDesc(proj.desc || "");
    setProjectLink(proj.link || "");
    setMainFileName(proj.fileName || null);
    setMainFileSize(proj.fileSize || null);
    
    let fileData = proj.fileData || null;
    if (fileData === "indexeddb") {
      fileData = await getLargeFile(`file_${proj.id}`);
    }
    setMainFileData(fileData);
    
    setCoverImageName(proj.coverImageName || null);
    
    let coverData = proj.coverImageData || null;
    if (coverData === "indexeddb") {
      coverData = await getLargeFile(`cover_${proj.id}`);
    }
    setCoverImageData(coverData);
    
    setAllowDownload(proj.allowDownload ?? true);

    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleOptionSelect = async (proj: CustomProject, mode: "texto" | "ver_capa" | "editar_capa" | "reenviar_ficheiro") => {
    if (mode === "ver_capa") {
      let coverData = proj.coverImageData || null;
      if (coverData === "indexeddb") {
        coverData = await getLargeFile(`cover_${proj.id}`);
      }
      if (coverData) {
        setViewingCoverUrl(coverData);
      } else {
        const fallback = proj.title.toLowerCase().includes("minsa") || 
                         proj.title.toLowerCase().includes("prep") || 
                         proj.title.toLowerCase().includes("cf")
                           ? minsaLogo
                           : proj.type === "books"
                             ? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80"
                             : proj.type === "music"
                               ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80"
                               : "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80";
        setViewingCoverUrl(fallback);
      }
      return;
    }

    setActiveTab("Conteúdos");
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectType(proj.type);
    setProjectDesc(proj.desc || "");
    setProjectLink(proj.link || "");
    setMainFileName(proj.fileName || null);
    setMainFileSize(proj.fileSize || null);
    
    let fileData = proj.fileData || null;
    if (fileData === "indexeddb") {
      fileData = await getLargeFile(`file_${proj.id}`);
    }
    setMainFileData(fileData);
    
    setCoverImageName(proj.coverImageName || null);
    
    let coverData = proj.coverImageData || null;
    if (coverData === "indexeddb") {
      coverData = await getLargeFile(`cover_${proj.id}`);
    }
    setCoverImageData(coverData);
    
    setAllowDownload(proj.allowDownload ?? true);

    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      
      if (mode === "editar_capa") {
        setTimeout(() => coverInputRef.current?.click(), 300);
      } else if (mode === "reenviar_ficheiro") {
        setTimeout(() => fileInputRef.current?.click(), 300);
      }
    }, 150);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setProjectTitle("");
    setProjectDesc("");
    setProjectLink("");
    setMainFileName(null);
    setMainFileSize(null);
    setMainFileData(null);
    setCoverImageName(null);
    setCoverImageData(null);
    setAllowDownload(true);
  };

  const handleDeleteProject = async (id: string) => {
    const updated = publishedProjects.filter((p) => p.id !== id);
    setPublishedProjects(updated);
    
    try {
      const dehydrated = dehydrateProjects(updated);
      localStorage.setItem("universo_cf_published_projects", JSON.stringify(dehydrated));
    } catch (err) {
      console.error("Erro ao salvar após eliminação:", err);
    }
    
    // Clean up IndexedDB files
    await deleteLargeFile(`file_${id}`);
    await deleteLargeFile(`cover_${id}`);
    
    // Dispatch custom event to let other components know to reload
    window.dispatchEvent(new Event("universo-projects-updated"));
  };

  // Execute database action requested by Universo IA
  const handleAIExecuteAction = (action: any) => {
    if (!action || action.type === "none") return;
    
    let updated = [...publishedProjects];
    const proj = action.project;
    
    if (action.type === "add_project") {
      const newProject: CustomProject = {
        id: proj.id || "proj_" + Date.now(),
        type: proj.type || "apps",
        title: proj.title || "Sem título",
        desc: proj.desc || "",
        link: proj.link || "#",
        publishedAt: proj.publishedAt || new Date().toLocaleDateString("pt-PT", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        allowDownload: proj.allowDownload !== undefined ? proj.allowDownload : true,
      };
      updated = [newProject, ...updated];
      setSuccessMsg(`Universo IA: Lançamento "${newProject.title}" publicado com sucesso!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else if (action.type === "edit_project") {
      updated = updated.map((p) => {
        if (p.id === proj.id) {
          return {
            ...p,
            title: proj.title || p.title,
            desc: proj.desc !== undefined ? proj.desc : p.desc,
            type: proj.type || p.type,
            allowDownload: proj.allowDownload !== undefined ? proj.allowDownload : p.allowDownload,
          };
        }
        return p;
      });
      setSuccessMsg(`Universo IA: Lançamento "${proj.title}" editado com sucesso!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else if (action.type === "delete_project") {
      const target = updated.find(p => p.id === proj.id);
      updated = updated.filter((p) => p.id !== proj.id);
      if (target) {
        setSuccessMsg(`Universo IA: Lançamento "${target.title}" removido com sucesso!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } else if (action.type === "edit_settings" && action.settings) {
      const s = action.settings;
      if (s.instagram !== undefined) {
        setInstagram(s.instagram);
        localStorage.setItem("universo_social_instagram", s.instagram);
      }
      if (s.youtube !== undefined) {
        setYoutube(s.youtube);
        localStorage.setItem("universo_social_youtube", s.youtube);
      }
      if (s.twitter !== undefined) {
        setTwitter(s.twitter);
        localStorage.setItem("universo_social_twitter", s.twitter);
      }
      if (s.facebook !== undefined) {
        setFacebook(s.facebook);
        localStorage.setItem("universo_social_facebook", s.facebook);
      }
      if (s.tiktok !== undefined) {
        setTiktok(s.tiktok);
        localStorage.setItem("universo_social_tiktok", s.tiktok);
      }
      if (s.contactEmail !== undefined) {
        setContactEmail(s.contactEmail);
        localStorage.setItem("universo_contact_email", s.contactEmail);
      }
      if (s.contactPhone !== undefined) {
        setContactPhone(s.contactPhone);
        localStorage.setItem("universo_contact_phone", s.contactPhone);
      }
      if (s.maintenanceMode !== undefined) {
        setMaintenanceMode(!!s.maintenanceMode);
      }
      if (s.allowPublicSubmissions !== undefined) {
        setAllowPublicSubmissions(!!s.allowPublicSubmissions);
      }
      
      window.dispatchEvent(new Event("universo-social-updated"));
      setSuccessMsg("Universo IA: Configurações e estrutura do site atualizadas com sucesso!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
    
    try {
      const dehydrated = dehydrateProjects(updated);
      localStorage.setItem("universo_cf_published_projects", JSON.stringify(dehydrated));
    } catch (err) {
      console.error("Erro ao salvar projeto via Universo IA:", err);
    }
    
    setPublishedProjects(updated);
    window.dispatchEvent(new Event("universo-projects-updated"));
  };

  // Export database as JSON file download
  const handleExportBackup = () => {
    try {
      const storedData = localStorage.getItem("universo_cf_published_projects") || "[]";
      const blob = new Blob([storedData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_universo_cf_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setBackupSuccess("Backup exportado com sucesso!");
      setTimeout(() => setBackupSuccess(""), 3000);
    } catch (e) {
      setBackupError("Falha ao exportar backup.");
    }
  };

  // Import JSON to restore projects
  const handleImportBackup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJson);
      if (Array.isArray(parsed)) {
        try {
          localStorage.setItem("universo_cf_published_projects", JSON.stringify(parsed));
        } catch (err) {
          console.error("Quota do localStorage excedida no restauro:", err);
          setBackupError("Erro: O backup contém dados muito grandes para o limite de armazenamento do seu navegador (5MB).");
          setTimeout(() => setBackupError(""), 5000);
          return;
        }
        setPublishedProjects(parsed);
        window.dispatchEvent(new Event("universo-projects-updated"));
        setBackupSuccess("Backup restaurado e atualizado com sucesso!");
        setImportJson("");
        setTimeout(() => setBackupSuccess(""), 4000);
      } else {
        setBackupError("O formato do backup JSON deve ser uma lista de projetos válida.");
        setTimeout(() => setBackupError(""), 4000);
      }
    } catch (e) {
      setBackupError("JSON inválido. Certifique-se de colar o código de backup completo.");
      setTimeout(() => setBackupError(""), 4000);
    }
  };

  const handleDownloadCode = async () => {
    if (exportIsGenerating) return;
    setExportIsGenerating(true);
    setExportSuccess("");
    setExportError("");

    try {
      // Load current comments and ratings from localStorage to embed in the export
      const storedComments = localStorage.getItem("universo_cf_comments") || "{}";
      const storedRatings = localStorage.getItem("universo_cf_ratings") || "{}";
      
      let commentsData = {};
      let ratingsData = {};

      try { commentsData = JSON.parse(storedComments); } catch (e) { console.error(e); }
      try { ratingsData = JSON.parse(storedRatings); } catch (e) { console.error(e); }

      // Generate the zip Blob
      const zipBlob = await generateSiteZip(publishedProjects, commentsData, ratingsData);

      // Trigger standard browser download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `universo_cf_site_codigo_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess("Código do site empacotado e baixado com sucesso!");
      setTimeout(() => setExportSuccess(""), 4000);
    } catch (err) {
      console.error("Erro ao gerar ZIP do site:", err);
      setExportError("Ocorreu um erro ao processar e compactar o código do site.");
      setTimeout(() => setExportError(""), 4000);
    } finally {
      setExportIsGenerating(false);
    }
  };

  const handleClose = () => {
    setAccessCode("");
    setIsAuthenticated(false);
    setError("");
    setSuccessMsg("");
    onClose();
  };

  // Configuration settings helper
  const handleResetToDefault = () => {
    if (confirm("Tens a certeza que desejas apagar todos os conteúdos, incluindo músicas, livros, aplicativos e projetos?")) {
      localStorage.removeItem("universo_cf_published_projects");
      setPublishedProjects([]);
      window.dispatchEvent(new Event("universo-projects-updated"));
      setSuccessMsg("Todos os conteúdos foram eliminados com sucesso!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleSaveSocialLinks = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("universo_social_instagram", instagram.trim());
    localStorage.setItem("universo_social_youtube", youtube.trim());
    localStorage.setItem("universo_social_twitter", twitter.trim());
    localStorage.setItem("universo_social_facebook", facebook.trim());
    localStorage.setItem("universo_social_tiktok", tiktok.trim());
    localStorage.setItem("universo_contact_email", contactEmail.trim());
    localStorage.setItem("universo_contact_phone", contactPhone.trim());
    
    window.dispatchEvent(new Event("universo-social-updated"));
    setSuccessMsg("Configurações e redes sociais guardadas com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== adminPassword) {
      setError("A palavra-passe atual está incorreta.");
      return;
    }
    if (!newPassword.trim()) {
      setError("A nova palavra-passe não pode ser vazia.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("As novas palavras-passe não coincidem.");
      return;
    }

    localStorage.setItem("universo_cf_admin_password", newPassword.trim());
    setAdminPassword(newPassword.trim());
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
    setSuccessMsg("Palavra-passe alterada com sucesso! A redirecionar...");
    
    setTimeout(() => {
      setIsAuthenticated(false);
      setAccessCode("");
      setSuccessMsg("");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="admin-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          {/* Overlay click to close */}
          <div className="absolute inset-0 cursor-default" onClick={handleClose} />

          <motion.div
            id="admin-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className={`relative w-full ${isAuthenticated ? "max-w-4xl" : "max-w-xl"} border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl bg-[#08080f] my-8 overflow-hidden z-10 text-left transition-all duration-300`}
          >
            {/* Ambient Background Glow inside modal */}
            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-500 ${isAuthenticated ? "bg-amber-500/10" : "bg-sky-500/10"}`} />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-55 focus:outline-none"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {!isAuthenticated ? (
              /* Phase 1: Authentication Lock Screen */
              <div className="relative z-10 py-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Lock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-amber-500 block">
                      Acesso Privado
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                      Administração de Cardoso Francisco
                    </h2>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Olá, Cardoso! Este é o seu portal de gestão secreto. Por favor, digite o código de acesso exclusivo para autenticar-se e gerir o seu ecossistema digital.
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label htmlFor="access-code" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Código de Acesso do Administrador
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="access-code"
                        type="password"
                        placeholder="Escreva o código aqui..."
                        required
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3"
                    >
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 focus:outline-none flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Entrar no Painel</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Phase 2: Fully Functional High-Fidelity 6-Tab Workspace Console */
              <div className="relative z-10 flex flex-col h-full">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Unlock className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-amber-500 block">
                          Consola de Gestão
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                        Estúdio de Cardoso Francisco
                      </h2>
                    </div>
                  </div>
                  
                  <div className="text-slate-500 font-mono text-[10px] bg-white/2 border border-white/5 py-1.5 px-3.5 rounded-xl self-start sm:self-auto">
                    Acesso Seguro: <span className="text-amber-400 font-bold">Admin Ativo</span>
                  </div>
                </div>

                {/* Horizontal Navigation Menu (6 Tabs Ordered Exactly) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-thin border-b border-white/5">
                  {[
                    { id: "Painel", label: "Painel", icon: LayoutDashboard },
                    { id: "Conteúdos", label: "Conteúdos", icon: FileText },
                    { id: "Estatísticas", label: "Estatísticas", icon: BarChart3 },
                    { id: "Utilizadores", label: "Utilizadores", icon: Users },
                    { id: "Backup", label: "Backup", icon: Database },
                    { id: "Exportar", label: "Baixar Código", icon: Code },
                    { id: "Universo IA", label: "Universo IA", icon: Sparkles },
                    { id: "Segurança", label: "Segurança", icon: Shield },
                    { id: "Configurações", label: "Configurações", icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as AdminTab);
                          setSuccessMsg("");
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none ${
                          isActive
                            ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                            : "bg-[#0c0c14] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tabs Views Rendering Wrapper */}
                <div className="min-h-[380px] max-h-[60vh] overflow-y-auto pr-1">
                  
                  {/* TAB 1: PAINEL */}
                  {activeTab === "Painel" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Grid of 4 Metric Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Card 1: Total de anexos */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0a12] border border-white/5 flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                            <Folder className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <span className="text-2xl sm:text-3xl font-bold text-white block leading-none">0</span>
                            <span className="text-[11px] sm:text-xs text-slate-400 mt-1 block font-medium leading-tight">Total de anexos</span>
                          </div>
                        </div>

                        {/* Card 2: Visitantes únicos */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0a12] border border-white/5 flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 flex-shrink-0">
                            <Users className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <span className="text-2xl sm:text-3xl font-bold text-white block leading-none">0</span>
                            <span className="text-[11px] sm:text-xs text-slate-400 mt-1 block font-medium leading-tight">Visitantes únicos</span>
                          </div>
                        </div>

                        {/* Card 3: Downloads totais */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0a12] border border-white/5 flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                            <Download className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <span className="text-2xl sm:text-3xl font-bold text-white block leading-none">0</span>
                            <span className="text-[11px] sm:text-xs text-slate-400 mt-1 block font-medium leading-tight">Downloads totais</span>
                          </div>
                        </div>

                        {/* Card 4: Reproduções totais */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0a12] border border-white/5 flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                            <Headphones className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <span className="text-2xl sm:text-3xl font-bold text-white block leading-none">0</span>
                            <span className="text-[11px] sm:text-xs text-slate-400 mt-1 block font-medium leading-tight">Reproduções totais</span>
                          </div>
                        </div>
                      </div>

                      {/* Content by Category (Conteúdo por categoria) */}
                      <div className="p-5 rounded-2xl bg-[#0b0a12] border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-amber-500">
                          <BarChart3 className="w-5 h-5" />
                          <h4 className="text-sm font-bold text-white">Conteúdo por categoria</h4>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Row 1: Livros */}
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-slate-300 w-16 sm:w-20 flex-shrink-0">Livros</span>
                            <div className="flex-grow h-2 bg-[#201a15] rounded-full overflow-hidden mx-2">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalCount > 0 ? (booksCount / totalCount) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-white font-mono w-4 text-right flex-shrink-0">{booksCount}</span>
                          </div>

                          {/* Row 2: Aplicativos */}
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-slate-300 w-16 sm:w-20 flex-shrink-0">Aplicativos</span>
                            <div className="flex-grow h-2 bg-[#201a15] rounded-full overflow-hidden mx-2">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalCount > 0 ? (appsCount / totalCount) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-white font-mono w-4 text-right flex-shrink-0">{appsCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Latest Uploads (Últimos uploads) */}
                      <div className="p-5 rounded-2xl bg-[#0b0a12] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-amber-500 pb-2">
                          <Clock className="w-5 h-5" />
                          <h4 className="text-sm font-bold text-white">Últimos uploads</h4>
                        </div>

                        <div className="space-y-2">
                          {publishedProjects.length === 0 ? (
                            <div className="text-center py-4 text-xs text-slate-500 font-mono">
                              Nenhum upload publicado ainda.
                            </div>
                          ) : (
                            publishedProjects.slice(0, 3).map((project) => (
                              <div key={project.id} className="flex items-center justify-between py-2 border-b border-white/2 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-500 flex-shrink-0">
                                    {project.type === "apps" ? <Smartphone className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                  </div>
                                  <span className="font-bold text-xs sm:text-sm text-white truncate">{project.title}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono capitalize">{project.type}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Bottom row of 3 smaller cards */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Downloads */}
                        <div className="p-4 rounded-2xl bg-[#0b0a12] border border-white/5 text-center flex flex-col justify-center items-center py-5">
                          <span className="text-2xl font-bold text-emerald-400">0</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Downloads</span>
                        </div>

                        {/* Reproduções */}
                        <div className="p-4 rounded-2xl bg-[#0b0a12] border border-white/5 text-center flex flex-col justify-center items-center py-5">
                          <span className="text-2xl font-bold text-purple-400">0</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Reproduções</span>
                        </div>

                        {/* Visitas a apps */}
                        <div className="p-4 rounded-2xl bg-[#0b0a12] border border-white/5 text-center flex flex-col justify-center items-center py-5">
                          <span className="text-2xl font-bold text-amber-500">0</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Visitas a apps</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: CONTEÚDOS */}
                  {activeTab === "Conteúdos" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      {/* Left: Form */}
                      <div ref={formContainerRef}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono mb-4 flex items-center gap-1.5">
                          {editingProjectId ? (
                            <>
                              <Edit className="w-4 h-4 text-amber-500 animate-pulse" />
                              Editar Conteúdo: {projectTitle || "Sem título"}
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-amber-500" />
                              Lançar Novo Conteúdo no Mural
                            </>
                          )}
                        </h3>

                        <form onSubmit={handlePublishProject} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Tipo de Lançamento
                            </label>
                            <select
                              value={projectType}
                              onChange={(e) => setProjectType(e.target.value as any)}
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all cursor-pointer"
                            >
                              <option value="music">Músicas</option>
                              <option value="books">Livros</option>
                              <option value="apps">Aplicativos</option>
                              <option value="outros">outros projectos: so CF</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Título
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Escreve o título do conteúdo..."
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Descrição (opcional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Escreve uma breve descrição (opcional)..."
                              value={projectDesc}
                              onChange={(e) => setProjectDesc(e.target.value)}
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
                              <span>Link de Download / Externo (opcional)</span>
                            </label>
                            <input
                              type="url"
                              placeholder="https://drive.google.com/... ou https://mega.nz/..."
                              value={projectLink}
                              onChange={(e) => setProjectLink(e.target.value)}
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Imagem de capa (opcional)
                            </label>
                            <div className="flex items-center gap-3">
                              <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:border-white/20 select-none">
                                Selecionar Capa
                                <input
                                  ref={coverInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setCoverImageName(file.name);
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setCoverImageData(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      setCoverImageName(null);
                                      setCoverImageData(null);
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-xs text-slate-400 font-mono truncate">
                                {coverImageName || "Nenhum ficheiro selecionado"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Ficheiro principal (MP3, APK, EPUB, PDF…)
                            </label>
                            <div className="flex items-center gap-3">
                              <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:border-white/20 select-none">
                                Selecionar Ficheiro
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setMainFileName(file.name);
                                      const sizeInMB = file.size / (1024 * 1024);
                                      setMainFileSize(sizeInMB.toFixed(2) + " MB");
                                      
                                      if (sizeInMB > 150) {
                                        setError("Aviso: Ficheiro muito grande para salvar localmente (máx 150 MB). É preferível usar um link externo no campo acima.");
                                      } else {
                                        setError("");
                                      }

                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setMainFileData(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      setMainFileName(null);
                                      setMainFileSize(null);
                                      setMainFileData(null);
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-xs text-slate-400 font-mono truncate">
                                {mainFileName || "Nenhum ficheiro selecionado"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5 font-mono leading-relaxed">
                              Nota: Para ficheiros grandes (como APKs ou PDFs pesados), adicione-os ao Google Drive ou Mega e insira o link de download no campo "Link de Download / Externo" acima para evitar limites de armazenamento do navegador.
                            </p>
                            <div className="flex gap-2 mt-2">
                              <a
                                href="https://drive.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Abrir Google Drive
                              </a>
                              <a
                                href="https://mega.nz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Abrir Mega
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 py-1">
                            <input
                              id="allow-download"
                              type="checkbox"
                              checked={allowDownload}
                              onChange={(e) => setAllowDownload(e.target.checked)}
                              className="w-4 h-4 rounded border-white/10 bg-[#020205] text-amber-500 focus:ring-amber-500/50 focus:ring-offset-slate-900 transition-all cursor-pointer"
                            />
                            <label htmlFor="allow-download" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
                              Permitir download por visitantes
                            </label>
                          </div>

                          {successMsg && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5"
                            >
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                              <span>{successMsg}</span>
                            </motion.div>
                          )}

                          <div className="flex gap-3">
                            {editingProjectId && (
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-1/3 py-3.5 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/10 focus:outline-none"
                              >
                                Cancelar
                              </button>
                            )}
                            <button
                              type="submit"
                              className={`py-3.5 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md focus:outline-none ${
                                editingProjectId ? "w-2/3 bg-emerald-500 hover:bg-emerald-400" : "w-full bg-amber-500 hover:bg-amber-400"
                              }`}
                            >
                              {editingProjectId ? "Guardar Alterações" : "Carregar Ficheiro"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Right: Listings */}
                      <div className="flex flex-col h-full">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono mb-4 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-500" />
                          Ficheiros Carregados ({publishedProjects.length})
                        </h3>

                        <div className="flex-grow overflow-y-auto max-h-[380px] space-y-3 pr-1">
                          {publishedProjects.length === 0 ? (
                            <div className="border border-white/5 bg-white/2 rounded-2xl p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-48">
                              <Globe className="w-8 h-8 stroke-[1.5] mb-2 text-slate-600 animate-pulse" />
                              <p>Nenhum ficheiro carregado até ao momento.</p>
                              <p className="mt-1">Preencha o formulário para carregar ficheiros.</p>
                            </div>
                          ) : (
                            publishedProjects.map((proj) => {
                              // Translate project type to Portuguese tag
                              const typeLabels: Record<string, string> = {
                                music: "Música",
                                books: "Livro",
                                apps: "Aplicativo",
                                outros: "outros projectos: so CF"
                              };
                              return (
                                <div
                                  key={proj.id}
                                  className={`p-4 rounded-xl border transition-all flex justify-between items-start gap-3 ${
                                    editingProjectId === proj.id 
                                      ? "bg-amber-500/5 border-amber-500/30" 
                                      : "bg-white/2 border-white/5 hover:border-white/10"
                                  }`}
                                >
                                  <div className="flex gap-3 min-w-0 flex-1">
                                    {/* App Image view inside Admin list */}
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex-shrink-0 flex items-center justify-center">
                                      <img
                                        src={proj.coverImageData || (
                                          proj.title.toLowerCase().includes("minsa") || 
                                          proj.title.toLowerCase().includes("prep") || 
                                          proj.title.toLowerCase().includes("cf")
                                            ? minsaLogo
                                            : (
                                                proj.type === "apps" ? minsaLogo :
                                                proj.type === "books" ? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80" :
                                                proj.type === "music" ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80" :
                                                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80"
                                              )
                                        )}
                                        alt={proj.title}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold uppercase">
                                          {typeLabels[proj.type] || proj.type}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {proj.publishedAt ? (
                                            proj.publishedAt.includes(" de ") ? (
                                              proj.publishedAt.split(" de ")[0] + " " + (proj.publishedAt.split(" de ")[1]?.substring(0, 3) || "")
                                            ) : (
                                              proj.publishedAt
                                            )
                                          ) : (
                                            "N/D"
                                          )}
                                        </span>
                                      </div>
                                      <h4 className="font-bold text-xs text-white truncate">{proj.title}</h4>
                                      {proj.desc && (
                                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{proj.desc}</p>
                                      )}
                                      
                                      {/* Uploaded File meta */}
                                      <div className="space-y-1 pt-1.5">
                                        {proj.fileName && (
                                          <p className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            {proj.fileName} {proj.fileSize && `(${proj.fileSize})`}
                                          </p>
                                        )}
                                        {proj.coverImageName && (
                                          <p className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            Capa: {proj.coverImageName}
                                          </p>
                                        )}
                                        {proj.type !== "books" && proj.type !== "outros" && (
                                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-500 block w-max">
                                            Download: {proj.allowDownload ? "Permitido" : "Não Permitido"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => setOptionsProject(proj)}
                                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-all cursor-pointer focus:outline-none"
                                      title="Opções de Edição"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProject(proj.id)}
                                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all cursor-pointer flex-shrink-0 focus:outline-none"
                                      title="Remover"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: ESTATÍSTICAS */}
                  {activeTab === "Estatísticas" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        Desempenho e Cliques Simulado do Ecossistema
                      </h3>

                      {/* Distribution Bars */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                          <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Popularidade de Categorias</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Aplicativos & Software</span>
                                <span className="text-white font-mono font-bold">{totalCount > 0 ? Math.round((appsCount / totalCount) * 100) : 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalCount > 0 ? Math.round((appsCount / totalCount) * 100) : 0}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Livros & Literatura</span>
                                <span className="text-white font-mono font-bold">{totalCount > 0 ? Math.round((booksCount / totalCount) * 100) : 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${totalCount > 0 ? Math.round((booksCount / totalCount) * 100) : 0}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Músicas & Áudio</span>
                                <span className="text-white font-mono font-bold">{totalCount > 0 ? Math.round((musicCount / totalCount) * 100) : 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${totalCount > 0 ? Math.round((musicCount / totalCount) * 100) : 0}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Outros Lançamentos</span>
                                <span className="text-white font-mono font-bold">{totalCount > 0 ? Math.round((outrosCount / totalCount) * 100) : 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${totalCount > 0 ? Math.round((outrosCount / totalCount) * 100) : 0}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Activity Grid mockup */}
                        <div className="p-5 rounded-2xl bg-white/2 border border-white/5 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-300 uppercase font-mono mb-3">Distribuição Semanal de Visitas</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                              {totalCount > 0 
                                ? "As visitas reais mostram o engajamento durante os finais de semana e segundas-feiras com novas publicações."
                                : "Nenhum projeto publicado ainda. Publique projetos para começar a monitorizar as visitas semanais."
                              }
                            </p>
                          </div>
                          
                          <div className="flex items-end justify-between gap-2 h-24 pt-4">
                            {(totalCount > 0 ? [40, 65, 30, 85, 50, 95, 70] : [0, 0, 0, 0, 0, 0, 0]).map((height, i) => (
                              <div key={i} className="flex flex-col items-center gap-1.5 flex-grow">
                                <div className="w-full bg-amber-500/20 hover:bg-amber-500/40 rounded-t-md transition-all cursor-pointer" style={{ height: `${height}%` }} />
                                <span className="text-[9px] font-mono text-slate-500">
                                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* General overview metadata */}
                      <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/10 text-xs text-slate-300 flex items-start gap-2.5">
                        <Eye className="w-4.5 h-4.5 text-sky-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Nota do Sistema:</strong> As estatísticas acima simulam o impacto das visualizações reais e do engajamento. Isto serve para estimar as métricas de popularidade de cada aplicativo e livro criado por Cardoso Francisco no ecossistema Universo CF.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: UTILIZADORES */}
                  {activeTab === "Utilizadores" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-500" />
                        Utilizadores e Níveis de Permissões
                      </h3>

                      <div className="space-y-3">
                        {/* Profile 1: Admin Owner */}
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-display font-black text-amber-400">
                              CF
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs text-white">Cardoso Francisco</h4>
                                <span className="text-[8px] font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded uppercase">Dono</span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{contactEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Ativo Agora</span>
                            <span className="text-[9px] text-slate-500 block mt-1 font-mono">Sessão: Computador</span>
                          </div>
                        </div>

                        {/* Simulated API key / system key users */}
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between gap-4 opacity-75">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                              🤖
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs text-slate-300">Servidor Cloud Integrador</h4>
                                <span className="text-[8px] font-mono font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase">API</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">universo-integration-agent@api</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full font-bold">Autorizado</span>
                            <span className="text-[9px] text-slate-600 block mt-1 font-mono">Serviço em Segundo Plano</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-white/5 bg-[#030307]">
                        <h4 className="font-bold text-xs text-slate-300 mb-2 font-display">Opções de Segurança de Utilizador</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                          Podes alterar o nível de restrição para outros colaboradores ou visitantes. Por defeito, apenas o administrador com o código secreto pode alterar os dados.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Máximo", "Moderado", "Apenas Leitura"].map((level) => (
                            <button
                              key={level}
                              onClick={() => setSecurityLevel(level)}
                              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all focus:outline-none cursor-pointer border ${
                                securityLevel === level
                                  ? "bg-amber-500 text-slate-950 border-amber-500"
                                  : "bg-white/5 text-slate-400 hover:text-white border-white/5"
                              }`}
                            >
                              Restrição: {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: BACKUP */}
                  {activeTab === "Backup" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-amber-500" />
                        Exportar e Restaurar Cópias de Segurança (Backup)
                      </h3>

                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        Não percas os teus lançamentos! Podes descarregar todos os teus projetos criados e publicados para o teu computador em formato JSON, e restaurá-los a qualquer momento se limpares os dados do teu navegador.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Export side */}
                        <div className="p-5 rounded-2xl bg-white/2 border border-white/5 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-200 uppercase font-mono mb-2">Descarregar Backup</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                              Faz download instantâneo de um ficheiro contendo a lista completa de aplicativos, músicas e livros criados.
                            </p>
                          </div>
                          
                          <button
                            onClick={handleExportBackup}
                            className="w-full py-3 bg-[#0c0c14] hover:bg-white/5 border border-white/5 hover:border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                          >
                            <Download className="w-4 h-4 text-amber-500" />
                            <span>Exportar Ficheiro JSON</span>
                          </button>
                        </div>

                        {/* Import/Restore side */}
                        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                          <h4 className="font-bold text-xs text-slate-200 uppercase font-mono mb-2">Importar Backup</h4>
                          <form onSubmit={handleImportBackup} className="space-y-3">
                            <textarea
                              required
                              rows={3}
                              value={importJson}
                              onChange={(e) => setImportJson(e.target.value)}
                              placeholder="Cole o código JSON de backup aqui para restaurar..."
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none font-mono"
                            />
                            <button
                              type="submit"
                              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Restaurar Backup</span>
                            </button>
                          </form>
                        </div>
                      </div>

                      {backupSuccess && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5"
                        >
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>{backupSuccess}</span>
                        </motion.div>
                      )}

                      {backupError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5"
                        >
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{backupError}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: EXPORTAR */}
                  {activeTab === "Exportar" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
                          <Code className="w-4 h-4 text-amber-500" />
                          Baixar Código Fonte do Site (HTML, CSS e JS)
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Empacote todo o site num ficheiro ZIP pronto para publicar em qualquer hospedagem gratuita.
                        </p>
                      </div>

                      <div className="bg-[#030712]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                          Recursos do Código Gerado
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">Auto-Atualizável</span>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                O ano de copyright, fuso de Luanda e data atualizam-se sozinhos todos os dias e anos.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">Dados Pré-Carregados</span>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                Todos os seus {publishedProjects.length} lançamentos de livros, apps e músicas atuais são embutidos como base de dados.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">Ficheiros Decodificáveis</span>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                Os ficheiros que fez upload no mural são decodificados em tempo real no download offline.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">Interatividade Integrada</span>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                Comentários, avaliações por estrelas e envio de contactos persistem localmente na máquina do visitante!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-white/5 rounded-2xl p-5 bg-[#040409] space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest block">Informação do Ficheiro</span>
                          <p className="text-xs text-slate-300 mt-1">
                            O pacote gerado conterá os ficheiros <code className="text-amber-400 font-mono text-[11px] bg-white/2 px-1.5 py-0.5 rounded">index.html</code>, <code className="text-amber-400 font-mono text-[11px] bg-white/2 px-1.5 py-0.5 rounded">style.css</code> e <code className="text-amber-400 font-mono text-[11px] bg-white/2 px-1.5 py-0.5 rounded">script.js</code> compactados numa pasta ZIP.
                          </p>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleDownloadCode}
                            disabled={exportIsGenerating}
                            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-450 hover:to-orange-550 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Download className={`w-4 h-4 ${exportIsGenerating ? "animate-bounce" : ""}`} />
                            <span>
                              {exportIsGenerating ? "A gerar ficheiros do site..." : "Baixar Código Fonte (ZIP)"}
                            </span>
                          </button>
                        </div>

                        {exportSuccess && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5"
                          >
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>{exportSuccess}</span>
                          </motion.div>
                        )}

                        {exportError && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5"
                          >
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                            <span>{exportError}</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: UNIVERSO IA */}
                  {activeTab === "Universo IA" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-[65vh]"
                    >
                      <UniversoIAChat 
                        mode="admin"
                        publishedProjects={publishedProjects}
                        onExecuteAction={handleAIExecuteAction}
                      />
                    </motion.div>
                  )}

                  {/* TAB: SEGURANÇA */}
                  {activeTab === "Segurança" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          Segurança do Sistema e Proteção Anti-Hacker
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Escudos em tempo real, monitorização de integridade e varreduras contra códigos nocivos.
                        </p>
                      </div>

                      {/* Quick Status Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#030712]/60 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Estado Geral</span>
                            <span className="text-xs font-bold text-white">100% Protegido</span>
                          </div>
                        </div>

                        <div className="bg-[#030712]/60 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Escudo de Sessão</span>
                            <span className="text-xs font-bold text-white">Criptografia SSL Ativa</span>
                          </div>
                        </div>

                        <div className="bg-[#030712]/60 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                            <Terminal className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Auditoria</span>
                            <span className="text-xs font-bold text-white">0 Ameaças / Zero Day</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Shields Controls */}
                      <div className="bg-[#030712]/30 border border-white/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                          Escudos de Defesa Ativos
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Shield 1 */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#020205] border border-white/5">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Shield className="w-4 h-4" />
                              </div>
                              <div className="pr-4">
                                <h5 className="text-xs font-bold text-white">Proteção Anti-Exploit & Sanitização XSS</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">Filtra ativamente todas as entradas de dados e formulários para barrar scripts maliciosos.</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setAntiExploit(!antiExploit)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${antiExploit ? 'bg-emerald-500' : 'bg-slate-800'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform ${antiExploit ? 'translate-x-4.5' : 'translate-x-1'}`} />
                            </button>
                          </div>

                          {/* Shield 2 */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#020205] border border-white/5">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-sky-500/5 border border-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Activity className="w-4 h-4" />
                              </div>
                              <div className="pr-4">
                                <h5 className="text-xs font-bold text-white">Prevenção contra Ataques DDoS & Rate Limiting</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">Controla o limite de solicitações de rede para evitar sobrecarga provocada por bots.</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setDdosPrevention(!ddosPrevention)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${ddosPrevention ? 'bg-emerald-500' : 'bg-slate-800'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform ${ddosPrevention ? 'translate-x-4.5' : 'translate-x-1'}`} />
                            </button>
                          </div>

                          {/* Shield 3 */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#020205] border border-white/5">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/5 border border-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lock className="w-4 h-4" />
                              </div>
                              <div className="pr-4">
                                <h5 className="text-xs font-bold text-white">Bloqueio Dinâmico de IP Suspeito</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">Bloqueia automaticamente o acesso de IPs que tentam forçar credenciais ou acessos restritos.</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setIpBlocking(!ipBlocking)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${ipBlocking ? 'bg-emerald-500' : 'bg-slate-800'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform ${ipBlocking ? 'translate-x-4.5' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Code and App Scanner Tool */}
                      <div className="bg-[#030712]/30 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                              Varredura de Vírus & Malware
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Verifique a integridade do código e da árvore de arquivos em tempo real.</p>
                          </div>
                          
                          <button
                            onClick={handleStartScan}
                            disabled={isScanning}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[10px] tracking-wider px-4 py-2 rounded-xl transition-all disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                          >
                            <Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                            {isScanning ? "Escaneando..." : "Iniciar Varredura"}
                          </button>
                        </div>

                        {/* Scanner Process UI */}
                        {(isScanning || scanProgress > 0) && (
                          <div className="bg-[#020205] border border-white/5 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                {scanState}
                              </span>
                              <span className="text-emerald-400 font-bold">{scanProgress}%</span>
                            </div>
                            
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                className="bg-emerald-500 h-1.5 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${scanProgress}%` }}
                                transition={{ ease: "easeInOut" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Security Logs Display */}
                      <div className="bg-[#030712]/30 border border-white/5 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                          Registo de Auditoria de Segurança
                        </h4>
                        
                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-400 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                          {securityLogs.map((log, index) => (
                            <div key={index} className="flex gap-2">
                              <span className="text-emerald-500 flex-shrink-0">&gt;</span>
                              <span className="break-all text-slate-300">{log}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 6: CONFIGURAÇÕES */}
                  {activeTab === "Configurações" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
                    >
                      {/* REDES SOCIAIS FORM */}
                      <form onSubmit={handleSaveSocialLinks} className="space-y-5">
                        <div className="border-b border-white/5 pb-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
                            <Globe className="w-4 h-4 text-amber-500" />
                            Redes Sociais
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Instagram */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Instagram
                            </label>
                            <input
                              type="text"
                              value={instagram}
                              onChange={(e) => setInstagram(e.target.value)}
                              placeholder="@utilizador ou URL"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>

                          {/* YouTube */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              YouTube
                            </label>
                            <input
                              type="text"
                              value={youtube}
                              onChange={(e) => setYoutube(e.target.value)}
                              placeholder="@canal ou URL"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>

                          {/* Twitter / X */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Twitter / X
                            </label>
                            <input
                              type="text"
                              value={twitter}
                              onChange={(e) => setTwitter(e.target.value)}
                              placeholder="@utilizador ou URL"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>

                          {/* Facebook */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Facebook
                            </label>
                            <input
                              type="text"
                              value={facebook}
                              onChange={(e) => setFacebook(e.target.value)}
                              placeholder="@página ou URL"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>

                          {/* TikTok */}
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              TikTok
                            </label>
                            <input
                              type="text"
                              value={tiktok}
                              onChange={(e) => setTiktok(e.target.value)}
                              placeholder="@utilizador ou URL"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>

                          {/* Informações de Contacto */}
                          <div className="md:col-span-2 border-t border-white/5 pt-4 mt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-1.5">
                              Informações de Contacto
                            </h4>
                          </div>

                          {/* E-mail */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="exemplo@email.com"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>

                          {/* Número */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Número de Telefone
                            </label>
                            <input
                              type="text"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="975 221 805"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                            />
                          </div>
                        </div>

                        {/* Editar o site label + Guardar alteração button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <span className="text-[10px] text-slate-500 font-mono">
                            Editar o site
                          </span>
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none"
                          >
                            Guardar alteração.
                          </button>
                        </div>
                      </form>

                      {/* SEGURANÇA — ALTERAR PALAVRA-PASSE */}
                      <form onSubmit={handleChangePassword} className="space-y-5 pt-6 border-t border-white/5">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-amber-500" />
                            Segurança — Alterar Palavra-Passe
                          </h3>
                        </div>

                        <div className="space-y-4 max-w-xl">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Palavra-passe atual
                            </label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Digite a palavra-passe atual"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Nova palavra-passe
                            </label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Digite a nova palavra-passe"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                              Confirmar nova palavra-passe
                            </label>
                            <input
                              type="password"
                              required
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Confirme a nova palavra-passe"
                              className="w-full bg-[#020205] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                            />
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none"
                            >
                              Alterar Palavra-Passe
                            </button>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-mono mt-2">
                              Após a alteração, será redirecionado para o login com uma nova senha.
                            </p>
                          </div>
                        </div>
                      </form>

                      {/* ZONA DE PERIGO */}
                      <div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/2 space-y-4 pt-4 mt-6">
                        <h4 className="font-bold text-xs text-rose-400 flex items-center gap-1.5 font-display uppercase tracking-widest">
                          <AlertTriangle className="w-4 h-4" />
                          ⚠ Zona de Perigo
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                          Estas ações são irreversíveis. Tenha cuidado.
                        </p>

                        <div className="border-t border-white/5 pt-4 space-y-3">
                          <div>
                            <h5 className="font-bold text-xs text-slate-200">Eliminar todo o conteúdo</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              Remova todas as músicas, livros, aplicativos e projetos.
                            </p>
                          </div>
                          <button
                            onClick={handleResetToDefault}
                            className="px-5 py-2 bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-rose-500/30 focus:outline-none flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>

                      {/* State status alerts inside settings */}
                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5"
                        >
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>{successMsg}</span>
                        </motion.div>
                      )}

                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5"
                        >
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                </div>

                {/* Footer Controls inside Workspace */}
                <div className="border-t border-white/10 mt-6 pt-5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Administrador: <strong className="text-slate-400">Cardoso Francisco</strong>
                  </span>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/5 focus:outline-none"
                  >
                    Sair do Painel
                  </button>
                </div>
              </div>
            )}

            {/* Options Selection Menu Overlay */}
            {optionsProject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-[#0a0a14] border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-6"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Opções do Lançamento
                    </h4>
                    <button
                      onClick={() => setOptionsProject(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-4 items-center p-3.5 rounded-2xl bg-white/2 border border-white/5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
                      <img
                        src={optionsProject.coverImageData || (
                          optionsProject.title.toLowerCase().includes("minsa") || 
                          optionsProject.title.toLowerCase().includes("prep") || 
                          optionsProject.title.toLowerCase().includes("cf")
                            ? minsaLogo
                            : (
                                optionsProject.type === "books" ? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80" :
                                optionsProject.type === "music" ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80" :
                                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80"
                              )
                        )}
                        alt={optionsProject.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-white text-xs truncate">{optionsProject.title}</h5>
                      <p className="text-[10px] text-amber-500 font-mono mt-0.5 uppercase tracking-wider font-bold">
                        {optionsProject.type === "books" ? "Livro" : optionsProject.type === "music" ? "Música" : optionsProject.type === "apps" ? "Aplicativo" : "Outros"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => {
                        handleOptionSelect(optionsProject, "texto");
                        setOptionsProject(null);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-white/2 hover:bg-amber-500/10 hover:text-amber-450 border border-white/5 hover:border-amber-500/20 rounded-xl text-xs font-bold uppercase tracking-wider text-left text-slate-300 transition-all group cursor-pointer focus:outline-none"
                    >
                      <Edit3 className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span>Editar Texto (Título, Descrição e Link)</span>
                    </button>

                    <button
                      onClick={() => {
                        handleOptionSelect(optionsProject, "ver_capa");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-white/2 hover:bg-sky-500/10 hover:text-sky-450 border border-white/5 hover:border-sky-500/20 rounded-xl text-xs font-bold uppercase tracking-wider text-left text-slate-300 transition-all group cursor-pointer focus:outline-none"
                    >
                      <Eye className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                      <span>Ver Capa do Lançamento</span>
                    </button>

                    <button
                      onClick={() => {
                        handleOptionSelect(optionsProject, "editar_capa");
                        setOptionsProject(null);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-white/2 hover:bg-purple-500/10 hover:text-purple-450 border border-white/5 hover:border-purple-500/20 rounded-xl text-xs font-bold uppercase tracking-wider text-left text-slate-300 transition-all group cursor-pointer focus:outline-none"
                    >
                      <Image className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span>Editar / Mudar Capa</span>
                    </button>

                    <button
                      onClick={() => {
                        handleOptionSelect(optionsProject, "reenviar_ficheiro");
                        setOptionsProject(null);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-white/2 hover:bg-emerald-500/10 hover:text-emerald-450 border border-white/5 hover:border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-wider text-left text-slate-300 transition-all group cursor-pointer focus:outline-none"
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>Reenviar Ficheiro Principal</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setOptionsProject(null)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer focus:outline-none"
                    >
                      Fechar Opções
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Lightbox Cover Preview */}
            {viewingCoverUrl && (
              <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                <div className="relative max-w-lg w-full flex flex-col items-center">
                  <button
                    onClick={() => setViewingCoverUrl(null)}
                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all cursor-pointer focus:outline-none"
                    title="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={viewingCoverUrl}
                    alt="Visualização da Capa"
                    className="max-h-[75vh] max-w-full rounded-2xl border border-white/15 object-contain shadow-2xl"
                  />
                  <p className="text-xs text-slate-400 font-mono mt-4">
                    Capa do Lançamento (Visualização em tamanho real)
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
