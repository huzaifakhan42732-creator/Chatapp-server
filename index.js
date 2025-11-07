import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

// ✅ Add Express CORS
app.use(
  cors({
    origin: [
      "https://chatapp-client-7ak1.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://chatapp-client-7ak1.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],

  // ✅ Helps prevent Railway from timing out sockets
  pingTimeout: 60000,   // 60s before timing out
  pingInterval: 25000,  // Ping every 25s
});

app.get("/", (req, res) => {
  res.send("<h1>Hello from NexaChat Realtime Server 🚀</h1>");
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leave", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("send", (message) => {
    console.log("📩 Message:", message);
    socket.to(message.room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
