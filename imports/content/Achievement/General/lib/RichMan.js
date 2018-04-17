export default {
  id: 'Achievement/General/RichMan',
  field: 'Resources/Spent/Credits',
  levels: [100000],
  title: 'Богач',
  description: 'Потратить 100 000 ГГК',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' ГГК в час',
        priority: 1,
        affect: 'credits',
        result({ level }) {
          return (level > 0) ? 1 : 0;
        },
      },
    ],
  },
};
