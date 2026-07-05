import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfUse from "./components/TermsOfUse";
import AdminModal from "./components/AdminModal";
import PillarView from "./components/PillarView";

type AppView = "home" | "privacy" | "terms" | "apps" | "books" | "music" | "outros";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check for secret query parameter on mount and listen to hash changes to open administration panel
  useEffect(() => {
    const checkHashAndParams = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("portal") === "cardoso" || window.location.hash === "#admin") {
        setIsAdminOpen(true);
      }
    };

    // Run on initial load
    checkHashAndParams();

    // Listen to hash changes in real time so pasting it works immediately
    window.addEventListener("hashchange", checkHashAndParams);
    return () => {
      window.removeEventListener("hashchange", checkHashAndParams);
    };
  }, []);

  // Smooth scroll helper or view changer
  const scrollToSection = (sectionId: string) => {
    if (sectionId === "admin") {
      setIsAdminOpen(true);
      return;
    }

    if (sectionId === "contacto") {
      setIsContactOpen(true);
      return;
    }

    if (sectionId === "privacidade") {
      setCurrentView("privacy");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    if (sectionId === "termos") {
      setCurrentView("terms");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (sectionId === "apps" || sectionId === "books" || sectionId === "livros" || sectionId === "music" || sectionId === "outros") {
      const viewMap: Record<string, AppView> = {
        apps: "apps",
        books: "books",
        livros: "books",
        music: "music",
        outros: "outros"
      };
      setCurrentView(viewMap[sectionId]);
      setActiveSection(sectionId === "livros" ? "books" : sectionId);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (sectionId === "inicio") {
      setCurrentView("home");
      setActiveSection("inicio");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If we are not on home, go back first, then scroll
    if (currentView !== "home") {
      setCurrentView("home");
      setTimeout(() => {
        executeScroll(sectionId);
      }, 100);
    } else {
      executeScroll(sectionId);
    }
  };

  const executeScroll = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Resolve DOM element ID
    let targetId = sectionId;
    if (sectionId === "apps") targetId = "hero-pillar-apps";
    else if (sectionId === "books") targetId = "hero-pillar-books";
    else if (sectionId === "music") targetId = "hero-pillar-music";
    
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 100; // height of sticky navbar + offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Programmatically click the card to trigger the information toast
      if (sectionId === "apps" || sectionId === "books" || sectionId === "music") {
        setTimeout(() => {
          element.click();
        }, 400);
      }
    } else {
      // If we clicked "outros" or target is not found, scroll to top/home
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      
      if (sectionId === "outros") {
        setTimeout(() => {
          const event = new CustomEvent("universo-trigger-toast", { detail: { type: "outros" } });
          window.dispatchEvent(event);
        }, 400);
      }
    }
  };

  // Scroll Spying using IntersectionObserver for active page sections
  useEffect(() => {
    const sections = ["inicio"];
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -60% 0px", // Trigger when in viewport reading area
      threshold: 0
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div id="universo-cf-app" className="min-h-screen bg-[#020617] flex flex-col justify-between selection:bg-sky-500/10 selection:text-sky-400">
      {/* Sticky Top-level navigation with the modal click handlers */}
      <Navbar
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onContactClick={() => setIsContactOpen(true)}
      />

      {/* Main content flow */}
      <main id="universo-main-content" className="flex-grow">
        {currentView === "privacy" ? (
          <PrivacyPolicy onBackToHome={() => scrollToSection("inicio")} />
        ) : currentView === "terms" ? (
          <TermsOfUse onBackToHome={() => scrollToSection("inicio")} />
        ) : currentView === "apps" || currentView === "books" || currentView === "music" || currentView === "outros" ? (
          <PillarView category={currentView} onBack={() => scrollToSection("inicio")} />
        ) : (
          /* ID 'inicio': Dynamic Hero & Mission Section */
          <Hero onExplore={scrollToSection} />
        )}
      </main>

      {/* Contact Form rendered as a spectacular Modal overlay */}
      <ContactSection isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Admin Portal Modal */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Bottom Level footer */}
      <Footer onLinkClick={scrollToSection} />
    </div>
  );
}
