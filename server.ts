import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    // Use default credentials in this environment
  });
}

const db = getFirestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending abandonment emails
  app.post("/api/send-abandonment-email", async (req, res) => {
    const { email, storeName, cartUrl, ownerId } = req.body;

    if (!email || !storeName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let smtpHost = process.env.SMTP_HOST;
    let smtpPort = process.env.SMTP_PORT;
    let smtpUser = process.env.SMTP_USER;
    let smtpPass = process.env.SMTP_PASS;

    // If ownerId is provided, try to fetch their custom SMTP settings from Firestore
    if (ownerId) {
      try {
        const settingsSnap = await db.collection("settings").doc(ownerId).get();
        if (settingsSnap.exists) {
          const settings = settingsSnap.data()?.smtp;
          if (settings?.host && settings?.user && settings?.pass) {
            smtpHost = settings.host;
            smtpPort = settings.port || "587";
            smtpUser = settings.user;
            smtpPass = settings.pass;
          }
        }
      } catch (error) {
        console.error("Error fetching user SMTP settings:", error);
      }
    }
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("SMTP not configured. Skipping email sending.");
      return res.status(200).json({ message: "SMTP not configured. Email logged but not sent." });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"${storeName}" <${smtpUser}>`,
        to: email,
        subject: `أكمل طلبك في ${storeName}`,
        html: `
          <div dir="rtl" style="font-family: sans-serif; padding: 20px;">
            <h2>مرحباً!</h2>
            <p>لقد لاحظنا أنك تركت بعض المنتجات في سلتك في متجر <strong>${storeName}</strong>.</p>
            <p>لا تفوت الفرصة، يمكنك إكمال طلبك الآن عبر الرابط التالي:</p>
            <a href="${cartUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">إكمال الطلب</a>
            <p>شكراً لك!</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
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
