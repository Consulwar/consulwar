export default {
  id: 'Achievement/General/Trader',
  field: 'Resources/Bought/Total',
  levels: [100000000],
  title: 'Торговец',
  description: 'Выторговать любых ресурсов на 100 000К за всё время',
  effects: {
    Special: [
      {
        textBefore: '+',
        textAfter: '% к выгодной сделке',
        priority: 2,
        condition: 'Unique/tradingBonus',
        affect: 'amount',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 10 : 0;
        },
      },
    ],
  },
};
