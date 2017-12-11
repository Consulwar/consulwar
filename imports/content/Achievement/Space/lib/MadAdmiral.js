export default {
  id: 'Achievement/Space/MadAdmiral',
  field: 'Battle/BattleFleet/7/Victory',
  levels: [1],
  title: 'Безбашенный адмирал',
  description: 'Победить боевой флот 7 уровня',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Урон на первой атаке +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/roundDamage1',
        affect: 'damage',
        result(level) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
