import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors"; // ✅ Add this

const app = express();

// ✅ Add Express CORS middleware (for REST + Socket)
app.use(
  cors({
    origin: [
      "https://chatapp-client-7ak1.vercel.app", // your deployed frontend
      "http://localhost:5173", // for local testing
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
  transports: ["websocket", "polling"], // ✅ this line is very important
});

app.get("/", (req, res) => {
  res.send("<h1>Hello from Realtime Socket Chat Server 🚀</h1>");
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join a room
  socket.on("join", (roomId) => {
    socket.join(roomId);
  });

  // Leave a room
  socket.on("leave", (roomId) => {
    socket.leave(roomId);
  });

  // Broadcast message to room
  socket.on("send", (message) => {
    console.log(message);
    socket.to(message.room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Use process.env.PORT (Railway assigns it automatically)
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
