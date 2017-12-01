export default {
  id: 'House/Room/Cruel',
  title: 'Тронный Зал Жестокости',
  description: '«Твоя душа принадлежит мне!» – сказал Консул и проломил голову поганому рептилоиду. Именно такие фильмы показывают в наших кинотеатрах. Что ж, жестокость важна для поддержания ненависти к Рептилиям. Похоже, вам не помешало бы и Тронный Зал оформить в таком же стиле.',
  effects: {
    Military: [
      {
        textBefore: 'Урон флота +',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 2,
        affect: 'damage',
        result() {
          return 2;
        },
      },
    ],
  },
  price: {
    credits: 1000,
  },
};
