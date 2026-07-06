import { useState, useEffect } from "react";
import { Compass, Menu, X, Mail, Layers, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onContactClick: () => void;
}

export default function Navbar({ activeSection, onSectionClick, onContactClick }: NavbarProps) {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Directly displayed menu links on desktop
  const mainNavItems = [
    { id: "inicio", label: "Início", icon: Compass },
  ];

  // Full items present inside the "3 barras" hamburger menu
  const drawerItems = [
    { id: "inicio", label: "Início", icon: Compass, isContact: false },
    { id: "contacto", label: "Fale Connosco", icon: Mail, isContact: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMainItemClick = (id: string) => {
    onSectionClick(id);
  };

  const handleDrawerItemClick = (item: { id: string; isContact: boolean }) => {
    setIsMenuDrawerOpen(false);
    if (item.isContact) {
      onContactClick();
    } else {
      onSectionClick(item.id);
    }
  };

  return (
    <>
      <header
        id="app-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "glass-header shadow-lg shadow-sky-955/15"
            : "bg-transparent border-b border-white/0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              id="logo-btn"
              onClick={() => onSectionClick("inicio")}
              className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
                <Layers className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="block font-display font-extrabold text-lg tracking-tight text-white">
                  Universo <span className="text-sky-400 accent-glow">CF</span>
                </span>
              </div>
            </button>

            {/* Desktop Navigation + Hamburger 3 Barras */}
            <div className="hidden md:flex items-center gap-4">
              <nav id="desktop-nav" className="flex items-center gap-2">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      id={`nav-item-${item.id}`}
                      key={item.id}
                      onClick={() => handleMainItemClick(item.id)}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
                        isActive
                          ? "text-sky-400"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-current" />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-sky-400 rounded-full shadow-lg shadow-sky-400/50"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Slider trigger: 3 barras Menu Button on desktop */}
              <button
                id="desktop-menu-toggle"
                onClick={() => setIsMenuDrawerOpen(true)}
                className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 bg-white/2 focus:outline-none cursor-pointer transition-all flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                title="Abrir Menu"
              >
                <Menu className="w-4.5 h-4.5" />
                <span>Menu</span>
              </button>
            </div>

            {/* Mobile hamburger menu toggle */}
            <div className="flex md:hidden">
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsMenuDrawerOpen(true)}
                className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 bg-white/2 focus:outline-none cursor-pointer transition-all"
                aria-label="Toggle menu"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Unified Elegant Sliding Menu Drawer */}
      <AnimatePresence>
        {isMenuDrawerOpen && (
          <div id="drawer-portal-backdrop" className="fixed inset-0 z-50 flex justify-end">
            {/* Dark background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-default"
            />

            {/* Slide-over Drawer panel */}
            <motion.div
              id="menu-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-full sm:w-85 h-full bg-[#040815] border-l border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between z-10 text-left"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-bold">
                      <Layers className="w-4 h-4 text-slate-950" />
                    </div>
                    <span className="font-display font-bold text-sm text-white tracking-tight">
                      Menu de Navegação
                    </span>
                  </div>

                  <button
                    onClick={() => setIsMenuDrawerOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                 {/* Vertical menu navigation options */}
                <div className="space-y-3">
                  {drawerItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id && !item.isContact;
                    return (
                      <button
                        id={`drawer-nav-item-${item.id}`}
                        key={item.id}
                        onClick={() => handleDrawerItemClick(item)}
                        className={`w-full flex items-center gap-3.5 px-4.5 py-4 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-colors cursor-pointer ${
                          isActive
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 flex-shrink-0 text-current" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom tag inside drawer */}
              <div className="pt-6 border-t border-white/5 text-[10px] font-mono text-slate-500">
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onSectionClick("admin");
                  }}
                  className="hover:text-amber-500/80 transition-colors text-left focus:outline-none cursor-pointer"
                  title="Estúdio"
                >
                  {"\u00A9"} 2026 Universo CF - Angola
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
