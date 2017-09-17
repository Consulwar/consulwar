export default {
  id: 'Achievement/Space/LeprechaunKiller',
  field: 'Battle/TradeFleet/Victory',
  levels: [10],
  name: 'Убийца леприконов',
  description: '10 раз уничтожить караван',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Награда за уничтожение каравана +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/TradeFleetBonus',
        affect: ['crystals', 'metals'],
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 10 : 0;
        },
      },
    ],
  },
};
