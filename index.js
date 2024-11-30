const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Store active connections
const users = new Map();

// socket io

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  io.emit("reply", "server connect");

  // On user registration or login, map userId to socket.id
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(users);

    console.log(`User registered: ${userId} => ${socket.id}`);
  });

  socket.on("onForwardingActivate", ({msg})=>{
    console.log(msg)
  })

  
  // Handle private message
  socket.on("private_message", ({ receiverId, message }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", message);
      console.log(`Message sent to ${receiverSocketId}: ${message}`);
    } else {
      console.log(`User ${receiverId} is not connected.`);
    }
  });


  // On disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log(`User removed: ${userId}`);
        break;
      }
    }
  });
});


app.get("/", (req, res) => {
  res.send("Hello world")
});
server.listen(9000, () => console.log("server start at port: 9000"));
