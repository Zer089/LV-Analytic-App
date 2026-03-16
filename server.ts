import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/knowledge", (req, res) => {
    try {
      const knowledgePath = path.join(__dirname, "src", "knowledge", "siemens-nshv.json");
      const data = fs.readFileSync(knowledgePath, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to load knowledge" });
    }
  });

  app.get("/api/instructions", (req, res) => {
    try {
      const instructionPath = path.join(__dirname, "src", "knowledge", "system-instruction.txt");
      if (fs.existsSync(instructionPath)) {
        const data = fs.readFileSync(instructionPath, "utf-8");
        res.json({ instructions: data });
      } else {
        res.json({ instructions: "" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to load instructions" });
    }
  });

  app.post("/api/knowledge", (req, res) => {
    try {
      const knowledgePath = path.join(__dirname, "src", "knowledge", "siemens-nshv.json");
      fs.writeFileSync(knowledgePath, JSON.stringify(req.body, null, 2), "utf-8");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save knowledge" });
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
