export default {
  id: 'Achievement/General/Tolstoy',
  title: 'Лев Толстой',
  description: 'Не на словах, а на деле!',
  effects: {
    Military: [
      {
        textBefore: '+',
        textAfter: '% к урону флагмана',
        condition: 'Unit/Space/Human/Flagship',
        priority: 4,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level ? 10 : 0;
        },
      },
    ],
  },
};
