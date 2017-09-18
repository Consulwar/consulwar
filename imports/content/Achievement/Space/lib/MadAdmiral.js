export default {
  id: 'Achievement/Space/MadAdmiral',
  field: 'Battle/BattleFleet/10/Victory',
  levels: [1],
  name: 'Безбашенный адмирал',
  description: 'Победить боевой флот 10 уровня',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Урон на первой атаке +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/roundDamage1',
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
