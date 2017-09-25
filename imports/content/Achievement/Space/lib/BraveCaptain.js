export default {
  id: 'Achievement/Space/BraveCaptain',
  field: 'Battle/DefenseFleet/7/Victory',
  levels: [1],
  title: 'Смелый капитан',
  description: 'Победить оборону 7 уровня',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Урон на второй атаке +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/roundDamage2',
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
