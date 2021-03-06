export default {
  id: 'Achievement/General/Metallurgist',
  field: 'resources.spent.metals',
  levels: [1000000],
  title: 'Металлург',
  description: 'Потратить 1 000 000 металла',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' металла в час',
        priority: 1,
        affect: 'metals',
        result({ level }) {
          return (level > 0) ? 25 : 0;
        },
      },
    ],
  },
};
