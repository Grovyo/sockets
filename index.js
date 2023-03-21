const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
      console.log("Connected Users", activeUsers);
      io.emit("get-users", activeUsers);
    }
  });
  socket.on("send-message", (data) => {
    const { reciever } = data.data;
    const user = activeUsers.find((user) => user.userId === reciever);

    console.log(data);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    } else {
      console.log("no user");
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("Disconnected Users", activeUsers);
    io.emit("get-users", activeUsers);
  });
});

http.listen(4100, function () {
  console.log("Sockets on 4100");
});
