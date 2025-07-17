// group 2
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
// 使用官方bad-words包
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

require("dotenv").config();

// 初始化bad-words过滤器
const filter = new Filter();

// 可以添加自定义禁词
filter.addWords('垃圾', '傻逼', '白痴', '混蛋', '操', '草', '妈的', '他妈的', '狗屎', '婊子', '贱人');

// 可以移除某些词（如果不想过滤的话）
// filter.removeWords('hells', 'sadist');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New WebSocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    } else {
      socket.join(user.room);

      socket.emit("message", generateMessage("Admin", "Welcome!"));
      socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });

      callback();
    }
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    
    // 使用bad-words过滤器检查消息
    if (filter.isProfane(message)) {
      // 记录违规行为
      console.log(`Message blocked for user ${user.username} in room ${user.room}: "${message}"`);
      
      // 返回错误消息，阻止发送
      return callback("Profanity is not allowed! Your message has been blocked.");
    }
    
    // 消息通过过滤器检查，正常发送
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
