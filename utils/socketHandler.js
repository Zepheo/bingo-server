const { getCardsForZones, getAmount } = require('./bingoCardsHandler');

const rooms = [];

const trimName = (name) => name.trim();

const validateRoomname = (roomname) => {
  const roomExists = rooms.find((room) => room.name.toLowerCase() === roomname.toLowerCase());
  if (roomExists) throw new Error('Roomname already in use');
};

const createRoom = (userId, username, roomname, password, zones) => {
  const trimmedUsername = trimName(username);
  const trimmedRoomname = trimName(roomname);

  const addedDefaultZones = zones.length === 0 ? ['bwl', 'mc', 'zg'] : zones;

  const room = {
    name: trimmedRoomname,
    password,
    users: [
      {
        id: userId,
        name: trimmedUsername,
      },
    ],
    cards: getAmount(16, getCardsForZones(addedDefaultZones)), // getCards(zones),
    zones: addedDefaultZones,
  };

  rooms.push(room);

  return room;
};

const getAllRooms = () => rooms;

const removeAllRooms = () => rooms.splice(0, rooms.length);

const getRoomIndex = (roomname) => (
  rooms.findIndex((room) => room.name.toLowerCase() === roomname.toLowerCase())
);

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
    rooms[indexOfRoom].users.push({ name, id });
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
  getAllRooms,
  validateRoomname,
  removeAllRooms,
  getRoom,
  removeRoom,
  addUserToRoom,
  removeUserFromRoom,
};
