export default {
  id: 'Achievement/Space/BraveCaptain',
  field: 'Battle/DefenseFleet/10/Victory',
  levels: [1],
  name: 'Смелый капитан',
  description: 'Победить оборону 10 уровня',
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
