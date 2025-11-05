import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

const app = express();

const FRONTEND_URL = "https://chatapp-client-7ak1.vercel.app";

app.use(cors({
  origin: [FRONTEND_URL],
  methods: ["GET", "POST"],
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("message", {
      sender: "System",
      text: `A user joined room: ${roomId}`,
      room: roomId,
    });
  });

  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit("message", {
      sender: "System",
      text: `A user left room: ${roomId}`,
      room: roomId,
    });
  });

  socket.on("send", (message) => {
    console.log("📨 Message:", message);
    socket.to(message.room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// 🧠 Add a basic route for Railway health check
app.get("/", (req, res) => {
  res.send("✅ ChatApp Socket.io server running!");
});

// ✅ Use Railway's dynamic port
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
