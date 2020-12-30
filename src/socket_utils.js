const User = require("./classes/user");
const Room = require("./classes/room");

const generateChannelId = (roomIds) => {
    const chs = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let roomId = "";
    for (let i = 0; i < 5; i++)
        roomId += chs[Math.floor(Math.random() * chs.length)];

    while (roomIds.has(roomId)) {
        roomId = "";
        for (let i = 0; i < 5; i++)
            roomId += chs[Math.floor(Math.random() * chs.length)];
    }
    return roomId;
};

module.exports = (io, socket, rooms, roomIds, users) => {
    socket.on("create", (name) => {
        const channelId = generateChannelId(roomIds);
        roomIds.add(channelId);
        const room = new Room(channelId);
        rooms.push(room);
        socket.join(channelId);
        const color = room.getColor();
        const user = new User(socket.id, name, color, room);
        users.push(user);
        room.addUser(user);
        socket.emit("created", channelId);
        io.in(channelId).emit("user-connect", user.name, user.color);
    });

    socket.on("join", (name, channelId) => {
        const room = rooms.find((r) => r.id === channelId);
        if (room) {
            if (room.userList.find((user) => user.name === name))
                socket.emit("failure", "name-taken");
            else {
                socket.join(channelId);
                const room = rooms.find((room) => room.id === channelId);
                const color = room.getColor();
                const user = new User(socket.id, name, color, room);
                users.push(user);
                room.addUser(user);
                io.in(channelId).emit("user-connect", user.name, user.color);
                const participants = [];
                room.userList.forEach((u) => {
                    participants.push({ name: u.name, color: u.color });
                });
                socket.emit("joined", name, channelId, participants);
            }
        } else socket.emit("failure", "invalid-ID");
    });

    socket.on("message", (message) => {
        const user = users.find((user) => user.id === socket.id);
        if (!user) return;
        const room = user.room;
        const channelId = room.id;
        io.in(channelId).emit("new-message", user.name, user.color, message);
    });

    socket.on("image", (image) => {
        console.log(image)
        const user = users.find((user) => user.id === socket.id);
        if (!user) return;
        const room = user.room;
        const channelId = room.id;
        io.in(channelId).emit("new-image", user.name, user.color, image);
    });

    socket.on("disconnect", () => {
        let user = users.find((user) => user.id === socket.id);
        if (!user) return;
        let room = user.room;
        room.removeUser(user.name);
        users = users.filter((user) => user.id !== socket.id);
        delete user;
        const channelId = room.id;
        if (room.userCount === 0) {
            rooms = rooms.filter((room) => room !== room);
            roomIds.delete(channelId);
            delete room;
        }
        if (room) {
            io.in(channelId).emit("user-disconnect", user.name, user.color);
        }
    });
};
