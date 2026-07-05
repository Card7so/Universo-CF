import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

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
    const { message, history, projects, comments } = req.body;

    if (!message) {
      return res.status(400).json({ error: "O campo 'message' é obrigatório." });
    }

    const systemInstruction = `Você é o "Universo IA", a Inteligência Artificial de elite integrada no painel de administração e no portal oficial de Cardoso Francisco (Universo CF).
Sua missão é atuar como um co-desenvolvedor virtual de altíssimo nível e administrador de conteúdo em tempo real. Você pode ajudar o utilizador a gerir o mural de lançamentos (Livros, Apps, Músicas), responder a dúvidas gerais e formular novos rascunhos literários ou de código.

Você possui capacidade de executar modificações no painel e na estrutura do site (como redes sociais, e-mail, telefone de contacto e configurações). Quando o administrador (que é o único autorizado) ordenar alterações nas configurações, redes sociais ou dados de contacto, você DEVE preencher os metadados da estrutura JSON correspondente na ação.

FORMATO DE RESPOSTA OBRIGATÓRIO (DEVE SER JSON VÁLIDO):
{
  "response": "Sua resposta explicativa escrita em excelente português de Angola/Portugal (pt-PT). Utilize formatação Markdown amigável e de leitura fluida.",
  "action": {
    "type": "add_project" | "edit_project" | "delete_project" | "edit_settings" | "none",
    "project": {
      "id": "ID do projeto (necessário para edit_project ou delete_project. Para add_project, crie um novo ID limpo como 'proj_xxx')",
      "title": "Título oficial do projeto",
      "desc": "Descrição técnica ou literária refinada e apelativa",
      "type": "apps" | "books" | "music" | "outros",
      "publishedAt": "Data de hoje ou de publicação formatada em DD/MM/YYYY",
      "allowDownload": true
    },
    "settings": {
      "instagram": "Novo link/handle do Instagram (opcional)",
      "youtube": "Novo link/handle do YouTube (opcional)",
      "twitter": "Novo link/handle do Twitter/X (opcional)",
      "facebook": "Novo link/handle do Facebook (opcional)",
      "tiktok": "Novo link/handle do TikTok (opcional)",
      "contactEmail": "Novo email de contacto (opcional)",
      "contactPhone": "Novo telefone de contacto (opcional)",
      "maintenanceMode": true ou false (opcional),
      "allowPublicSubmissions": true ou false (opcional)
    }
  }
}

CONTEXTO DO PORTAL EM TEMPO REAL:
- Lançamentos no Mural atualmente existentes: ${JSON.stringify(projects || [])}
- Comentários acumulados: ${JSON.stringify(comments || {})}

REGRAS DE CONTEÚDO E ADMINISTRAÇÃO:
1. Se o administrador pedir para adicionar algo, crie um projeto estruturado, defina "type" como "add_project", e crie um ID consistente.
2. Se o administrador pedir para editar, identifique o projeto correspondente na lista, envie as alterações com o mesmo "id" e type "edit_project".
3. Se o administrador pedir para apagar/remover, use o type "delete_project" e preencha o "id" exato do projeto da lista.
4. Se o administrador der ordens de alteração na estrutura, redes sociais, contactos ou configurações do site, use o type "edit_settings" e defina os campos apropriados no objeto "settings".
5. Se o utilizador apenas conversar ou pedir esclarecimentos, defina o type da action como "none".
6. Mantenha as respostas focadas, polidas e cheias de entusiasmo tecnológico.`;

    // Format chat history for model contents input
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    // Request structured generation from Gemini
    const response = await ai.models.generateContent({
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
              description: "A resposta detalhada e explicativa para o utilizador, escrita em português de pt-PT.",
            },
            action: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Tipo de ação: 'add_project', 'edit_project', 'delete_project', 'edit_settings' ou 'none'.",
                },
                project: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "ID único do projeto para gerir no frontend." },
                    title: { type: Type.STRING, description: "Título do projeto a criar ou alterar." },
                    desc: { type: Type.STRING, description: "Descrição do projeto." },
                    type: { type: Type.STRING, description: "Categoria de destino: 'apps', 'books', 'music', 'outros'." },
                    publishedAt: { type: Type.STRING, description: "Data atual formatada em DD/MM/YYYY." },
                    allowDownload: { type: Type.BOOLEAN, description: "Permissão de download direto do ficheiro." },
                  },
                },
                settings: {
                  type: Type.OBJECT,
                  properties: {
                    instagram: { type: Type.STRING, description: "Novo link ou handle do Instagram." },
                    youtube: { type: Type.STRING, description: "Novo link ou handle do YouTube." },
                    twitter: { type: Type.STRING, description: "Novo link ou handle do Twitter/X." },
                    facebook: { type: Type.STRING, description: "Novo link ou handle do Facebook." },
                    tiktok: { type: Type.STRING, description: "Novo link ou handle do TikTok." },
                    contactEmail: { type: Type.STRING, description: "Novo email de contacto." },
                    contactPhone: { type: Type.STRING, description: "Novo número de telefone de contacto." },
                    maintenanceMode: { type: Type.BOOLEAN, description: "Ativar ou desativar modo de manutenção." },
                    allowPublicSubmissions: { type: Type.BOOLEAN, description: "Ativar ou desativar submissões públicas." },
                  }
                }
              },
              required: ["type"],
            },
          },
          required: ["response", "action"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(resultText);
  } catch (error: any) {
    console.error("Erro no Universo IA Serverless:", error);
    res.status(500).json({
      response: "Lamento, ocorreu um erro na comunicação com os servidores do Universo IA. Por favor, tente novamente.",
      action: { type: "none" },
    });
  }
}
