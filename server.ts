import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { google } from "googleapis";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Firebase Admin
let adminApp;
try {
  adminApp = getApps().length === 0 
    ? initializeApp({
        projectId: firebaseConfig.projectId
      }) 
    : getApps()[0];
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  // Fallback or exit if critical
}

// Use named database if provided, otherwise fallback to default
const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId || "(default)");

// Test connection to Firestore Admin on startup
async function testAdminConnection() {
  try {
    console.log(`Testing Firestore Admin connection for project: ${firebaseConfig.projectId}, database: ${firebaseConfig.firestoreDatabaseId || "(default)"}`);
    await db.listCollections();
    console.log("Firestore Admin connection successful.");
  } catch (error) {
    console.error("Firestore Admin connection test failed on startup:", error);
    if (error instanceof Error && error.message.includes("PERMISSION_DENIED")) {
      console.error("CRITICAL: Permission denied for Firestore Admin. Please ensure the service account has 'Cloud Datastore User' or 'Firebase Firestore Admin' role.");
    }
  }
}
testAdminConnection();

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Google OAuth Client for Blogger
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/auth/callback`
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Routes ---

  app.get("/api/auth/url", (req, res) => {
    const scopes = [
      'https://www.googleapis.com/auth/blogger',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code, state } = req.query;
    const userId = state as string; // We'll pass userId in state from client

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Store tokens in Firestore for this user
      if (userId) {
        await db.collection("settings").doc(userId).set({
          bloggerTokens: tokens,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/dashboard';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      res.status(500).send("Authentication failed.");
    }
  });

  // --- Blogger API Routes ---

  app.get("/api/blogs", async (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
      const settingsSnap = await db.collection("settings").doc(userId).get();
      const tokens = settingsSnap.data()?.bloggerTokens;

      if (!tokens) return res.status(401).json({ error: "Not authenticated with Blogger" });

      oauth2Client.setCredentials(tokens);
      const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
      
      const response = await blogger.blogs.listByUser({ userId: 'self' });
      res.json(response.data.items || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  });

  // --- Article Generation ---

  app.post("/api/generate-article", async (req, res) => {
    const { prompt, keywords, language = "ar" } = req.body;

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are an expert SEO content writer and Blogger specialist. 
          Your goal is to create high-quality, engaging, and SEO-optimized articles for Blogger.
          The article should be formatted in clean HTML (suitable for Blogger's editor).
          Include a catchy title, relevant headings (H2, H3), well-structured paragraphs, and bullet points if necessary.
          Crucially, include strong SEO practices: bold important terms, and suggest places for strong backlinks (or include relevant placeholder links).
          Target Keywords: ${keywords.join(", ")}
          Language: ${language === 'ar' ? 'Arabic' : 'English'}
          
          Return the response in JSON format:
          {
            "title": "Article Title",
            "content": "HTML content of the article"
          }`,
          responseMimeType: "application/json"
        }
      });

      const article = JSON.parse(result.text);
      res.json(article);
    } catch (error) {
      console.error("Error generating article:", error);
      res.status(500).json({ error: "Failed to generate article" });
    }
  });

  // --- Publishing & Scheduling Logic ---

  async function publishToBlogger(userId: string, blogId: string, title: string, content: string) {
    const settingsSnap = await db.collection("settings").doc(userId).get();
    const tokens = settingsSnap.data()?.bloggerTokens;

    if (!tokens) throw new Error("No tokens found for user");

    oauth2Client.setCredentials(tokens);
    const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

    const response = await blogger.posts.insert({
      blogId,
      requestBody: {
        title,
        content,
        labels: ["AI Generated", "SEO"]
      }
    });
    
    return response.data;
  }

  app.post("/api/publish-now", async (req, res) => {
    const { userId, blogId, title, content } = req.body;
    if (!userId || !blogId || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const publishedPost = await publishToBlogger(userId, blogId, title, content);
      res.json({ success: true, post: publishedPost });
    } catch (error) {
      console.error("Error publishing immediately:", error);
      res.status(500).json({ error: "Failed to publish to Blogger" });
    }
  });

  // Background job to check for scheduled articles
  setInterval(async () => {
    console.log("Checking for scheduled articles...");
    const now = new Date().toISOString();

    try {
      const articlesSnap = await db.collection("articles")
        .where("status", "==", "scheduled")
        .where("scheduledAt", "<=", now)
        .get();

      console.log(`Found ${articlesSnap.size} articles to publish.`);

      for (const doc of articlesSnap.docs) {
        const article = doc.data();
        console.log(`Publishing scheduled article: ${article.title} (ID: ${doc.id})`);

        try {
          const publishedPost = await publishToBlogger(article.ownerUid, article.blogId, article.title, article.content);
          
          await doc.ref.update({
            status: "published",
            publishedAt: new Date().toISOString(),
            publishedUrl: publishedPost?.url || null
          });
          
          console.log(`Successfully published article: ${article.title}`);
        } catch (error) {
          console.error(`Failed to publish article ${article.title}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in scheduler background job:", error);
    }
  }, 60 * 1000); // Check every minute

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
