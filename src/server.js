const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 5000;

const rooms = [];
const roomIds = new Set();
const users = [];

io.on("connection", (socket) => {
    require("./socket_utils")(io, socket, rooms, roomIds, users);
});

app.use(express.static(path.join(__dirname, "..", "public")));
server.listen(PORT, () => {
    console.log(`localhost:${PORT}`);
});
