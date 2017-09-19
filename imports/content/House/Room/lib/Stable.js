export default {
  id: 'House/Room/Stable',
  isUnique: true,
  title: 'Хлев',
  description: 'Настоящий правитель не ездит на работу кортежем с мигалками, настоящий правитель спрашивает: Когда будет автобус до центра? Ах ну и да, настоящий правитель ещё должен жить в хлеву, тогда он будет максимально близок к народу.',
  effects: {
    Price: [
      {
        textBefore: 'Снижает стоимость постройки на ',
        textAfter: '%',
        priority: 2,
        affect: ['metals', 'crystals'],
        result() {
          return 1;
        },
      },
    ],
  },
};
