import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Firebase Admin
const adminApp = getApps().length === 0 
  ? initializeApp({
      projectId: firebaseConfig.projectId
    }) 
  : getApps()[0];

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

console.log(`Firebase Admin initialized.`);
console.log(`- Project ID (from app): ${adminApp.options.projectId || 'default'}`);
console.log(`- Project ID (from env): ${process.env.GOOGLE_CLOUD_PROJECT || 'not set'}`);
console.log(`- Database ID: ${firebaseConfig.firestoreDatabaseId}`);

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

  app.get("/api/firebase-status", async (req, res) => {
    try {
      const collections = await db.listCollections();
      res.json({
        status: "connected",
        projectId: adminApp.options.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        collections: collections.map(c => c.id)
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        projectId: adminApp.options.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId
      });
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

  // Background job to check for abandoned checkouts
  setInterval(async () => {
    console.log("Checking for abandoned checkouts...");
    const now = new Date();
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    try {
      // Find checkout_start events that are 20-30 minutes old
      const eventsSnap = await db.collection("events")
        .where("eventType", "==", "checkout_start")
        .where("timestamp", "<=", twentyMinutesAgo)
        .where("timestamp", ">", thirtyMinutesAgo)
        .get();

      for (const eventDoc of eventsSnap.docs) {
        const eventData = eventDoc.data();
        const { sessionId, storeId, ownerId, email, url } = eventData;

        if (!sessionId || !storeId) continue;

        // Check if this session already has a purchase_complete or checkout_abandon event
        const otherEventsSnap = await db.collection("events")
          .where("sessionId", "==", sessionId)
          .where("eventType", "in", ["purchase_complete", "checkout_abandon"])
          .get();

        if (otherEventsSnap.empty) {
          console.log(`Abandoned checkout detected for session ${sessionId}`);

          // 1. Record checkout_abandon event
          await db.collection("events").add({
            storeId,
            ownerId,
            sessionId,
            eventType: "checkout_abandon",
            email: email || null,
            url,
            timestamp: new Date(),
            metadata: JSON.stringify({ original_event_id: eventDoc.id })
          });

          // 2. Send email if we have an email address
          if (email) {
            // Get store name
            const storeSnap = await db.collection("stores").doc(storeId).get();
            const storeName = storeSnap.exists ? storeSnap.data()?.name : "متجرنا";

            // Trigger email sending logic (internal call or reuse logic)
            console.log(`Sending abandonment email to ${email} for store ${storeName}`);
            
            // Reusing the SMTP logic
            let smtpHost = process.env.SMTP_HOST;
            let smtpPort = process.env.SMTP_PORT;
            let smtpUser = process.env.SMTP_USER;
            let smtpPass = process.env.SMTP_PASS;

            if (ownerId) {
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
            }

            if (smtpHost && smtpUser && smtpPass) {
              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort || "587"),
                secure: smtpPort === "465",
                auth: { user: smtpUser, pass: smtpPass },
              });

              await transporter.sendMail({
                from: `"${storeName}" <${smtpUser}>`,
                to: email,
                subject: `نسيت تكمل طلبك؟ ارجع الآن`,
                html: `
                  <div dir="rtl" style="font-family: sans-serif; padding: 20px; text-align: center;">
                    <h2>مرحباً!</h2>
                    <p>لقد لاحظنا أنك تركت بعض المنتجات في سلتك في متجر <strong>${storeName}</strong>.</p>
                    <p style="font-size: 18px; margin: 20px 0;">نسيت تكمل طلبك؟ ارجع الآن</p>
                    <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">إكمال الطلب</a>
                    <p style="margin-top: 30px; color: #666;">شكراً لك!</p>
                  </div>
                `,
              });
              console.log(`Email sent to ${email}`);
            } else {
              console.log("SMTP not configured for owner, skipping email.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in abandonment background job:", error);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
