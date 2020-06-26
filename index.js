const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const {
  validateRoomname,
  createRoom,
  getAllRooms,
  removeUserFromRoom,
  addUserToRoom,
  tickCard,
  resetTicked,
  validatePassword,
} = require('./utils/socketHandler');
const { getCardFromId } = require('./utils/bingoCardsHandler');

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

      socket.emit('roomCreated', {
        room: room.name, name, cards: room.cards, users: room.users,
      });
      io.emit('activeRooms', getAllRooms());
      socket.join(room.name);
    } catch (error) {
      socket.emit('roomCreationError', error.message);
    }
  });

  socket.on('join', (data) => {
    try {
      validatePassword(data.roomname, data.password);
      const { room, user } = addUserToRoom(socket.id, data.name, data.roomname);

      socket.join(room.name);
      socket.to(room.name).broadcast.emit('userJoined', { id: socket.id, name: user.name, ticked: user.ticked });
      socket.emit('roomJoined', {
        room: room.name, name: user.name, cards: room.cards, users: room.users,
      });
    } catch (error) {
      socket.emit('passwordError', error.message);
    }
  });

  socket.on('usertick', (data) => {
    const { index, name: room, id } = data;
    const card = getCardFromId(id);
    const user = tickCard({ id: socket.id, index, room });
    // const { users } = getRoom(room);
    user.logMsg = `${user.name} ${user.ticked[index] ? 'checked' : 'unchecked'} the card "${card.data}"`;
    io.to(room).emit('ticked', user);
  });

  socket.on('resetTicked', (room) => {
    const user = resetTicked(socket.id, room);
    io.to(room).emit('ticked', user);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
    removeUserFromRoom(socket.id);
    io.emit('activeRooms', getAllRooms());
  });

  socket.emit('activeRooms', getAllRooms());
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
