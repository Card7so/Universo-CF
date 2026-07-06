import { motion } from "motion/react";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export default function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  // Automatically scroll to top on mount
  useStateScrollToTop();

  return (
    <div className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col justify-start">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full text-left">
        {/* Navigation / Back Button */}
        <motion.button
          onClick={onBackToHome}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-sky-400 transition-colors focus:outline-none cursor-pointer mb-8"
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
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-sky-500">
              Segurança e Transparência
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            Política de Privacidade
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
              <Lock className="w-5 h-5 text-sky-400 stroke-[2.25]" />
              1. Introdução e Compromisso
            </h2>
            <p>
              No <strong>Universo CF</strong>, gerido por <strong>Cardoso Francisco</strong>, a sua privacidade é uma prioridade absoluta. Este documento explica de forma clara, simples e transparente como as suas informações são recolhidas, tratadas e salvaguardadas ao navegar e interagir no nosso ecossistema criativo.
            </p>
            <p>
              Ao utilizar o nosso website, concorda com as práticas descritas nesta política. Comprometemo-nos a nunca vender, partilhar ou utilizar indevidamente as suas informações pessoais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-sky-400 stroke-[2.25]" />
              2. Informações Que Recolhemos
            </h2>
            <p>
              Recolhemos apenas as informações estritamente necessárias para proporcionar uma experiência de contacto e interação de alta qualidade:
            </p>
            <ul className="space-y-3 pl-4 border-l border-white/5 mt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Dados do Formulário de Contacto:</strong> Quando nos envia uma mensagem, recolhemos o seu nome, endereço de e-mail e quaisquer informações fornecidas no corpo da mensagem.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Informações de Navegação:</strong> Podemos recolher dados técnicos anónimos (como endereço IP genérico, tipo de navegador, sistema operacional e páginas visitadas) para efeitos estatísticos e de otimização da plataforma.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-sky-400 stroke-[2.25]" />
              3. Finalidade do Tratamento de Dados
            </h2>
            <p>
              Todos os dados fornecidos voluntariamente por si são tratados estritamente para as seguintes finalidades:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                <h3 className="font-bold text-sm text-white mb-2">Comunicação Direta</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Responder de forma personalizada aos seus pedidos de esclarecimento, propostas, dúvidas ou comentários enviados através de e-mail ou do nosso formulário de contacto.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                <h3 className="font-bold text-sm text-white mb-2">Melhoria do Ecossistema</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analisar comportamentos de navegação gerais para melhorar o desempenho, a velocidade e a usabilidade dos nossos aplicativos, livros e músicas.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-sky-400 stroke-[2.25]" />
              4. Armazenamento e Segurança
            </h2>
            <p>
              Empregamos medidas técnicas e organizativas rigorosas para garantir a segurança dos seus dados. As comunicações são encriptadas de ponta a ponta utilizando o protocolo SSL/TLS.
            </p>
            <p>
              Apenas pessoal autorizado e sob compromisso de confidencialidade estrito tem acesso aos seus dados de contacto pessoais. No entanto, lembre-se de que nenhum método de transmissão pela Internet é 100% seguro, e embora envidemos todos os esforços, não podemos garantir segurança absoluta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-sky-400 stroke-[2.25]" />
              5. Os Seus Direitos
            </h2>
            <p>
              Tem o direito total de controlar os seus próprios dados pessoais. A qualquer momento, pode contactar-nos diretamente para:
            </p>
            <ul className="space-y-2 pl-5 list-disc text-slate-400">
              <li>Confirmar se estamos a tratar os seus dados pessoais;</li>
              <li>Solicitar uma cópia digital das suas informações guardadas;</li>
              <li>Pedir a correção imediata de dados imprecisos ou incompletos;</li>
              <li>Solicitar a eliminação total e permanente de todos os seus dados da nossa base de dados.</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer um destes direitos, basta enviar um e-mail para <a href="mailto:cardosofrancisco17g@gmail.com" className="text-sky-400 hover:underline">cardosofrancisco17g@gmail.com</a>. Responderemos ao seu pedido o mais brevemente possível.
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
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white transition-all focus:outline-none cursor-pointer hover:border-sky-500/30"
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
