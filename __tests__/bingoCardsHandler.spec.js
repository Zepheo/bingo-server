const {
  getAllCards, arrayShuffle, getCardsForZones, getAmount, getCardFromId,
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
  describe('getCardFromId', () => {
    test('should return correct card', () => {
      expect(getCardFromId(1)).toEqual(expect.objectContaining({
        id: 1,
        data: '"Moimoi loggar du?"',
        ticked: false,
        zones: ['bwl', 'mc', 'zg'],
      }));
      expect(getCardFromId(4)).toEqual(expect.objectContaining({
        id: 4,
        data: 'Cee overaggrar',
        ticked: false,
        zones: ['bwl', 'mc', 'zg'],
      }));
    });
  });
});
