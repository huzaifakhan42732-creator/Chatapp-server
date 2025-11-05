import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // Join a room
  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("message", {
      sender: "System",
      text: `A user joined room: ${roomId}`,
      room: roomId,
    });
  });

  // Leave a room
  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit("message", {
      sender: "System",
      text: `A user left room: ${roomId}`,
      room: roomId,
    });
  });

  // Send message to specific room
  socket.on("send", (message) => {
    console.log("📨 Message:", message);
    socket.to(message.room).emit("message", message);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

server.listen(5050, () => {
  console.log("🚀 Server running on port 5050");
});
