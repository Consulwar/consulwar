export default {
  id: 'House/Throne/StripStool',
  isUnique: true,
  title: 'Трон',
  description: 'Coming soon',
  effects: {
    Price: [
      {
        textBefore: 'Подготовка наземных войск дешевле на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 2,
        affect: ['metals', 'crystals'],
        result() {
          return 5;
        },
      },
    ],
  },
};
