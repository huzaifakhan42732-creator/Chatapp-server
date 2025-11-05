import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

const app = express();

// ✅ Your frontend domain (no trailing slash!)
const FRONTEND_URL = "https://chatapp-client-7ak1.vercel.app";

// ✅ Enable CORS for Express routes
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Create HTTP server
const server = http.createServer(app);

// ✅ Enable CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🧠 Simple test route (for Railway health check)
app.get("/", (req, res) => {
  res.send("✅ ChatApp Socket.io server running!");
});

// 🎧 Socket.IO Events
io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("message", {
      sender: "System",
      text: `A user joined ${roomId}`,
      room: roomId,
    });
  });

  socket.on("send", (message) => {
    console.log("📨 Message:", message);
    socket.to(message.room).emit("message", message);
  });

  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("message", {
      sender: "System",
      text: `A user left ${roomId}`,
      room: roomId,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ✅ Use Railway dynamic port
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
