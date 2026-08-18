import { io } from "socket.io-client";

// Connect to backend Socket.IO server
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("⚡ Connected to EcoVision Socket server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from EcoVision Socket server");
});
