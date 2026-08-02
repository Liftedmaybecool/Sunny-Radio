import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import {
  saveUserToFirestore,
  getUserFromFirestore,
  saveVerificationToFirestore,
  getVerificationFromFirestore,
  deleteVerificationFromFirestore,
  saveShowToFirestore,
} from "./src/db/firebaseServer";

dotenv.config();

// In-memory Auth & Verification Stores
interface VerificationRecord {
  code: string;
  email: string;
  expires: number;
  fullName?: string;
  type: 'register' | 'forgot_password';
}

interface UserRecord {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

const verificationStore = new Map<string, VerificationRecord>();
const userStore = new Map<string, UserRecord>();

export const app = express();
const PORT = 3000;

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initServer() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    app.use(express.json());

    // Initialize Gemini AI Client
    const getGenAI = () => {
      return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // M3U Stream Playlist Generator Route
  app.get("/api/radio/stream/:showId.m3u", (req, res) => {
    const showId = req.params.showId;
    res.setHeader("Content-Type", "audio/x-mpegurl");
    res.setHeader("Content-Disposition", `inline; filename="aistudio-radio-${showId}.m3u"`);
    
    const m3uContent = `#EXTM3U
#EXTINF:-1,AI Studio FM Live Radio Station - Episode ${showId}
${req.protocol}://${req.get("host")}/api/radio/live-audio/${showId}.mp3
`;
    res.send(m3uContent);
  });

  // Podcast RSS Feed Route
  app.get("/api/radio/rss/:showId.xml", (req, res) => {
    const showId = req.params.showId;
    res.setHeader("Content-Type", "application/rss+xml; charset=UTF-8");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>AI Studio FM Radio Broadcast</title>
    <link>${req.protocol}://${req.get("host")}</link>
    <language>en-us</language>
    <itunes:author>Gemini Managed Agents</itunes:author>
    <description>Live AI-powered talk radio broadcast generated on demand.</description>
    <item>
      <title>Episode #${showId}</title>
      <description>Live radio show episode on AI Studio FM</description>
      <enclosure url="${req.protocol}://${req.get("host")}/api/radio/live-audio/${showId}.mp3" length="10485760" type="audio/mpeg"/>
      <guid>${showId}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;
    res.send(rssXml);
  });

  // Generate Radio Show API Route
  app.post("/api/radio/generate", async (req, res) => {
    try {
      const { prompt, durationMinutes = 3, tone = "INFORMATIVE" } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Show topic prompt is required." });
      }

      const ai = getGenAI();

      const systemInstruction = `You are a world-class Executive Producer and Sound Designer for a top-tier live broadcast radio show.
Your job is to script an engaging, high-energy, authentic radio broadcast episode with TWO co-hosts:
- Host 1 (e.g., Alex / Lead Host): Charismatic, driving the conversation, asking insightful questions, energetic.
- Host 2 (e.g., Maya / Expert Analyst or Co-Host): Sharp, witty, quick with data/trivia, relatable, banter-driven.

The script must feel like a REAL live radio broadcast:
- Includes intro station ID / sound stings (e.g., "You're locked into AI Studio FM!").
- Includes realistic conversational banter, reactions, overlaps, laughter, and sharp insights.
- Includes periodic sound effect cues ('airhorn', 'scratch', 'jingle', 'cheer', 'applause', 'news_flash') at appropriate high-energy moments.
- Structured into timestamped turns with speaker roles and estimated duration per segment.
- Length: approx ${durationMinutes} minutes duration. Tone: ${tone}.`;

      const promptText = `Generate a complete radio show script for the following topic/prompt: "${prompt}".
Duration requested: ${durationMinutes} minute(s). Tone: ${tone}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Catchy Radio Show Episode Title" },
              tagline: { type: Type.STRING, description: "Radio station slogan / episode hook" },
              host1Name: { type: Type.STRING, description: "Name of Lead Host, e.g. Alex Vance" },
              host1Title: { type: Type.STRING, description: "Role, e.g. Senior Anchor" },
              host2Name: { type: Type.STRING, description: "Name of Co-Host, e.g. Maya Lin" },
              host2Title: { type: Type.STRING, description: "Role, e.g. Tech Analyst" },
              summary: { type: Type.STRING, description: "Brief 2-sentence summary of the episode" },
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    speaker: {
                      type: Type.STRING,
                      description: "Must be 'host1', 'host2', 'intro', 'outro', or 'sfx'",
                    },
                    speakerName: { type: Type.STRING },
                    speakerRole: { type: Type.STRING },
                    text: { type: Type.STRING, description: "The dialogue or announcer line" },
                    timestamp: { type: Type.STRING, description: "e.g. 0:00, 0:15, 0:45" },
                    sfxCue: {
                      type: Type.STRING,
                      description: "Optional sound cue: 'airhorn', 'scratch', 'jingle', 'cheer', 'applause', 'laugh', 'news_flash' or empty string",
                    },
                    durationSec: { type: Type.NUMBER, description: "Estimated speaking duration in seconds" },
                  },
                  required: ["speaker", "speakerName", "text", "timestamp", "durationSec"],
                },
              },
            },
            required: [
              "title",
              "tagline",
              "host1Name",
              "host1Title",
              "host2Name",
              "host2Title",
              "summary",
              "segments",
            ],
          },
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error("No script output returned from Gemini.");
      }

      const parsedShow = JSON.parse(jsonText);

      const showData = {
        id: "show-" + Date.now(),
        topic: prompt,
        durationMinutes,
        tone,
        ...parsedShow,
        createdAt: Date.now(),
      };

      // Save to Firebase Firestore database asynchronously
      saveShowToFirestore(showData, req.body.userEmail);

      // Return complete structured show object
      return res.json(showData);
    } catch (error: any) {
      console.error("Radio Show Generation Error:", error);
      res.status(500).json({
        error: "Failed to generate radio show script.",
        details: error.message || String(error),
      });
    }
  });

  // YouTube Music Search API Proxy
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "top hits";
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " music")}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const html = await response.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);

      let results: Array<{
        id: string;
        title: string;
        artist: string;
        thumbnail: string;
        duration?: string;
      }> = [];

      if (match && match[1]) {
        try {
          const data = JSON.parse(match[1]);
          const contents =
            data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
              ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

          if (Array.isArray(contents)) {
            for (const item of contents) {
              const video = item.videoRenderer;
              if (video && video.videoId) {
                const title = video.title?.runs?.[0]?.text || "Unknown Song";
                const artist =
                  video.ownerText?.runs?.[0]?.text ||
                  video.shortBylineText?.runs?.[0]?.text ||
                  "YouTube Music";
                const thumbnail =
                  video.thumbnail?.thumbnails?.[video.thumbnail.thumbnails.length - 1]?.url ||
                  `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
                const duration = video.lengthText?.simpleText || "";

                results.push({
                  id: video.videoId,
                  title,
                  artist,
                  thumbnail,
                  duration,
                });
                if (results.length >= 16) break;
              }
            }
          }
        } catch (e) {
          console.error("Error parsing ytInitialData", e);
        }
      }

      // Fallback if scraping yielded no results
      if (results.length === 0) {
        try {
          const pipedRes = await fetch(
            `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query + " music")}&filter=music_videos`
          );
          if (pipedRes.ok) {
            const pipedData = await pipedRes.json();
            if (pipedData?.items) {
              results = pipedData.items
                .filter((item: any) => item.type === "stream")
                .slice(0, 16)
                .map((item: any) => ({
                  id: (item.url || "").replace("/watch?v=", ""),
                  title: item.title || "Song",
                  artist: item.uploaderName || "Artist",
                  thumbnail: item.thumbnail || "",
                  duration: item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : "",
                }))
                .filter((r: any) => r.id);
            }
          }
        } catch (err) {
          console.error("Fallback search failed", err);
        }
      }

      res.json({ results });
    } catch (error: any) {
      console.error("YouTube Search Error:", error);
      res.status(500).json({ error: "Failed to search YouTube", results: [] });
    }
  });

  // =========================================================================
  // AUTHENTICATION & EMAIL VERIFICATION API ENDPOINTS
  // =========================================================================

  // Helper to send verification email via Nodemailer (noreply.sunnyai@gmail.com)
  const sendVerificationEmail = async (email: string, code: string, type: 'register' | 'forgot_password') => {
    const senderEmail = process.env.GMAIL_USER || 'noreply.sunnyai@gmail.com';
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    const htmlContent = `
      <div style="background-color: #080e0a; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; border-radius: 16px; border: 1px solid #22c55e44; max-width: 520px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(249,115,22,0.15)); border: 1px solid #22c55e66; padding: 6px 18px; border-radius: 20px; color: #4ade80; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
            🎙️ SUNNY AI RADIO CONFIRMATION
          </div>
          <h2 style="color: #ffffff; margin-top: 16px; margin-bottom: 6px; font-size: 26px; font-weight: 800;">
            ${type === 'register' ? 'Verify Your Account' : 'Reset Your Password'}
          </h2>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">Enter this 6-digit verification security code in the app</p>
        </div>

        <div style="background: #0d1711; border: 1.5px dashed #22c55e; border-radius: 14px; padding: 28px; text-align: center; margin-bottom: 24px; position: relative;">
          <div style="font-size: 40px; font-weight: 900; letter-spacing: 14px; color: #22c55e; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 10px rgba(34,197,94,0.4);">
            ${code}
          </div>
          <div style="margin-top: 16px; display: inline-block; background: #f9731620; color: #fb923c; border: 1px solid #f9731644; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700;">
            ⏱️ Expires in 10 minutes
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <p style="color: #d1d5db; font-size: 12px; margin: 0; line-height: 1.5;">
            Sender: <strong style="color: #4ade80;">${senderEmail}</strong><br />
            If you did not request this security code, please ignore this message.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #22c55e22; pt: 16px;">
          <p style="color: #6b7280; font-size: 11px; margin: 0;">
            © Sunny AI Radio &bull; Secure Email Dispatch System
          </p>
        </div>
      </div>
    `;

    if (gmailAppPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: senderEmail,
            pass: gmailAppPassword,
          },
        });

        await transporter.sendMail({
          from: `"Sunny AI Radio" <${senderEmail}>`,
          to: email,
          subject: `${code} is your Sunny AI Radio verification code`,
          html: htmlContent,
        });
        console.log(`[SMTP] Verification email sent successfully to ${email} via Gmail SMTP (${senderEmail})`);
        return true;
      } catch (err) {
        console.error(`[SMTP Error] Failed to send email via Gmail SMTP:`, err);
      }
    } else {
      console.log(`[DEV MODE] Verification Code for ${email}: ${code} (SMTP env GMAIL_APP_PASSWORD not set)`);
    }

    return false;
  };

  // 1. Send 6-Digit Verification Code
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const { email, type = 'register', fullName } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      // Generate random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const vRecord = {
        code,
        email: email.toLowerCase(),
        fullName,
        type,
        expires: Date.now() + 10 * 60 * 1000,
      };

      // Store in memory map
      verificationStore.set(email.toLowerCase(), vRecord);

      // Save to Firebase Firestore database
      await saveVerificationToFirestore(vRecord);

      const sentViaSmtp = await sendVerificationEmail(email.toLowerCase(), code, type);

      return res.json({
        success: true,
        message: `6-digit code sent from noreply.sunnyai@gmail.com to ${email}`,
        sentViaSmtp,
        senderEmail: process.env.GMAIL_USER || 'noreply.sunnyai@gmail.com',
      });
    } catch (err: any) {
      console.error("Error sending verification code:", err);
      return res.status(500).json({ error: "Failed to send verification code" });
    }
  });

  // 2. Verify 6-Digit Code
  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and 6-digit verification code are required" });
      }

      let record = verificationStore.get(email.toLowerCase());

      // If not in memory, query Firebase Firestore database
      if (!record) {
        const dbRecord = await getVerificationFromFirestore(email.toLowerCase());
        if (dbRecord) {
          record = dbRecord as VerificationRecord;
        }
      }

      if (!record) {
        return res.status(400).json({
          error: "No verification code found for this email. Please request a new code.",
        });
      }

      if (Date.now() > record.expires) {
        verificationStore.delete(email.toLowerCase());
        await deleteVerificationFromFirestore(email.toLowerCase());
        return res.status(400).json({
          error: "Verification code has expired. Please request a new code.",
        });
      }

      if (record.code.trim() !== code.trim()) {
        return res.status(400).json({
          error: "Invalid 6-digit verification code. Please check your email and try again.",
        });
      }

      // Code is valid! Keep record until password step completes
      return res.json({
        success: true,
        message: "Verification code confirmed successfully!",
        type: record.type,
      });
    } catch (err: any) {
      console.error("Error verifying code:", err);
      return res.status(500).json({ error: "Failed to verify code" });
    }
  });

  // 3. Register / Set Password
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, code } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      let record = verificationStore.get(email.toLowerCase());
      if (!record) {
        const dbRecord = await getVerificationFromFirestore(email.toLowerCase());
        if (dbRecord) record = dbRecord as VerificationRecord;
      }

      if (code && record && record.code !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      const user: UserRecord = {
        email: email.toLowerCase(),
        name: fullName || record?.fullName || email.split('@')[0],
        passwordHash: password,
        createdAt: Date.now(),
      };

      // Save to memory and Firebase Firestore database
      userStore.set(email.toLowerCase(), user);
      await saveUserToFirestore(user);

      verificationStore.delete(email.toLowerCase());
      await deleteVerificationFromFirestore(email.toLowerCase());

      return res.json({
        success: true,
        user: {
          email: user.email,
          name: user.name,
        },
        token: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  // 4. Sign In
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please enter your email and password" });
      }

      // 1. Check in-memory store
      let user = userStore.get(email.toLowerCase());

      // 2. Check Firebase Firestore database if not in memory
      if (!user) {
        const dbUser = await getUserFromFirestore(email.toLowerCase());
        if (dbUser) {
          user = dbUser;
          userStore.set(email.toLowerCase(), user);
        }
      }

      if (user) {
        if (user.passwordHash !== password) {
          return res.status(400).json({ error: "Incorrect password. Please try again or use Forgot Password." });
        }
        return res.json({
          success: true,
          user: {
            email: user.email,
            name: user.name,
          },
          token: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        });
      }

      // If user doesn't exist yet, save new user to Firestore
      const newUser: UserRecord = {
        email: email.toLowerCase(),
        name: email.split('@')[0],
        passwordHash: password,
        createdAt: Date.now(),
      };
      userStore.set(email.toLowerCase(), newUser);
      await saveUserToFirestore(newUser);

      return res.json({
        success: true,
        user: {
          email: newUser.email,
          name: newUser.name,
        },
        token: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // 5. Sign In with 6-Digit Code
  app.post("/api/auth/login-with-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and 6-digit verification code are required" });
      }

      let record = verificationStore.get(email.toLowerCase());

      // If not in memory, check Firestore database
      if (!record) {
        const dbRecord = await getVerificationFromFirestore(email.toLowerCase());
        if (dbRecord) {
          record = dbRecord as VerificationRecord;
        }
      }

      if (!record) {
        return res.status(400).json({
          error: "No active 6-digit verification code found for this email. Please request a new code.",
        });
      }

      if (Date.now() > record.expires) {
        verificationStore.delete(email.toLowerCase());
        await deleteVerificationFromFirestore(email.toLowerCase());
        return res.status(400).json({
          error: "Verification code has expired. Please request a new 6-digit code.",
        });
      }

      if (record.code.trim() !== code.trim()) {
        return res.status(400).json({
          error: "Incorrect 6-digit verification code. Access denied until correct code is entered.",
        });
      }

      // Code is correct! Clean up verification record
      verificationStore.delete(email.toLowerCase());
      await deleteVerificationFromFirestore(email.toLowerCase());

      // Fetch user from Memory or Firestore database
      let user = userStore.get(email.toLowerCase());
      if (!user) {
        const dbUser = await getUserFromFirestore(email.toLowerCase());
        if (dbUser) {
          user = dbUser;
          userStore.set(email.toLowerCase(), user);
        }
      }

      if (!user) {
        // Create user record for code login
        user = {
          email: email.toLowerCase(),
          name: record.fullName || email.split('@')[0],
          passwordHash: "code_authenticated",
          createdAt: Date.now(),
        };
        userStore.set(email.toLowerCase(), user);
        await saveUserToFirestore(user);
      }

      return res.json({
        success: true,
        user: {
          email: user.email,
          name: user.name,
        },
        token: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      });
    } catch (err: any) {
      console.error("Error signing in with code:", err);
      return res.status(500).json({ error: "Sign in with 6-digit code failed" });
    }
  });


    // Vite middleware for development (only when running local dev server, not on Vercel)
    if (!process.env.VERCEL) {
      if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }

    isInitialized = true;
  })();

  return initPromise;
}

if (!process.env.VERCEL) {
  initServer().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
