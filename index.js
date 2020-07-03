const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const {
  validateRoomname,
  createRoom,
  getAllRooms,
  removeUserFromRoom,
  addUserToRoom,
  tickCard,
  resetTicked,
  validatePassword,
  createCustomRoom,
  addCustomCardsToRoom,
  addCardOrder,
} = require('./utils/socketHandler');
const { getCardFromId, getCardsForZones } = require('./utils/bingoCardsHandler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.origins('*:*');

io.on('connection', (socket) => {
  console.log(`New connection from: ${socket.id}`);

  socket.on('create', (data) => {
    console.log(`Socket: ${socket.id} is trying to create a room`);
    try {
      validateRoomname(data.room);
      const room = createRoom(socket.id, data.name, data.room, data.password, data.zones);
      const { name } = room.users[0];

      console.log(`Socket: ${socket.id} created room "${room.name}"`);
      socket.emit('roomCreated', {
        room: room.name, name, cards: room.cards, users: room.users,
      });
      io.emit('activeRooms', getAllRooms());
      socket.join(room.name);
    } catch (error) {
      socket.emit('roomCreationError', error.message);
    }
  });

  socket.on('createCustom', (data) => {
    console.log(`createCustom ${JSON.stringify(data)}`);
    try {
      validateRoomname(data.room);
      const room = createCustomRoom(socket.id, data.name, data.room, data.password);
      const { name } = room.users[0];
      const addedDefaultZones = data.zones.length === 0 ? ['bwl', 'mc', 'zg'] : data.zones;

      socket.emit('customRoomCreated', {
        room: room.name, name, cards: getCardsForZones(addedDefaultZones),
      });
    } catch (error) {
      socket.emit('roomCreationError', error.message);
    }
  });

  socket.on('customCards', (data) => {
    try {
      const cards = data.cards.map((v) => ({ ...v, data: v.data.trim(), ticked: false }));
      const roomname = data.room;

      const room = addCustomCardsToRoom(roomname, cards);
      socket.emit('customRoomCreated', {
        room: room.name, cards: room.cards, users: room.users,
      });
      io.emit('activeRooms', getAllRooms());
      socket.join(room.name);
    } catch (error) {
      console.log(error);
      socket.emit('customRoomCreationError', 'Something went wrong please try again');
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

  socket.on('cardOrder', (data) => {
    const { idOrder, room } = data;
    const user = addCardOrder(socket.id, idOrder, room);
    io.to(room).emit('newCardOrder', user);
  });

  socket.on('usertick', (data) => {
    const { index, name: room, id } = data;
    const card = getCardFromId(id);
    const user = tickCard({ id: socket.id, index, room });
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

app.use((req, res) => {
  res.redirect('/');
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
