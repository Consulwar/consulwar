export default {
  id: 'Achievement/General/Metallurgist',
  field: 'Resources/Spent/Metals',
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
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 25 : 0;
        },
      },
    ],
  },
};
