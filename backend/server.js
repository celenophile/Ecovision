import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import usersRouter from "./routes/users.js";
import scoresRouter from "./routes/scores.js";
import leaderboardRouter from "./routes/leaderboard.js";
import { setupRoomSocket } from "./sockets/roomHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EcoVision API is running 🌍" });
});

app.use("/api/users", usersRouter);
app.use("/api/scores", scoresRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupRoomSocket(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🌿 EcoVision backend & Socket.IO server running at http://localhost:${PORT}`);
  });
});

