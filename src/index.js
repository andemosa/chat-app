const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  socket.on("join", ({ username }, callback) => {
    const { error, user } = addUser({ id: socket.id, username });

    if (error) {
      return callback(error);
    }

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast.emit(
      "message",
      generateMessage("Admin", `${user.username} has joined!`)
    );
    io.emit("roomData", {
      users: getUsersInRoom(),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", ({ longitude, latitude }, callback) => {
    const user = getUser(socket.id);
    io.emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.emit("message", generateMessage("Admin", `${user.username} has left`));
      io.emit("roomData", {
        users: getUsersInRoom(),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
