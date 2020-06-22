const {
  getAllCards, arrayShuffle, getCardsForZones, getAmount,
} = require('../utils/bingoCardsHandler');

describe('bingoCardsHandler', () => {
  describe('getAllCards', () => {
    test('should return all cards', () => {
      expect(getAllCards().length).toEqual(26);
    });
  });
  describe('arrayShuffle', () => {
    test('should shuffle the array', () => {
      expect(arrayShuffle(getAllCards())).not.toEqual(getAllCards());
    });
  });
  describe('getCardsForZones', () => {
    test('should return only cards for the correct zone chosen', () => {
      expect(getCardsForZones(['bwl']).every((card) => card.zones.includes('bwl'))).toBe(true);
      expect(getCardsForZones(['mc']).every((card) => card.zones.includes('mc'))).toBe(true);
    });
  });
  describe('getAmount', () => {
    test('should return set amount of cards', () => {
      const cards = getAllCards();
      expect(getAmount(16, cards).length).toBe(16);
    });
  });
});
