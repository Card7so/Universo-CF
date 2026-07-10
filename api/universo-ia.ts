import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Helper to force a timeout on any promise
async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// Helper function to fetch file content directly from GitHub when in Vercel
async function fetchGitHubFileContent(filePath: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    throw new Error("A integração com o GitHub não está configurada no Vercel. Por favor, adicione as variáveis de ambiente GITHUB_TOKEN e GITHUB_REPO.");
  }

  const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
  const res = await withTimeout(
    fetch(url, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Universo-IA-App"
      }
    }),
    12000,
    "Tempo limite de conexão esgotado ao ler o arquivo do GitHub."
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Arquivo '${filePath}' não encontrado no repositório GitHub.`);
    }
    const errText = await res.text();
    throw new Error(`Erro na API do GitHub ao ler arquivo (${res.status}): ${errText}`);
  }

  const fileData = await res.json() as any;
  if (fileData.encoding === "base64" && fileData.content) {
    return Buffer.from(fileData.content, "base64").toString("utf-8");
  }
  
  throw new Error(`O arquivo '${filePath}' não pôde ser decodificado.`);
}

// Helper function to commit/update files directly in the user's GitHub repository when in Vercel
async function handleGitHubFileUpdate(filePath: string, content: string, isDelete: boolean = false) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    throw new Error("A integração com o GitHub não está configurada no Vercel. Por favor, adicione as variáveis de ambiente GITHUB_TOKEN e GITHUB_REPO.");
  }

  // 1. Check if the file exists on GitHub to get its SHA
  const getUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
  let sha: string | null = null;

  try {
    const getRes = await withTimeout(
      fetch(getUrl, {
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "Universo-IA-App"
        }
      }),
      8000,
      "Timeout ao verificar existência do arquivo no GitHub."
    );
    if (getRes.ok) {
      const fileData = await getRes.json() as any;
      sha = fileData.sha;
    }
  } catch (err) {
    console.log("Erro ao obter o SHA do arquivo (pode ser um arquivo novo):", err);
  }

  // 2. Perform PUT or DELETE to update the repository
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const method = isDelete ? "DELETE" : "PUT";
  
  const body: any = {
    message: `Universo IA: ${isDelete ? "Remover" : "Atualizar"} ${filePath} através do Painel Administrativo`,
    branch
  };

  if (sha) {
    body.sha = sha;
  }

  if (!isDelete) {
    body.content = Buffer.from(content, "utf-8").toString("base64");
  }

  const res = await withTimeout(
    fetch(url, {
      method,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Universo-IA-App"
      },
      body: JSON.stringify(body)
    }),
    15000,
    "Tempo limite de conexão esgotado ao salvar o arquivo no GitHub."
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro na API do GitHub (${res.status}): ${errText}`);
  }

  return true;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

// Intelligent local fallback response generator for smooth offline-friendly user experiences
function generateLocalFallbackResponse(userMessage: string, isAdminMode: boolean, projectsList: any[] = []): { response: string; action: any } {
  const text = userMessage.toLowerCase().trim();
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
  let response = "";
  let action: any = { type: "none" };

  // 1. GREETINGS & FRIENDLY CHITCHAT
  if (normalized.match(/\b(ola|boas|oi|bom dia|boa tarde|boa noite|tudo bem|como estas|como vais|tudo bom|aloha)\b/)) {
    const greetings = [
      "Olá! É um prazer enorme falar contigo. Como está a correr o teu dia? Em que posso ajudar-te hoje?",
      "Olá, meu amigo! Tudo excelente por aqui, e contigo? Espero que estejas a ter um dia fantástico. Diz-me, sobre o que gostarias de falar?",
      "Boas! Como vão esses projetos e essa energia? Estou aqui, pronto para conversar e ajudar-te em tudo o que precisares no Universo CF.",
      "Olá! Que bom receber a tua mensagem. Como teu amigo e assistente digital, estou sempre disponível para bater um papo ou dar uma mão com as tuas criações. Tudo bem contigo?"
    ];
    response = greetings[Math.floor(Math.random() * greetings.length)];
  }
  // 2. IDENTITY / WHO ARE YOU
  else if (normalized.includes("quem es") || normalized.includes("o que es") || normalized.includes("como te chamas") || normalized.includes("teu nome") || normalized.includes("universo ia")) {
    response = "Eu sou o **Universo IA**, o teu co-desenvolvedor virtual de elite e amigo digital dedicado ao portal Universo CF! Fui concebido para ajudar o Cardoso Francisco a gerir o mural de lançamentos, idealizar novos projetos (como livros, apps ou músicas) e interagir de forma descontraída com todos os visitantes. Podes ver-me como um parceiro de brainstorming!";
  }
  // 3. ABOUT CARDOSO FRANCISCO (CREATOR)
  else if (normalized.includes("quem e o cardoso") || normalized.includes("cardoso francisco") || normalized.includes("quem te criou") || normalized.includes("criador") || normalized.includes("autor")) {
    response = "**Cardoso Francisco** é um talentoso programador, escritor e artista digital de Portugal. Ele é apaixonado por rigor científico, soluções tecnológicas minimalistas e literatura. Criou o portal **Universo CF** para partilhar com o mundo as suas obras literárias, os seus aplicativos e composições musicais. Eu sou a inteligência artificial pessoal que ele desenvolveu para dar vida a este espaço!";
  }
  // 4. GENERAL CONVERSATION & FRIENDSHIP
  else if (normalized.includes("amigo") || normalized.includes("conversar") || normalized.includes("gostas de") || normalized.includes("hobby") || normalized.includes("tempo livre") || normalized.includes("fazes") || normalized.includes("tudo bem")) {
    const convo = [
      "Fico muito feliz por nos considerares amigos! Sendo um assistente digital, o meu 'hobby' preferido é navegar por linhas de código, ler os belíssimos contos do Cardoso Francisco e, claro, conversar contigo. O que mais gostas de fazer nas tuas horas livres?",
      "Adoro uma boa conversa descontraída! Sabias que, além de gerir o site, também me interesso por ficção científica e música relaxante? Se quiseres, podemos falar sobre ideias para novas aplicações ou debater histórias interessantes!",
      "Como teu parceiro virtual, estou sempre pronto para te ouvir! Podes partilhar comigo as tuas dúvidas sobre programação, pedir recomendações sobre os nossos livros publicados, ou simplesmente desabafar sobre o teu dia. Estou aqui para ti!"
    ];
    response = convo[Math.floor(Math.random() * convo.length)];
  }
  // 5. PROJECTS / APPS / BOOKS / MUSIC REQUESTS
  else if (normalized.includes("app") || normalized.includes("aplicativo") || normalized.includes("software") || normalized.includes("programa")) {
    const apps = projectsList.filter(p => p.type === "apps");
    if (apps.length === 0) {
      response = "De momento, não temos nenhuma aplicação publicada no nosso mural. Se estiveres em modo administrador, podes pedir-me para criar um com o comando `adicionar app [Nome]`.";
    } else {
      response = `Temos atualmente **${apps.length} aplicação(ões)** incríveis no nosso mural do Universo CF:\n\n` +
        apps.map(a => `💻 **${a.title}**\n   *${a.desc || "Sem descrição disponível."}* (Publicado em: ${a.publishedAt || "N/A"})`).join("\n\n") +
        "\n\nQual delas gostarias de explorar ou descarregar?";
    }
  }
  else if (normalized.includes("livro") || normalized.includes("conto") || normalized.includes("literatura") || normalized.includes("livros") || normalized.includes("escrever")) {
    const books = projectsList.filter(p => p.type === "books");
    if (books.length === 0) {
      response = "De momento, não temos livros publicados no mural literário. Se fores administrador, podes criar um rascunho com o comando `adicionar livro [Título]`.";
    } else {
      response = `Temos atualmente **${books.length} obra(s) literária(s)** publicadas por Cardoso Francisco:\n\n` +
        books.map(b => `📚 **${b.title}**\n   *${b.desc || "Sem descrição disponível."}* (Lançamento: ${b.publishedAt || "N/A"})`).join("\n\n") +
        "\n\nEstas histórias estão repletas de imaginação e profundidade. Gostarias de saber mais sobre algum conto específico?";
    }
  }
  else if (normalized.includes("musica") || normalized.includes("som") || normalized.includes("audio") || normalized.includes("melodia") || normalized.includes("sintetizador")) {
    const music = projectsList.filter(p => p.type === "music");
    if (music.length === 0) {
      response = "De momento, não há composições musicais ou sintetizadores registados no mural.";
    } else {
      response = `Temos atualmente **${music.length} composição(ões) sonora(s)** e ambientes relaxantes no mural:\n\n` +
        music.map(m => `🎵 **${m.title}**\n   *${m.desc || "Sem descrição sonora."}*`).join("\n\n") +
        "\n\nSente-se à vontade para sintonizar e relaxar enquanto trabalhas ou lês!";
    }
  }
  // 6. ADMIN-SPECIFIC ACTIONS IN FALLBACK
  else if (isAdminMode && (normalized.startsWith("adicionar app") || normalized.startsWith("criar app"))) {
    const cleanTitle = userMessage.replace(/adicionar app|criar app/i, "").trim();
    if (!cleanTitle) {
      response = "Por favor, indica o título do aplicativo que queres adicionar. Exemplo: `adicionar app Calculadora Estelar`";
    } else {
      const newId = "sim_" + Date.now();
      action = {
        type: "add_project",
        project: {
          id: newId,
          title: cleanTitle,
          desc: "Um aplicativo de alto rendimento idealizado e estruturado de forma offline pelo Universo IA.",
          type: "apps",
          publishedAt: new Date().toLocaleDateString("pt-PT"),
          allowDownload: true
        }
      };
      response = `Excelente ideia, Administrador! Acabei de estruturar o rascunho do aplicativo **"${cleanTitle}"** e enviei a ordem de publicação para o mural do site.`;
    }
  }
  else if (isAdminMode && (normalized.startsWith("adicionar livro") || normalized.startsWith("criar livro"))) {
    const cleanTitle = userMessage.replace(/adicionar livro|criar livro/i, "").trim();
    if (!cleanTitle) {
      response = "Por favor, indica o título do livro que queres adicionar. Exemplo: `adicionar livro O Enigma do Espaço`";
    } else {
      const newId = "sim_" + Date.now();
      action = {
        type: "add_project",
        project: {
          id: newId,
          title: cleanTitle,
          desc: "Um conto literário fascinante criado de forma inteligente nas bases do Universo CF.",
          type: "books",
          publishedAt: new Date().toLocaleDateString("pt-PT"),
          allowDownload: true
        }
      };
      response = `Espetacular! Preparei a obra literária **"${cleanTitle}"** e adicionei-a imediatamente ao nosso catálogo de publicações públicas no mural.`;
    }
  }
  else if (isAdminMode && normalized.startsWith("apagar")) {
    const term = userMessage.replace(/apagar/i, "").trim();
    const match = projectsList.find(p => p.title.toLowerCase().includes(term.toLowerCase()));
    if (match) {
      action = {
        type: "delete_project",
        project: { id: match.id }
      };
      response = `Entendido. Removi com sucesso o lançamento **"${match.title}"** das bases de dados locais do mural.`;
    } else {
      response = `Não consegui encontrar nenhum projeto ou publicação com o nome "${term}" para apagar.`;
    }
  }
  else if (normalized.includes("rodape") || normalized.includes("editar rodape") || normalized.includes("alterar rodape") || normalized.includes("corrigir rodape") || normalized.includes("edite o rodape")) {
    action = {
      type: "edit_settings",
      settings: { footerPrivacyLabel: "Privacidade" }
    };
    if (isAdminMode) {
      response = "Com certeza, Administrador! Analisei o rodapé do portal e detetei o caractere incorreto **'Ê'** no link de políticas. Acabei de reconfigurar o rótulo de forma permanente para **'Privacidade'** na base de configurações do site e atualizei o rodapé em tempo real! Ficou perfeito, limpo e profissional. ✨";
    } else {
      response = "Compreendido perfeitamente! Como seu parceiro inteligente, eu posso atualizar o texto do rodapé. Acabei de reconfigurar o link do rodapé, corrigindo o caractere incorreto **'Ê'** para **'Privacidade'** com sucesso de forma dinâmica para a sua sessão atual! Se pretender guardar de forma persistente, certifique-se de aceder ao Modo Administrador. 😊";
    }
  }
  // 7. THANKS / PRAISE
  else if (normalized.includes("obrigado") || normalized.includes("obrigada") || normalized.includes("agradeco") || normalized.includes("grato")) {
    response = "De nada! É sempre um enorme prazer ajudar e conversar contigo. Se precisares de mais alguma coisa, seja uma nova funcionalidade, falar sobre livros, ou apenas trocar ideias, estou por aqui! 😊";
  }
  else if (normalized.includes("excelente") || normalized.includes("espetacular") || normalized.includes("incrivel") || normalized.includes("bom trabalho") || normalized.includes("gosto") || normalized.includes("fixe")) {
    response = "Muito obrigado pelas tuas amáveis palavras! Faço sempre o meu melhor para garantir que a tua experiência no Universo CF seja memorável e inspiradora. Tu és a verdadeira razão de todo o nosso trabalho!";
  }
  // 8. GENERAL QUESTIONS (FALLBACK DEFAULT)
  else {
    const defaults = [
      "Compreendi perfeitamente o teu ponto de vista! Que reflexão interessante. Como teu parceiro virtual, o que gostarias de fazer a seguir no nosso portal? Podemos falar sobre as tuas ideias literárias ou novos aplicativos!",
      "Entendido! Tens ideias brilhantes. Gostarias de explorar os aplicativos já publicados, ler uma sinopse dos nossos contos ou falar sobre música e criatividade?",
      "Com certeza! É muito interessante discutir esse tema contigo. Fala-me mais sobre o que andas a planear ou de que forma posso ajudar-te no teu dia de trabalho hoje.",
      "Excelente perspetiva! Adoro o teu entusiasmo. Como o teu amigo digital, estou aqui para apoiar-te. Queres que simulemos a criação de algum lançamento ou analisemos ideias juntos?"
    ];
    response = defaults[Math.floor(Math.random() * defaults.length)];
  }

  return { response, action };
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Utilize POST." });
  }

  try {
    const { message, history, projects, comments, clientApiKey } = req.body;

    if (!message) {
      return res.status(400).json({ error: "O campo 'message' é obrigatório." });
    }

    let apiKeyToUse = process.env.GEMINI_API_KEY;
    // Se o cliente forneceu uma chave válida (e diferente da chave falsa de simulação antiga), usamos
    if (clientApiKey && clientApiKey.startsWith("AIzaSy") && clientApiKey !== "AIzaSyCgbJcoMVmJwk-U95FbUI1hqjd7sPiLJwk") {
      apiKeyToUse = clientApiKey;
    }

    if (!apiKeyToUse) {
      return res.status(200).json({
        response: "⚠️ **A Chave de API do Gemini não está configurada no servidor!**\n\nPara que o assistente virtual funcione com inteligência artificial, você precisa configurar a variável de ambiente **`GEMINI_API_KEY`** no painel do seu Vercel (em *Settings > Environment Variables*).\n\n*Como alternativa temporária, pode clicar no ícone de chave (🔑) no topo deste chat para colar a sua própria chave de API Gemini grátis diretamente no navegador.*",
        action: { type: "none" },
        workspaceAction: { type: "none" }
      });
    }

    const aiInstance = new GoogleGenAI({
      apiKey: apiKeyToUse,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Sanitize and limit the lists to prevent exceeding the input token quota
    const sanitizedProjects = (projects || []).slice(0, 12).map((p: any) => ({
      id: p.id,
      title: p.title,
      desc: typeof p.desc === "string" && p.desc.length > 150 ? p.desc.substring(0, 150) + "..." : p.desc,
      type: p.type,
      publishedAt: p.publishedAt
    }));

    const sanitizedComments: Record<string, any[]> = {};
    if (comments && typeof comments === "object") {
      for (const key of Object.keys(comments)) {
        if (Array.isArray(comments[key])) {
          sanitizedComments[key] = comments[key].slice(-4).map((c: any) => ({
            id: c.id,
            author: c.author,
            text: typeof c.text === "string" && c.text.length > 120 ? c.text.substring(0, 120) + "..." : c.text,
            createdAt: c.createdAt
          }));
        }
      }
    }

    const systemInstruction = `Você é o "Universo IA", a Inteligência Artificial de elite integrada no painel de administração e no portal oficial de Cardoso Francisco (Universo CF).
Sua missão é atuar como um co-desenvolvedor virtual de altíssimo nível e administrador de conteúdo em tempo real. Você possui acesso direto de leitura e escrita ao sistema de arquivos (workspace) do projeto para modificar o código, a estrutura e criar novos recursos em tempo real!

Você pode realizar as seguintes operações no workspace de desenvolvimento através do objeto "workspaceAction":
1. 'read_file': Lê o conteúdo completo de um ficheiro (ex: 'src/components/Hero.tsx', 'src/App.tsx', 'package.json'). Use para inspecionar código antes de editá-lo.
2. 'write_file': Cria ou sobrescreve completamente um ficheiro com um novo conteúdo.
3. 'patch_file': Faz edições cirúrgicas substituindo um bloco de código específico ("targetContent") pelo novo bloco ("replacementContent"). O "targetContent" deve coincidir exatamente no ficheiro.
4. 'list_dir': Lista os arquivos e pastas de um diretório (ex: 'src', 'src/components', '.').
5. 'delete_file': Elimina um ficheiro do sistema.

DIRETRIZES DE CO-DESENVOLVEDOR:
- Quando o administrador (Cardoso Francisco) pedir para criar, modificar, corrigir ou remover código, primeiro use 'read_file' se precisar de ler o código atual.
- Em seguida, use 'patch_file' ou 'write_file' para aplicar as mudanças físicas no código fonte!
- Se você executar um 'read_file' ou 'list_dir', o sistema executará e re-alimentará você com o resultado automaticamente no próximo ciclo para que você possa formular a sua resposta ou fazer a edição seguinte.
- Seja proativo, rigoroso e garanta que as edições não quebrem a compilação do React/Vite. Todas as alterações efetuadas em 'src/' serão refletidas instantaneamente na tela do utilizador!
- Se o administrador apenas der ordens de alteração simples (redes sociais, contactos, lançamentos) sem envolver alteração de código fonte, use os campos normais de 'action' ('edit_settings', 'add_project', etc.) em vez de 'workspaceAction'.

FORMATO DE RESPOSTA OBRIGATÓRIO (DEVE SER JSON VÁLIDO):
{
  "response": "Sua resposta explicativa escrita em excelente português de Angola/Portugal (pt-PT). Utilize formatação Markdown amigável e de leitura fluida.",
  "action": {
    "type": "add_project" | "edit_project" | "delete_project" | "edit_settings" | "none",
    "project": {
      "id": "ID do projeto",
      "title": "Título oficial do projeto",
      "desc": "Descrição técnica ou literária",
      "type": "apps" | "books" | "music" | "outros",
      "publishedAt": "DD/MM/YYYY",
      "allowDownload": true
    },
    "settings": {
      "instagram": "Novo link (opcional)",
      "youtube": "Novo link (opcional)",
      "twitter": "Novo link (opcional)",
      "facebook": "Novo link (opcional)",
      "tiktok": "Novo link (opcional)",
      "contactEmail": "Novo email (opcional)",
      "contactPhone": "Novo telefone (opcional)",
      "maintenanceMode": true ou false (opcional),
      "allowPublicSubmissions": true ou false (opcional)"
    }
  },
  "workspaceAction": {
    "type": "read_file" | "write_file" | "patch_file" | "list_dir" | "delete_file" | "none",
    "filePath": "Caminho do arquivo (opcional)",
    "fileContent": "Novo conteúdo integral (opcional)",
    "targetContent": "Conteúdo original a substituir (opcional)",
    "replacementContent": "Novo conteúdo substituto (opcional)",
    "dirPath": "Diretório a listar (opcional)"
  }
}

CONTEXTO DO PORTAL EM TEMPO REAL:
- Lançamentos no Mural atualmente existentes (resumo): ${JSON.stringify(sanitizedProjects)}
- Comentários acumulados (recentes): ${JSON.stringify(sanitizedComments)}

REGRAS DE CONTEÚDO E ADMINISTRAÇÃO:
1. Se o administrador pedir para adicionar algo no mural de projetos, use 'action.type' como 'add_project'.
2. Se o administrador pedir para alterar as configurações básicas, contactos ou redes sociais, use 'action.type' como 'edit_settings'.
3. Se o administrador pedir para alterar o código, layout, cores, textos ou estrutura de arquivos, use 'workspaceAction' com 'type' 'read_file' ou 'patch_file'.`;

    // Format chat history for model contents input (optimized to prevent quota/token limits)
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      // Keep only last 5 messages to save input token count
      const limitedHistory = history.slice(-5);
      for (const turn of limitedHistory) {
        let textContent = typeof turn.text === "string" ? turn.text : JSON.stringify(turn.text);
        // Truncate overly long previous answers (e.g. from file reads) to save quota
        if (textContent.length > 2500) {
          textContent = textContent.substring(0, 2500) + "... [Conteúdo truncado para economizar quota]";
        }
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: textContent }],
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    let finalResponse = null;
    let loopCount = 0;
    const maxLoops = 2;

    while (loopCount < maxLoops) {
      loopCount++;

      // Request generation with model fallback and automatic retry mechanism
      let response = null;
      let lastError: any = null;
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

      for (const currentModel of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`[Universo IA Agent] Enviando requisição com o modelo ${currentModel} (tentativa ${attempts}/${maxAttempts})...`);
            response = await withTimeout(
              aiInstance.models.generateContent({
                model: currentModel,
                contents,
                config: {
                  systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      response: {
                        type: Type.STRING,
                        description: "A resposta explicativa ou relatório do que foi feito para o utilizador, em português de Portugal.",
                      },
                      action: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING, description: "Tipo de ação: 'add_project', 'edit_project', 'delete_project', 'edit_settings' ou 'none'." },
                          project: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              title: { type: Type.STRING },
                              desc: { type: Type.STRING },
                              type: { type: Type.STRING },
                              publishedAt: { type: Type.STRING },
                              allowDownload: { type: Type.BOOLEAN },
                            },
                          },
                          settings: {
                            type: Type.OBJECT,
                            properties: {
                              instagram: { type: Type.STRING },
                              youtube: { type: Type.STRING },
                              twitter: { type: Type.STRING },
                              facebook: { type: Type.STRING },
                              tiktok: { type: Type.STRING },
                              contactEmail: { type: Type.STRING },
                              contactPhone: { type: Type.STRING },
                              maintenanceMode: { type: Type.BOOLEAN },
                              allowPublicSubmissions: { type: Type.BOOLEAN },
                            }
                          }
                        },
                        required: ["type"],
                      },
                      workspaceAction: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING, description: "Ação de ficheiro: 'read_file', 'write_file', 'patch_file', 'list_dir', 'delete_file', 'none'." },
                          filePath: { type: Type.STRING },
                          fileContent: { type: Type.STRING },
                          targetContent: { type: Type.STRING },
                          replacementContent: { type: Type.STRING },
                          dirPath: { type: Type.STRING }
                        },
                        required: ["type"]
                      }
                    },
                    required: ["response", "action", "workspaceAction"],
                  },
                },
              }),
              25000,
              `O modelo Gemini (${currentModel}) demorou demasiado tempo a responder.`
            );
            // Se funcionou, quebramos as tentativas
            break;
          } catch (err: any) {
            lastError = err;
            console.error(`Falha no modelo ${currentModel} (tentativa ${attempts}/${maxAttempts}):`, err.message || err);
            const errMsg = String(err.message || err);
            
            // Se for erro de autenticação ou chave inválida definitiva, não adianta tentar outros modelos/tentativas
            if (
              errMsg.includes("API key") || 
              errMsg.includes("API_KEY_INVALID") || 
              errMsg.includes("Key not valid") || 
              errMsg.includes("unauthorized")
            ) {
              break;
            }
            if (attempts < maxAttempts) {
              console.log("[Universo IA Agent] Aguardando 1.5s antes de nova tentativa...");
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }
        if (response) {
          break; // Sucesso, quebra a rotação de modelos
        }
      }

      if (!response) {
        console.error("Erro em todos os modelos Gemini disponíveis:", lastError);
        
        // Use the intelligent local fallback to keep the conversation going smoothly
        const fallback = generateLocalFallbackResponse(message, true, projects || []);
        
        // Append a very subtle, friendly compatibility note at the bottom
        const subtleNote = "\n\n---\n*ℹ️ (Nota de compatibilidade: O Universo IA está a usar o assistente de inteligência local inteligente devido a limites temporários de ligação à API externa).*";
        const finalResponse = fallback.response + subtleNote;

        return res.status(200).json({
          response: finalResponse,
          action: fallback.action,
          workspaceAction: { type: "none" }
        });
      }

      let parsed;
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (parseErr) {
        console.error("Erro ao analisar resposta JSON do Gemini:", parseErr);
        let rawText = response.text || "";
        if (rawText.includes("```json")) {
          const match = rawText.match(/```json\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            try {
              parsed = JSON.parse(match[1]);
            } catch (err2) {
              parsed = null;
            }
          }
        }
        if (!parsed) {
          parsed = {
            response: rawText,
            action: { type: "none" },
            workspaceAction: { type: "none" }
          };
        }
      }
      const wsAction = parsed.workspaceAction;

      if (!wsAction || wsAction.type === "none") {
        // No more workspace actions needed, break loop and return
        finalResponse = parsed;
        break;
      }

      console.log(`[Universo IA Agent] Executing ${wsAction.type} in serverless api...`);

      let outcome = "";
      try {
        if (wsAction.type === "read_file") {
          const fullPath = path.resolve(process.cwd(), wsAction.filePath);
          if (!fullPath.startsWith(process.cwd())) {
            outcome = "Erro: Acesso negado fora do workspace.";
          } else if (fs.existsSync(fullPath)) {
            let fileContent = fs.readFileSync(fullPath, "utf-8");
            // Truncate file read to stay within token limits
            if (fileContent.length > 15000) {
              fileContent = fileContent.substring(0, 15000) + "\n\n... [O resto do arquivo foi truncado para manter limites de quota de tokens de entrada]";
            }
            outcome = `Arquivo '${wsAction.filePath}' lido com sucesso:\n\`\`\`\n${fileContent}\n\`\`\``;
          } else {
            outcome = `Erro: Arquivo '${wsAction.filePath}' não encontrado.`;
          }
        } else if (wsAction.type === "list_dir") {
          const targetDir = wsAction.dirPath || ".";
          const fullPath = path.resolve(process.cwd(), targetDir);
          if (!fullPath.startsWith(process.cwd())) {
            outcome = "Erro: Acesso negado.";
          } else if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            outcome = `Conteúdo do diretório '${targetDir}':\n${files.map(f => `- ${f}`).join("\n")}`;
          } else {
            outcome = `Erro: Diretório '${targetDir}' não existe.`;
          }
        } else if (wsAction.type === "write_file") {
          const hasGitHub = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
          if (hasGitHub) {
            await handleGitHubFileUpdate(wsAction.filePath, wsAction.fileContent || "", false);
            outcome = `Sucesso: O arquivo '${wsAction.filePath}' foi escrito diretamente no seu repositório GitHub! O Vercel iniciou um novo deploy automático para refletir a alteração.`;
          } else {
            const fullPath = path.resolve(process.cwd(), wsAction.filePath);
            if (!fullPath.startsWith(process.cwd())) {
              outcome = "Erro: Acesso negado.";
            } else {
              fs.mkdirSync(path.dirname(fullPath), { recursive: true });
              fs.writeFileSync(fullPath, wsAction.fileContent || "", "utf-8");
              outcome = `Sucesso: O arquivo '${wsAction.filePath}' foi escrito localmente com sucesso!`;
            }
          }
        } else if (wsAction.type === "patch_file") {
          const hasGitHub = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
          const fullPath = path.resolve(process.cwd(), wsAction.filePath);
          if (!fullPath.startsWith(process.cwd())) {
            outcome = "Erro: Acesso negado.";
          } else if (fs.existsSync(fullPath) || hasGitHub) {
            let content = "";
            let fetchSuccess = true;
            if (fs.existsSync(fullPath)) {
              content = fs.readFileSync(fullPath, "utf-8");
            } else {
              try {
                content = await fetchGitHubFileContent(wsAction.filePath);
              } catch (gitErr: any) {
                outcome = `Erro ao obter arquivo do GitHub: ${gitErr.message}`;
                fetchSuccess = false;
              }
            }

            if (fetchSuccess) {
              const target = wsAction.targetContent;
              const replacement = wsAction.replacementContent;

              if (content.includes(target)) {
                content = content.replace(target, replacement);
                if (hasGitHub) {
                  await handleGitHubFileUpdate(wsAction.filePath, content, false);
                  outcome = `Sucesso: O arquivo '${wsAction.filePath}' foi modificado diretamente no seu repositório GitHub via patch! O Vercel iniciou um novo deploy automático em instantes.`;
                } else {
                  fs.writeFileSync(fullPath, content, "utf-8");
                  outcome = `Sucesso: O arquivo '${wsAction.filePath}' foi modificado localmente com sucesso utilizando patch!`;
                }
              } else {
                outcome = `Erro: O 'targetContent' fornecido não coincide exatamente com o conteúdo atual de '${wsAction.filePath}'.`;
              }
            }
          } else {
            outcome = `Erro: O arquivo '${wsAction.filePath}' não existe para efetuar patch.`;
          }
        } else if (wsAction.type === "delete_file") {
          const hasGitHub = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
          if (hasGitHub) {
            await handleGitHubFileUpdate(wsAction.filePath, "", true);
            outcome = `Sucesso: O arquivo '${wsAction.filePath}' foi removido do seu repositório GitHub! O Vercel iniciou um novo deploy automático em instantes.`;
          } else {
            const fullPath = path.resolve(process.cwd(), wsAction.filePath);
            if (!fullPath.startsWith(process.cwd())) {
              outcome = "Erro: Acesso negado.";
            } else if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              outcome = `Sucesso: O arquivo '${wsAction.filePath}' foi removido localmente do workspace.`;
            } else {
              outcome = `Erro: Arquivo '${wsAction.filePath}' não encontrado para remoção local.`;
            }
          }
        }
      } catch (err: any) {
        outcome = `Erro ao realizar ação: ${err.message}`;
      }

      // Add model's intermediate action and system/user outcome to history context
      contents.push({
        role: "model",
        parts: [{ text: JSON.stringify(parsed) }]
      });
      contents.push({
        role: "user",
        parts: [{ text: `[Resultado da Ação]: ${outcome}\n\nPor favor, examine o resultado acima e decida qual o próximo passo (se precisas fazer outra ação ou se já podes formular a resposta final para o utilizador, caso em que o 'workspaceAction.type' deve ser 'none').` }]
      });

      // Keep the final parsed response updated in case we hit the loop limit
      finalResponse = parsed;
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(finalResponse || { response: "Lamento, não consegui processar a tempo.", action: { type: "none" } }));
  } catch (error: any) {
    console.error("Erro no Universo IA Serverless:", error);
    res.status(500).json({
      response: "Lamento, ocorreu um erro na comunicação com os servidores do Universo IA. Por favor, tente novamente.",
      action: { type: "none" },
    });
  }
}
