export default {
  id: 'Achievement/Space/BraveCaptain',
  field: 'Battle/DefenseFleet/7/Victory',
  levels: [1],
  title: 'Смелый капитан',
  description: 'Победить оборону 7 уровня',
  effects: {
    Military: [
      {
        textBefore: 'Урон Флагмана +',
        condition: 'Unit/Human/Space/Flagship',
        priority: 1,
        affect: 'damage',
        result({ level }) {
          return (level > 0) ? 30000 : 0;
        },
      },
    ],
  },
};
