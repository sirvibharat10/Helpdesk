import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config();

// Routes
import authRoutes from "./routes/auth.js";
import ticketsRoutes from "./routes/tickets.js";
import usersRoutes from "./routes/users.js";
import settingsRoutes from "./routes/settings.js";

// Middleware
import { errorHandler } from "./middleware.js";

// Services
import { emailPollerService } from "./services/emailPollerService.js";
import { queueService } from "./services/queueService.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/settings", settingsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get frontend build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const frontendDist = join(__dirname, "../../frontend/dist");

// Serve frontend static files
app.use(express.static(frontendDist));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(join(frontendDist, "index.html"), { root: "/" }, (err) => {
    if (err) {
      res.status(500).send({ error: "Failed to load" });
    }
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Start the background queue service
  await queueService.start();

  // Start email polling (IMAP + SMTP)
  await emailPollerService.startPolling();
});
