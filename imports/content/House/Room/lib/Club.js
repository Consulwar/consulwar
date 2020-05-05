export default {
  id: 'House/Room/Club',
  isUnique: true,
  title: 'Палата',
  description: 'Coming soon',
  effects: {
    Price: [
      {
        textBefore: 'Строительство наземных войск быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 12,
        affect: 'time',
        result() {
          return 5;
        },
      },
    ],
  },
};
