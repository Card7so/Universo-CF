import { useState, useEffect } from "react";
import { Layers, Mail, Phone, MapPin, Instagram, Youtube, Twitter, Facebook } from "lucide-react";

interface FooterProps {
  onLinkClick: (sectionId: string) => void;
}

export default function Footer({ onLinkClick }: FooterProps) {
  const currentYear = 2026;

  const [socials, setSocials] = useState({
    instagram: "",
    youtube: "",
    twitter: "",
    facebook: "",
    tiktok: "",
  });

  const [contacts, setContacts] = useState({
    email: "cardosofrancisco17g@gmail.com",
    phone: "975 221 805",
  });

  const loadSocialsAndContacts = () => {
    setSocials({
      instagram: localStorage.getItem("universo_social_instagram") || "",
      youtube: localStorage.getItem("universo_social_youtube") || "",
      twitter: localStorage.getItem("universo_social_twitter") || "",
      facebook: localStorage.getItem("universo_social_facebook") || "",
      tiktok: localStorage.getItem("universo_social_tiktok") || "",
    });
    setContacts({
      email: localStorage.getItem("universo_contact_email") || "cardosofrancisco17g@gmail.com",
      phone: localStorage.getItem("universo_contact_phone") || "975 221 805",
    });
  };

  useEffect(() => {
    loadSocialsAndContacts();
    window.addEventListener("universo-social-updated", loadSocialsAndContacts);
    return () => {
      window.removeEventListener("universo-social-updated", loadSocialsAndContacts);
    };
  }, []);

  const formatSocialLink = (platform: string, value: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    const clean = trimmed.replace("@", "");
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${clean}`;
      case "youtube":
        return `https://youtube.com/${trimmed.startsWith("@") ? trimmed : "@" + trimmed}`;
      case "twitter":
        return `https://twitter.com/${clean}`;
      case "facebook":
        return `https://facebook.com/${clean}`;
      case "tiktok":
        return `https://tiktok.com/@${clean}`;
      default:
        return "#";
    }
  };

  const hasAnySocial = Object.values(socials).some((v) => !!v);

  const quickLinks = [
    { id: "inicio", label: "Página Inicial" },
    { id: "livros", label: "Biblioteca de Manuais" },
  ];

  return (
    <footer id="app-footer" className="bg-[#020617] text-slate-400 border-t border-white/5 pt-20 pb-12 relative overflow-hidden">
      {/* Decorative ambient radial reflection */}
      <div className="absolute left-1/2 bottom-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Col 1: Bio */}
          <div className="md:col-span-5 text-left">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-[#020617] shadow-lg shadow-sky-500/20">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <span className="font-display font-black text-lg text-white tracking-tight">
                Universo CF
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Um espaço onde a imaginação encontra a inovação, permitindo que novas ganhem vida e sejam compartilhadas com o mundo.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 text-left">
            <h4 className="font-display font-bold text-sm text-white tracking-tight mb-4">
              Explorar
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onLinkClick("apps")}
                  className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Aplicativos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onLinkClick("books")}
                  className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Livros
                </button>
              </li>
              <li>
                <button
                  onClick={() => onLinkClick("music")}
                  className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Músicas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onLinkClick("outros")}
                  className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Outros Projetos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div className="md:col-span-4 text-left">
            <h4 className="font-display font-bold text-sm text-white tracking-tight mb-4">
              Conectar
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onLinkClick("contacto")}
                  className="text-slate-400 hover:text-sky-400 font-medium transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Fale Connosco (Contacto)
                </button>
              </li>
              <li>
                <a href={`mailto:${contacts.email}`} className="hover:text-sky-400 transition-colors">
                  {contacts.email}
                </a>
              </li>
              <li>
                <a href={`tel:${contacts.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-sky-400 transition-colors">
                  {contacts.phone}
                </a>
              </li>
            </ul>

            {hasAnySocial && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h5 className="font-display font-bold text-xs text-white tracking-tight mb-3">
                  Redes Sociais
                </h5>
                <div className="flex flex-wrap gap-2.5">
                  {socials.instagram && (
                    <a
                      href={formatSocialLink("instagram", socials.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/5 hover:border-sky-500/20 text-slate-400 transition-all"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {socials.youtube && (
                    <a
                      href={formatSocialLink("youtube", socials.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/5 hover:border-sky-500/20 text-slate-400 transition-all"
                      title="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {socials.twitter && (
                    <a
                      href={formatSocialLink("twitter", socials.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/5 hover:border-sky-500/20 text-slate-400 transition-all"
                      title="Twitter / X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {socials.facebook && (
                    <a
                      href={formatSocialLink("facebook", socials.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/5 hover:border-sky-500/20 text-slate-400 transition-all"
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {socials.tiktok && (
                    <a
                      href={formatSocialLink("tiktok", socials.tiktok)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/5 hover:border-sky-500/20 text-slate-400 transition-all text-xs font-mono font-bold flex items-center justify-center w-8 h-8"
                      title="TikTok"
                    >
                      <span>TT</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Bottom Block */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
          
          {/* Logo brand copyrights */}
          <div className="text-center sm:text-left">
            © {currentYear} Universo CF — Cardoso Francisco. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onLinkClick("privacidade")}
              className="hover:text-sky-400 transition-colors cursor-pointer text-left focus:outline-none"
            >
              Privacidade
            </button>
            <button
              onClick={() => onLinkClick("termos")}
              className="hover:text-sky-400 transition-colors cursor-pointer text-left focus:outline-none"
            >
              Termos
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}

