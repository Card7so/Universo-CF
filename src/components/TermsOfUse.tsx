import { motion } from "motion/react";
import { ArrowLeft, FileText, CheckCircle2, ShieldAlert, Scale, HelpingHand } from "lucide-react";

interface TermsOfUseProps {
  onBackToHome: () => void;
}

export default function TermsOfUse({ onBackToHome }: TermsOfUseProps) {
  // Automatically scroll to top on mount
  useStateScrollToTop();

  return (
    <div className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col justify-start">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full text-left">
        {/* Navigation / Back Button */}
        <motion.button
          onClick={onBackToHome}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Voltar para a página inicial
        </motion.button>

        {/* Title Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-b border-white/10 pb-8 mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-500">
              Contrato de Utilização
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            Termos de Uso
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono mt-3">
            Última atualização: 25 de Junho de 2026 • Universo CF
          </p>
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-10 text-slate-300 text-sm sm:text-base leading-relaxed font-sans"
        >
          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-amber-500 stroke-[2.25]" />
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao aceder e utilizar o website <strong>Universo CF</strong>, concorda em cumprir e vincular-se aos seguintes termos e condições de uso. Se não concordar com qualquer parte destes termos, solicitamos que não utilize a nossa plataforma de portefólio criativo e de divulgação de projetos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-500 stroke-[2.25]" />
              2. Propriedade Intelectual e Direitos de Autor
            </h2>
            <p>
              Todos os conteúdos presentes neste ecossistema, incluindo mas não se limitando a marcas, logótipos, textos explicativos, designs gráficos, imagens, ilustrações técnicas, códigos de software em demonstração, livros de ficção, manuais educacionais e composições ou loops musicais, são da autoria exclusiva de <strong>Cardoso Francisco</strong> ou foram devidamente licenciados para uso na plataforma.
            </p>
            <p className="bg-white/2 border-l-2 border-amber-500 p-4 rounded-r-xl italic text-xs sm:text-sm text-slate-400">
              "Fica expressamente proibido reproduzir, modificar, distribuir, vender, licenciar ou utilizar para fins comerciais qualquer elemento ou criação do Universo CF sem a autorização prévia por escrito do autor Cardoso Francisco."
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 stroke-[2.25]" />
              3. Isenção e Limitação de Responsabilidade
            </h2>
            <p>
              Este website serve propósitos principalmente expositivos e artísticos para divulgar criações nas áreas de tecnologia, literatura e música. 
            </p>
            <ul className="space-y-3 pl-4 border-l border-white/5 mt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Informações e Manuais:</strong> O material contido nos nossos manuais ou demonstrações de aplicativos destina-se apenas a fins educativos e informativos de caráter geral.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Disponibilidade:</strong> Embora trabalhemos para manter o ecossistema ativo e estável, o Universo CF não garante que a plataforma funcione de forma totalmente ininterrupta, livre de erros ou bugs de sistema de terceiros.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <HelpingHand className="w-5 h-5 text-amber-500 stroke-[2.25]" />
              4. Conduta do Utilizador
            </h2>
            <p>
              Ao utilizar este website e os formulários ou ligações fornecidas, compromete-se a:
            </p>
            <ul className="space-y-2 pl-5 list-disc text-slate-400">
              <li>Não utilizar identidades falsas ou tentar induzir terceiros em erro;</li>
              <li>Não introduzir quaisquer ficheiros corrompidos ou softwares maliciosos que possam danificar as operações da plataforma;</li>
              <li>Não efetuar recolha sistemática de dados automatizada (web scraping, etc.) sem o nosso consentimento;</li>
              <li>Respeitar os canais oficiais para comunicações construtivas e profissionais.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-amber-500 stroke-[2.25]" />
              5. Modificação dos Termos
            </h2>
            <p>
              Reservamo-nos o direito de alterar ou atualizar estes termos de uso a qualquer momento, sem aviso prévio. A data da revisão mais recente estará sempre claramente visível no topo deste documento. Ao continuar a usar o website após as alterações, concorda em aceitar as revisões atualizadas.
            </p>
            <p>
              Para esclarecer qualquer dúvida em relação aos nossos termos de uso, por favor envie-nos uma mensagem para <a href="mailto:cardosofrancisco17g@gmail.com" className="text-amber-500 hover:underline">cardosofrancisco17g@gmail.com</a>.
            </p>
          </section>
        </motion.div>

        {/* Footer Navigation / Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-t border-white/10 mt-16 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="text-xs text-slate-500 font-mono text-center sm:text-left">
            {"\u00A9"} 2026 Universo CF - Todos os direitos reservados.
          </div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white transition-all focus:outline-none cursor-pointer hover:border-amber-500/30"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            Voltar para o Início
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// React Custom hook helper for scrolling to top when view changes
import { useEffect } from "react";
function useStateScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}
