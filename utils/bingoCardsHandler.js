const { bingoData } = require('../data/bingoData');

const getAllCards = () => bingoData;

const arrayShuffle = (array) => {
  const tempArr = [...array];
  for (let i = tempArr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
  }
  return tempArr;
};

const getCardsForZones = (zones) => {
  const filteredCards = arrayShuffle(getAllCards())
    .filter((card) => card.zones.some((r) => zones.includes(r)));
  return filteredCards;
};

const getAmount = (amount, array) => array.slice(0, amount);

const getCardFromId = (id) => bingoData.find((card) => card.id === id);

module.exports = {
  getAllCards,
  arrayShuffle,
  getCardsForZones,
  getAmount,
  getCardFromId,
};
