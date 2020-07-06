const { getCardsForZones, getAmount } = require('./bingoCardsHandler');
const { amountOfCards } = require('../constants');

const rooms = [];

const trimName = (name) => name.trim();

const createTickedArray = () => {
  const tickedArray = Array(amountOfCards + 1).fill(false);
  tickedArray[12] = true;
  return tickedArray;
};

const validateRoomname = (roomname) => {
  const roomExists = rooms.find((room) => room.name.toLowerCase() === roomname.toLowerCase());
  if (roomExists) throw new Error('Roomname already in use');
};

const validatePassword = (roomname, password) => {
  const room = getRoom(roomname);
  if (room.password !== password) {
    throw new Error('Wrong password');
  }
};

const createRoom = (userId, username, roomname, password, zones) => {
  const trimmedUsername = trimName(username);
  const trimmedRoomname = trimName(roomname);

  const addedDefaultZones = zones.length === 0 ? ['bwl', 'mc', 'zg'] : zones;

  // const cards = getAmount(amountOfCards, getCardsForZones(addedDefaultZones));
  // cards.splice(12, 0, freeCard);

  const room = {
    name: trimmedRoomname,
    password,
    users: [
      {
        id: userId,
        name: trimmedUsername,
        ticked: createTickedArray(),
      },
    ],
    cards: getAmount(amountOfCards, getCardsForZones(addedDefaultZones)), // getCards(zones),
    zones: addedDefaultZones,
  };

  rooms.push(room);

  return room;
};

const createCustomRoom = (userId, username, roomname, password) => {
  const trimmedUsername = trimName(username);
  const trimmedRoomname = trimName(roomname);

  const room = {
    name: trimmedRoomname,
    password,
    users: [
      {
        id: userId,
        name: trimmedUsername,
        ticked: createTickedArray(),
      },
    ],
  };

  rooms.push(room);

  return room;
};

const getRoomIndex = (roomname) => (
  rooms.findIndex((room) => room.name.toLowerCase() === roomname.toLowerCase())
);

const addCustomCardsToRoom = (roomname, cards) => {
  const index = getRoomIndex(roomname);
  rooms[index].cards = cards;

  return rooms[index];
};

const getAllRooms = () => rooms.filter((room) => room.cards).map((room) => ({ ...room, password: Boolean(room.password) }));

const removeAllRooms = () => rooms.splice(0, rooms.length);

const getRoom = (roomname) => rooms.find((room) => room.name.toLowerCase() === roomname.toLowerCase());

const removeRoom = (roomname) => {
  const indexOfRoom = getRoomIndex(roomname);

  if (indexOfRoom !== -1) {
    return rooms.splice(indexOfRoom, 1)[0];
  }
};

const addUserToRoom = (id, name, room) => {
  const indexOfRoom = getRoomIndex(room);

  if (indexOfRoom !== -1) {
    const user = { name, id, ticked: createTickedArray() };
    rooms[indexOfRoom].users.push(user);
    return { room: rooms[indexOfRoom], user };
  }
};

const getUserIndex = (roomIndex, id) => (
  rooms[roomIndex].users.findIndex((user) => user.id === id)
);

const addCardOrder = (id, cardOrder, room) => {
  const indexOfRoom = getRoomIndex(room);
  if (indexOfRoom !== -1) {
    const indexOfUser = getUserIndex(indexOfRoom, id);

    if (indexOfUser !== -1) {
      const newTickedArray = rooms[indexOfRoom].users[indexOfUser].ticked
        .map((v, i) => {
          if (typeof v === 'boolean') return { ticked: v, id: cardOrder[i] };
          return { ticked: v.ticked, id: cardOrder[i] };
        });
      rooms[indexOfRoom].users[indexOfUser].ticked = newTickedArray;
      return rooms[indexOfRoom].users[indexOfUser];
    }
  }
};

const tickCard = ({ id, index, room }) => {
  const indexOfRoom = getRoomIndex(room);

  if (indexOfRoom !== -1) {
    const indexOfUser = getUserIndex(indexOfRoom, id);

    if (indexOfUser !== -1) {
      rooms[indexOfRoom].users[indexOfUser].ticked[index].ticked = !rooms[indexOfRoom].users[indexOfUser].ticked[index].ticked;
      return rooms[indexOfRoom].users[indexOfUser];
    }
  }
};

const resetTicked = (id, room) => {
  const indexOfRoom = getRoomIndex(room);

  if (indexOfRoom !== -1) {
    const indexOfUser = getUserIndex(indexOfRoom, id);

    if (indexOfUser !== -1) {
      rooms[indexOfRoom].users[indexOfUser].ticked.fill(false);
      rooms[indexOfRoom].users[indexOfUser].ticked[12] = true;
      return rooms[indexOfRoom].users[indexOfUser];
    }
  }
};

const removeUserFromRoom = (id) => {
  const indexOfRoom = rooms.findIndex((room) => room.users.some((user) => user.id === id));

  if (indexOfRoom !== -1) {
    const indexOfUser = rooms[indexOfRoom].users.findIndex((user) => user.id === id);

    if (indexOfUser !== -1) {
      const removedUser = rooms[indexOfRoom].users.splice(indexOfUser, 1)[0];

      const usersLeftInRoom = rooms[indexOfRoom].users.length;

      if (usersLeftInRoom < 1) {
        removeRoom(rooms[indexOfRoom].name);
      }
      return removedUser;
    }
  }
};

module.exports = {
  createRoom,
  createCustomRoom,
  getAllRooms,
  validateRoomname,
  removeAllRooms,
  getRoom,
  removeRoom,
  addUserToRoom,
  removeUserFromRoom,
  tickCard,
  resetTicked,
  validatePassword,
  addCustomCardsToRoom,
  addCardOrder,
};
