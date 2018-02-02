export default {
  id: 'Achievement/Space/MadAdmiral',
  field: 'Battle/BattleFleet/7/Victory',
  levels: [1],
  title: 'Безбашенный адмирал',
  description: 'Победить боевой флот 7 уровня',
  effects: {
    Military: [
      {
        textBefore: 'Урон Флагмана +',
        condition: 'Unit/Human/Space/Flagship',
        priority: 1,
        affect: 'damage',
        result(level) {
          return (level > 0) ? 50000 : 0;
        },
      },
    ],
  },
};
