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
    // Se o cliente forneceu uma chave válida, vamos dar preferência absoluta para ela, evitando usar a chave global/partilhada com limites de quota excedidos!
    if (clientApiKey && clientApiKey.startsWith("AIzaSy")) {
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

      // Request generation
      let response;
      try {
        response = await withTimeout(
          aiInstance.models.generateContent({
            model: "gemini-3.5-flash",
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
          "O modelo Gemini demorou demasiado tempo a responder (Limite de 25s esgotado)."
        );
      } catch (genErr: any) {
        console.error("Erro na geração do Gemini:", genErr);
        const errMessage = genErr.message || String(genErr);
        
        let userAdvice = "⚠️ **Erro ao comunicar com a API do Gemini**.\n\n";
        if (
          errMessage.includes("API key") || 
          errMessage.includes("API_KEY_INVALID") || 
          errMessage.includes("Key not valid") || 
          errMessage.includes("INVALID_ARGUMENT") ||
          errMessage.includes("not found") ||
          errMessage.includes("unauthorized")
        ) {
          userAdvice += "O erro indica que a **sua Chave de API do Gemini (GEMINI_API_KEY) é inválida, não foi encontrada ou expirou**.\n\n" +
            "**Se adicionou a variável no Vercel:**\n" +
            "1. Verifique se o nome da chave é exatamente **`GEMINI_API_KEY`** (em maiúsculas).\n" +
            "2. **SUPER IMPORTANTE:** O Vercel **NÃO** atualiza as variáveis de ambiente em deploys que já estão a correr! Deves fazer um **Redeploy** para aplicar as alterações:\n" +
            "   - Vai ao painel do Vercel, acede ao separador **Deployments**.\n" +
            "   - Clica nos três pontinhos (`...`) ao lado do teu último deploy e seleciona **Redeploy**.\n" +
            "   - Aguarda 1-2 minutos até que o novo deploy termine.\n\n" +
            "**Como alternativa imediata grátis:**\n" +
            "Podes obter uma chave grátis em **aistudio.google.com** e colá-la diretamente no navegador clicando no ícone de chave (🔑) no topo deste chat! Desta forma podes continuar a usar a IA instantaneamente.";
        } else if (errMessage.includes("quota") || errMessage.includes("429") || errMessage.includes("RESOURCE_EXHAUSTED")) {
          userAdvice += "O limite de quota da sua chave de API do Gemini foi excedido (Erro 429: Resource Exhausted).\n\n" +
            "Se estiver a usar a versão gratuita do Gemini, por favor aguarde 1 minuto para que a sua quota seja restabelecida ou utilize uma chave diferente clicando no ícone de chave (🔑) no topo deste chat.";
        } else {
          userAdvice += `Detalhes técnicos do erro:\n\`\`\`\n${errMessage}\n\`\`\`\n\nPor favor, verifica as tuas chaves ou tenta novamente dentro de instantes.`;
        }

        return res.status(200).json({
          response: userAdvice,
          action: { type: "none" },
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
