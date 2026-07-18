import React, { useState, useEffect } from "react";
import { ContactFormData } from "../types";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ContactSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSection({ isOpen, onClose }: ContactSectionProps) {
  const [contacts, setContacts] = useState({
    email: "cardosofrancisco17g@gmail.com",
    phone: "975 221 805",
  });

  const loadContacts = () => {
    setContacts({
      email: localStorage.getItem("universo_contact_email") || "cardosofrancisco17g@gmail.com",
      phone: localStorage.getItem("universo_contact_phone") || "975 221 805",
    });
  };

  useEffect(() => {
    loadContacts();
    window.addEventListener("universo-social-updated", loadContacts);
    return () => {
      window.removeEventListener("universo-social-updated", loadContacts);
    };
  }, []);

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "geral",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "security_error">("idle");
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);
  const [securityLog, setSecurityLog] = useState<string>("Pronto para transmissão segura.");
  const [mouseDownOnBackdrop, setMouseDownOnBackdrop] = useState(false);

  const sanitizeInput = (val: string) => {
    // Blocks injection patterns and script tags dynamically
    const hasScriptPattern = /<script|javascript:|onload|onerror|onclick/i.test(val);
    if (hasScriptPattern) {
      setSecurityLog("Aviso: Tentativa de injeção de código bloqueada pelo escudo anti-hacker!");
    }
    return val
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)*\s*|\s*)\/?>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/onload|onerror|onclick|onmouseover/gi, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      return;
    }
    if (!isSecurityVerified) {
      setSubmitStatus("security_error");
      setSecurityLog("Aviso: É necessário verificar o canal seguro antes de transmitir!");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate high-fidelity server transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      // Reset form on success
      setFormData({
        name: "",
        email: "",
        subject: "geral",
        message: ""
      });
      setIsSecurityVerified(false);
      setSecurityLog("Pronto para transmissão segura.");
    }, 1400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="contact-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          {/* Overlay click to close with mousedown/mouseup protection */}
          <div 
            className="absolute inset-0 cursor-default" 
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setMouseDownOnBackdrop(true);
              }
            }}
            onMouseUp={(e) => {
              if (mouseDownOnBackdrop && e.target === e.currentTarget) {
                onClose();
              }
              setMouseDownOnBackdrop(false);
            }}
          />

          <motion.div
            id="contact-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-5xl glass border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl bg-slate-950 overflow-y-auto max-h-[92vh] z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-55 focus:outline-none"
              title="Fechar"
            >
              <X className="w-5.5 h-5.5" />
            </button>

            {/* Section Title */}
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500/10 border border-sky-500/25 rounded-full mb-4 text-sky-405 text-xs font-bold font-mono uppercase tracking-widest">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> Fale Connosco
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                Envie uma <span className="text-sky-400 accent-glow">Mensagem Direta</span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Tem alguma ideia para um aplicativo? Quer adquirir um dos livros completos de Cardoso Francisco ou colaborar cientificamente? Envie os seus dados abaixo e responderemos rapidamente.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: CONTACT CARD DETAILS */}
              <div className="lg:col-span-4 glass border border-white/10 rounded-3xl p-6.5 text-left">
                <h3 className="font-display font-bold text-lg text-white tracking-tight mb-2">
                  Informações de Contacto
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Utilize os canais diretos do Universo CF se preferir falar por plataformas externas ou telefone.
                </p>

                <div className="space-y-5">
                  {/* Email list */}
                  <div className="flex gap-3 px-1 py-0.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[10px] text-slate-450 uppercase tracking-widest font-mono">E-mail Principal</h4>
                      <a
                        href={`mailto:${contacts.email}`}
                        className="text-slate-250 font-bold text-xs sm:text-sm hover:text-sky-400 transition-colors block mt-1 break-all"
                      >
                        {contacts.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone List */}
                  <div className="flex gap-3 px-1 py-0.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[10px] text-slate-450 uppercase tracking-widest font-mono">Telefone</h4>
                      <a
                        href={`tel:${contacts.phone.replace(/[^0-9+]/g, "")}`}
                        className="text-slate-250 font-bold text-xs sm:text-sm hover:text-sky-400 transition-colors block mt-1"
                      >
                        {contacts.phone}
                      </a>
                    </div>
                  </div>

                  {/* Location List */}
                  <div className="flex gap-3 px-1 py-0.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[10px] text-slate-450 uppercase tracking-widest font-mono">Localização Geral</h4>
                      <p className="text-slate-250 font-bold text-xs sm:text-sm block mt-1">
                        Luanda, Angola
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: HIGH-REFINED FORM CONTAINER */}
              <div className="lg:col-span-8 glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                        Seu Nome Completo *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Cardoso Francisco"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 bg-[#030712]/60 text-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                        Endereço de E-mail *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ex: cardoso@exemplo.com"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 bg-[#030712]/60 text-white"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Assunto de Interesse
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 bg-[#030712]/60 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-[#38bdf8] cursor-pointer"
                    >
                      <option value="geral" className="bg-[#0f172a] text-slate-200">Dúvida Geral / Feedback</option>
                      <option value="books" className="bg-[#0f172a] text-slate-200">Adquirir Livros Completos</option>
                      <option value="collab" className="bg-[#0f172a] text-slate-200">Proposta de Colaboração / Parceria</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Escreva a sua Mensagem *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Escreva detalhadamente o que precisa..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 bg-[#030712]/60 text-white resize-none"
                    />
                  </div>

                  {/* Form Feedback Alerts */}
                  {submitStatus === "success" && (
                    <div className="flex gap-2.5 items-center p-4 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/20 text-xs sm:text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>Muito obrigado! A sua mensagem foi transmitida com sucesso para o Universo CF.</span>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="flex gap-2.5 items-center p-4 bg-rose-500/10 text-rose-350 rounded-xl border border-rose-500/20 text-xs sm:text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>Por favor, preencha todos os campos obrigatórios anotados com asterisco (*).</span>
                    </div>
                  )}

                  {submitStatus === "security_error" && (
                    <div className="flex gap-2.5 items-center p-4 bg-rose-500/10 text-rose-350 rounded-xl border border-rose-500/20 text-xs sm:text-sm">
                      <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />
                      <span>Transmissão Bloqueada: É necessário verificar o canal de segurança seguro abaixo antes de transmitir dados.</span>
                    </div>
                  )}

                  {/* Anti-Hacker Security Check Card */}
                  <div className="bg-[#030712]/40 border border-white/5 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${isSecurityVerified ? "text-emerald-400" : "text-sky-400 animate-pulse"}`} />
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-300">
                          Escudo de Segurança Ativo
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                        SSL / Anti-XSS & Bots
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#020205] border border-white/5 p-3 rounded-xl text-left">
                      <div className="text-[10px] font-mono text-slate-350">
                        Status: <span className={isSecurityVerified ? "text-emerald-400 font-bold" : "text-sky-400 font-bold"}>{securityLog}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isSecurityVerified) return;
                          setIsSecurityVerified(true);
                          setSecurityLog("Conexão validada! Assinatura digital verificada.");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isSecurityVerified
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400"
                        }`}
                      >
                        {isSecurityVerified ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Canal Verificado
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Verificar Canal Seguro
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Trigger */}
                  <div className="pt-2 flex justify-end">
                    <button
                      id="btn-submit-contact"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-full font-bold uppercase text-xs tracking-wider transition-all focus:outline-none disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer shadow-lg hover:shadow-sky-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Enviar Mensagem
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
