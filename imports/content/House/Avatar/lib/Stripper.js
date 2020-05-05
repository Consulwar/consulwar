export default {
  id: 'House/Avatar/Stripper',
  isUnique: true,
  title: 'Аватар',
  description: 'Coming soon',
  effects: {
    Special: [
      {
        textBefore: '',
        textAfter: '% к выгодной сделке',
        priority: 2,
        condition: 'Unique/tradingBonus',
        affect: 'amount',
        result() {
          return 2;
        },
      },
    ],
  },
};
