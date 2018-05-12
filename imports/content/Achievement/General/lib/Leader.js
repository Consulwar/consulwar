export default {
  id: 'Achievement/General/Leader',
  field: 'resources.gained.honor',
  levels: [100000000],
  title: 'Вождь',
  description: 'Заработать 100 000 000 чести',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result({ level }) {
          return (level > 0) ? 20 : 0;
        },
      },
    ],
  },
};
