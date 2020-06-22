const {
  createRoom, validateRoomname, getAllRooms, removeAllRooms, getRoom, removeUserFromRoom, addUserToRoom,
} = require('../utils/socketHandler');

describe('socketHandler', () => {
  afterEach(() => {
    removeAllRooms();
  });
  describe('validateRoomname', () => {
    test('should not throw error if the roomname is not taken', () => {
      createRoom('1', 'test', 'room', '', []);
      expect(() => validateRoomname('rooom')).not.toThrow();
    });
    test('should throw error if roomname is taken', () => {
      createRoom('1', 'test', 'room', '', []);
      expect(() => validateRoomname('room')).toThrow('Roomname already in use');
    });
  });
  describe('createRoom', () => {
    test('should should correctly add room', () => {
      createRoom('1', 'test', 'room', '', []);
      createRoom('1', 'test', 'room2', 'hej', []);
      expect(getAllRooms()).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'room', password: false, users: expect.arrayContaining([expect.objectContaining({ name: 'test', id: '1' })]) })]));
      expect(getAllRooms()).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'room2', password: true })]));
    });
    test('should add cards correctly', () => {
      createRoom('1', 'test', 'room', '', ['mc']);
      createRoom('1', 'test', 'room2', '', ['zg']);
      expect(getRoom('room').cards.every((v) => v.zones.includes('mc'))).toBe(true);
      expect(getRoom('room').cards.length).toBe(16);
      expect(getRoom('room2').cards.every((v) => v.zones.includes('zg'))).toBe(true);
      expect(getRoom('room2').cards.length).toBe(16);
    });
  });
  describe('removeAllRooms', () => {
    test('should remove all rooms', () => {
      createRoom('1', 'test', 'room', '', []);
      removeAllRooms();
      expect(getAllRooms()).toStrictEqual([]);
    });
  });
  describe('getRoom', () => {
    test('should get specific room', () => {
      createRoom('1', 'test', 'room', 'hej', ['bwl']);
      createRoom('1', 'test', 'room2', 'hej2', ['mc']);
      expect(getRoom('room')).toEqual(expect.objectContaining({ name: 'room', password: 'hej' }));
      expect(getRoom('room2')).toEqual(expect.objectContaining({ name: 'room2', password: 'hej2' }));
    });
  });
  describe('addUserToRoom', () => {
    test('should add user to the room', () => {
      createRoom('1', 'user', 'room', '', ['bwl']);
      addUserToRoom('2', 'user2', 'room');
      expect(getRoom('room')).toEqual(expect.objectContaining({ users: expect.arrayContaining([{ name: 'user', id: '1' }, { name: 'user2', id: '2' }]) }));
    });
  });
  describe('removeUserFromRoom', () => {
    test('should remove specific user from room', () => {
      createRoom('1', 'user', 'room', '', ['bwl']);
      addUserToRoom('2', 'user2', 'room');
      removeUserFromRoom('1');
      expect(getRoom('room')).toEqual(expect.objectContaining({ name: 'room', users: [{ id: '2', name: 'user2' }] }));
    });
    test('should remove the room if no more users in it', () => {
      createRoom('1', 'user', 'room', '', ['bwl']);
      removeUserFromRoom('1');
      expect(getAllRooms()).toStrictEqual([]);
    });
  });
});
