const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let activeUsers = [];

const addUser = (userId, socketId, userInfo) => {
  const checkUser = activeUsers.find((u) => u.userId === userId);
  if (!checkUser) {
    activeUsers.push({ userId, socketId, userInfo });
    io.emit("onlineUser", activeUsers);
  }
};

const removeUser = (socketId) => {
  activeUsers = activeUsers.filter((u) => u.socketId !== socketId);
};

const findOnlineUser = (id) => {
  return activeUsers.find((u) => u.userId === id);
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("onlineUser", activeUsers);
  });
  socket.on("sendMessage", (message) => {
    const onlineFriend = findOnlineUser(message.receiverId);
    if (onlineFriend) {
      socket.to(onlineFriend.socketId).emit("reciveMessage", message);
    }
  });
  socket.on("messageUnsent", (message) => {
    const onlineFriend = findOnlineUser(message.receiverId);
    if (onlineFriend) {
      socket.to(onlineFriend.socketId).emit("reciveUnsentMessage", message);
    }
  });
  socket.on("typingMessage", (message) => {
    const onlineFriend = findOnlineUser(message.receiverId);
    if (onlineFriend) {
      socket.to(onlineFriend.socketId).emit("getTypingMessage", message);
    }
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    removeUser(socket.id);
    io.emit("onlineUser", activeUsers);
  });
});

console.log("Server is running on port 3000");
