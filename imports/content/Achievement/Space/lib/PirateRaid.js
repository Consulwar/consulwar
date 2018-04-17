export default {
  id: 'Achievement/Space/PirateRaid',
  field: 'Battle/PatrolFleet/7/Victory',
  levels: [1],
  title: 'Пиратский рейд',
  description: 'Победить патруль 7 уровня',
  effects: {
    Military: [
      {
        textBefore: 'Урон Флагмана +',
        condition: 'Unit/Human/Space/Flagship',
        priority: 1,
        affect: 'damage',
        result({ level }) {
          return (level > 0) ? 20000 : 0;
        },
      },
    ],
  },
};
