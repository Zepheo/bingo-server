const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const {
  validateRoomname, createRoom, getAllRooms, removeUserFromRoom, addUserToRoom,
} = require('./utils/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8080;

io.origins('*:*');

io.on('connection', (socket) => {
  console.log(`New connection from: ${socket.id}`);
  socket.on('create', (data) => {
    try {
      validateRoomname(data.room);
      const room = createRoom(socket.id, data.name, data.room, data.password, data.zones);
      const { name } = room.users[0];

      socket.emit('roomCreated', { roomname: room.name, username: name, cards: room.cards });
      io.emit('activeRooms', getAllRooms());
      socket.join(room.name);
    } catch (error) {
      socket.emit('roomCreationError', error.message);
    }
  });
  socket.on('join', (data) => {
    const room = addUserToRoom(socket.id, data.name, data.roomname);
    // console.log(room)
    socket.join(room.name);
    socket.emit('roomJoined', {roomname: room.name, username: data.name, cards: room.cards});
  });
  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
    removeUserFromRoom(socket.id);
  });
  socket.emit('activeRooms', getAllRooms());
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
