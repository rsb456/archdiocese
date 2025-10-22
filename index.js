import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";

// ---------- ROUTES ----------
import priestRoutes from "./routes/priestRoutes.js";
import relationRoutes from "./routes/relationRoutes.js";
import formationRoutes from "./routes/formationRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import homeAddressRoutes from "./routes/homeAddressRoutes.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- API ROUTES ----------
app.use("/api/priests", priestRoutes);
app.use("/api/relations", relationRoutes);
app.use("/api/formations", formationRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/homeAddress", homeAddressRoutes);

// ---------- FRONTEND SERVING ----------
const frontendPath = path.resolve(__dirname, "../archidiocese-frontend/dist");

console.log("🗂  Checking for frontend build at:", frontendPath);

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath, { index: false }));

  // Handle any route not starting with /api
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  console.log("✅ Frontend build found. Serving from dist/");
} else {
  console.warn("⚠️  No frontend build found at:", frontendPath);
  app.get("/", (req, res) =>
    res.send(
      "⚠️ Frontend build missing. Run 'npm run build' inside archidiocese-frontend first."
    )
  );
}

// ---------- MONGO CONNECTION ----------
const localMongoURI = "mongodb://127.0.0.1:27017/priestdb";
const mongoURI =
  process.env.MONGO_URI && process.env.MONGO_URI.trim() !== ""
    ? process.env.MONGO_URI
    : localMongoURI;

const PORT = process.env.PORT || 5000;

const connectWithRetry = () => {
  console.log(`⏳ Connecting to MongoDB at: ${mongoURI}`);
  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("✅ MongoDB connected successfully");
      app.listen(PORT, "127.0.0.1", () => {
        console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      console.log("🔁 Retrying in 4 seconds...");
      setTimeout(connectWithRetry, 4000);
    });
};

connectWithRetry();
