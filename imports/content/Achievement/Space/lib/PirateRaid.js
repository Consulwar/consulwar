export default {
  id: 'Achievement/Space/PirateRaid',
  field: 'Battle/PatrolFleet/7/Victory',
  levels: [1],
  title: 'Пиратский рейд',
  description: 'Победить патруль 7 уровня',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Урон на третьей атаке +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/roundDamage3',
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
