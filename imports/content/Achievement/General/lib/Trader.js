export default {
  id: 'Achievement/General/Trader',
  field: 'resources.bought.total',
  levels: [1000000],
  title: 'Торговец',
  description: 'Выторговать любых ресурсов на 1 000 000 за всё время',
  effects: {
    Special: [
      {
        textBefore: '+',
        textAfter: '% к выгодной сделке',
        priority: 2,
        condition: 'Unique/tradingBonus',
        affect: 'amount',
        result({ level }) {
          return (level > 0) ? 10 : 0;
        },
      },
    ],
  },
};
