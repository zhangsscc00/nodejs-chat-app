// group 2
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
// 使用官方bad-words包
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");
const { Console } = require("console");

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
  console.warn("Listen");
  console.info("tips");

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
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    } else {
      io.to(user.room).emit("message", generateMessage(user.username, message));
      callback();
    }
  });
 
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    if (coords.longitude > 105 && coords.longitude < 120 && coords.latitude > 15 && coords.latitude < 30) {
      console.log("You are in southeastern China. Your coordinates are ", coords.latitude, coords.longitude);
    }
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

// Create a new word filter
function checkInputMessage (msg) {
  if (msg.includes("HSBC")) {
    return true
  };

  return false;
}
