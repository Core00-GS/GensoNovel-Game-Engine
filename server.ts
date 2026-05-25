/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Ensure clean environment variables
const PORT = 3000;

// Lazy initialization of the GoogleGenAI instance to prevent crash on boot if key is temporarily missing.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to Settings -> Secrets in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Endpoint: Use Gemini to generate a complete story matching our JSON schema!
  app.post("/api/gemini/generate-story", async (req, res) => {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Story prompt/theme is required!" });
      }

      console.log(`Starting story generation and planning for theme: "${prompt}"`);

      const client = getGeminiClient();

      const systemInstruction = `
You are an expert ACGN (Anime, Comic, Game, Novel) Light Novel Writer and Game Designer, specialized in Japanese text adventure games (文字冒险游戏/跑团游戏).
Your mission is to generate a fully functional, premium branching adventure quest story game formatted in strict JSON, based on the user's theme: "${prompt}".

The game must have exact RPG elements that are winnable but challenge-oriented. It needs to contain:
1. "metadata": Title, short engaging anime-style description, author name, neon/warm ACGN theme color, starting player stats (HP: 100 max, MP, gold, strength, charisma, luck), and initial inventory items.
2. "nodes": A dictionary of story nodes, starting with key "start".
- Each node represents a scene with narration.
- Nodes MUST have "id", "title" (chapter/heading), "avatarName" (the speaking character, e.g. "Lilith (莉莉丝)","Kaelen (凯伦)","System (系统提示)"), "avatarType" (one of: 'hero' | 'partner' | 'enemy' | 'merchant' | 'system'), and "text" (detailed interesting storytelling, usually 2-3 paragraphs with dialogues).
- Background styling: "bgPathName" selected from ['academy', 'forest', 'cave', 'dungeon', 'town'] represent the arena, and "bgTone" chosen from ['cyan', 'rose', 'amber', 'purple', 'emerald'].
- "choices": Array of pathways. Each choice must have "text" (what the button says, e.g., "⚔️ Pull out sword") and "targetNode" (the nodeId of the next node).
- Choices can optionally have "requirements" (stat minimum or items needed, e.g., list of items in player inventory) and "effects" (stat changes where stats are adjusted positive/negative, or losing/winning inventory items).
- Choices can optionally have a random "roll" D20 dice challenge matching an RPG skill test (stat: strength/luck/charisma, difficulty: 10 to 16, successNode, failureNode).
- The story MUST feature at least 6 to 10 distinct, fully linked nodes with:
  * At least one shopping node ("avatarType": "merchant") where the player can buy cool items with gold (with requirements/effects/inventory gains).
  * A central trial/conflict node.
  * A final boss or major task Node where choices determine victory or doom.
  * At least 3 logical end nodes:
    - "ending_victory": The happy, glorious ending! Needs to print a completion banner inside text.
    - "ending_death": The tragic/humorous ending if the player loses HP or fails (e.g. "reincarnated as a slime" or "captured by security robots").
    - One other distinct ending (e.g. rich merchant retirement, or becoming a local tavern worker due to cowardice).
- IMPORTANT VALIDATION RULES:
  * All choice lists must be complete.
  * Every targetNode, successNode, and failureNode defined in your JSON MUST refer to a valid node key defined in the outer "nodes" object! Do not create broken paths!
  * Keep all JSON keys exactly matching the schema.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a wonderful, highly custom Japanese-anime style text-adventure game about: "${prompt}". Return only the JSON. Ensure keys are in Chinese characters for text details and names to match the player.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["metadata", "nodes"],
            properties: {
              metadata: {
                type: Type.OBJECT,
                required: ["id", "title", "description", "author", "themeColor", "initialStats", "initialInventory"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  author: { type: Type.STRING },
                  themeColor: { 
                    type: Type.STRING,
                    description: "One of: cyan, rose, amber, purple, emerald, sky"
                  },
                  initialStats: {
                    type: Type.OBJECT,
                    required: ["hp", "maxHp", "mp", "maxMp", "gold", "strength", "charisma", "luck"],
                    properties: {
                      hp: { type: Type.INTEGER },
                      maxHp: { type: Type.INTEGER },
                      mp: { type: Type.INTEGER },
                      maxMp: { type: Type.INTEGER },
                      gold: { type: Type.INTEGER },
                      strength: { type: Type.INTEGER },
                      charisma: { type: Type.INTEGER },
                      luck: { type: Type.INTEGER }
                    }
                  },
                  initialInventory: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              },
              nodes: {
                type: Type.OBJECT,
                description: "Map of unique nodeId key strings to their corresponding StoryNode object templates."
              }
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({ error: "Empty story returned from AI model." });
      }

      // Parse and validate
      const parsedStory = JSON.parse(responseText);
      
      // Perform dynamic sanity check: make sure start node exists
      if (!parsedStory.nodes || !parsedStory.nodes.start) {
        // Fallback fix if model generated start node with dynamic ID
        const firstNodeKey = Object.keys(parsedStory.nodes)[0] || "start";
        if (firstNodeKey !== "start") {
          parsedStory.nodes.start = parsedStory.nodes[firstNodeKey];
          parsedStory.nodes.start.id = "start";
        }
      }

      // Make sure each node's "id" matches its dynamic key
      Object.keys(parsedStory.nodes).forEach(key => {
        parsedStory.nodes[key].id = key;
        // Strip out empty arrays or objects to prevent runtime errors
        if (!parsedStory.nodes[key].choices) {
          parsedStory.nodes[key].choices = [];
        }
      });

      res.json({ success: true, story: parsedStory });
    } catch (error: any) {
      console.error("AI Story generation failed with server error:", error);
      res.status(500).json({ 
        error: error.message || "Unknown error during story generation.",
        details: "Please verify your GEMINI_API_KEY is configured in Settings -> Secrets and is valid."
      });
    }
  });

  // Serve app resources and bundle files
  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Server configuration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted on Express server.");
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build routing instantiated.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express node container initialized. Online on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
