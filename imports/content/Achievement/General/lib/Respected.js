export default {
  id: 'Achievement/General/Respected',
  field: 'resources.spent.honor',
  levels: [1000000],
  title: 'Почитаемый',
  description: 'Потратить 1 000 000 чести',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result({ level }) {
          return (level > 0) ? 10 : 0;
        },
      },
    ],
  },
};
