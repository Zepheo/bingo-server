const {
  createRoom,
  validateRoomname,
  getAllRooms,
  removeAllRooms,
  getRoom,
  removeUserFromRoom,
  addUserToRoom,
  validatePassword,
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
      expect(getRoom('room').cards.length).toBe(24);
      expect(getRoom('room2').cards.every((v) => v.zones.includes('zg'))).toBe(true);
      expect(getRoom('room2').cards.length).toBe(24);
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
      expect(getRoom('room')).toEqual(expect.objectContaining({ users: expect.arrayContaining([expect.objectContaining({ name: 'user', id: '1' })]) }));
    });
  });
  describe('removeUserFromRoom', () => {
    test('should remove specific user from room', () => {
      createRoom('1', 'user', 'room', '', ['bwl']);
      addUserToRoom('2', 'user2', 'room');
      removeUserFromRoom('1');
      expect(getRoom('room')).toEqual(expect.objectContaining({ name: 'room', users: expect.arrayContaining([expect.objectContaining({ name: 'user2', id: '2' })]) }));
    });
    test('should remove the room if no more users in it', () => {
      createRoom('1', 'user', 'room', '', ['bwl']);
      removeUserFromRoom('1');
      expect(getAllRooms()).toStrictEqual([]);
    });
  });
  describe('validatePassword', () => {
    test('should not throw if there is no password', () => {
      createRoom('1', 'user', 'room', '', ['bwl']);
      expect(() => validatePassword('room', '')).not.toThrow();
    });
    test('should throw if the password is wrong', () => {
      createRoom('1', 'user', 'room', 'test', ['bwl']);
      expect(() => validatePassword('room', '')).toThrow();
    });
    test('should not throw if the password is correct', () => {
      createRoom('1', 'user', 'room', 'test', ['bwl']);
      expect(() => validatePassword('room', 'test')).not.toThrow();
    });
    test('should be case sensitive', () => {
      createRoom('1', 'user', 'room', 'test', ['bwl']);
      expect(() => validatePassword('room', 'Test')).toThrow();
    });
    test('should check correct room', () => {
      createRoom('1', 'user', 'room', 'test', ['bwl']);
      createRoom('2', 'use2', 'room2', 'test2', ['bwl']);
      expect(() => validatePassword('room', 'test')).not.toThrow();
      expect(() => validatePassword('room', 'test2')).toThrow();
      expect(() => validatePassword('room2', 'test2')).not.toThrow();
      expect(() => validatePassword('room2', 'test')).toThrow();
    });
  });
});
