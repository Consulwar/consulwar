export default {
  id: 'Achievement/General/Tolstoy',
  title: 'Лев Толстой',
  description: 'Не на словах, а на деле!',
  effects: {
    Military: [
      {
        textBefore: '+',
        textAfter: '% к урону флагмана',
        condition: 'Unit/Human/Space/Flagship',
        priority: 4,
        affect: 'damage',
        result({ level }) {
          return level ? 10 : 0;
        },
      },
    ],
  },
};
