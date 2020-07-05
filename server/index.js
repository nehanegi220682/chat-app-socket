const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", socket => {
  console.log("new connection!!!");

  socket.on("join", ({ name, room }, callback) => {
    //addUser() can return only 1 prop, either error or user
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }

    //join adds user to the room
    socket.join(user.room);

    //emitting this event to frontend
    socket.emit("message", {
      user: "admin",
      text: `${user.name} welcome to the room ${user.room}`
    });

    //broadcast is gonna send message to everyone besides that specific user
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined.` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  //creating events for user generated messages
  //admin generated msgs are "message" user geberated ones are "sendMessage"
  //waiting on event in backend
  socket.on("sendMessage", (message, callback) => {
    //get user who sent the message
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left`
      });
    }
    console.log("user had left");
  });
});

app.use(router);
app.use(cors());

server.listen(process.env.PORT || 5000, () =>
  console.log(`server running ON PORT ${PORT}`)
);
