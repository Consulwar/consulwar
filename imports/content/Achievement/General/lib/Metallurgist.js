export default {
  id: 'Achievement/General/Metallurgist',
  field: 'Resources/Spent/Metals',
  levels: [100000000],
  title: 'Металлург',
  description: 'Потратить 100 000К металла',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' металла в час',
        priority: 1,
        affect: 'metals',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 2500 : 0;
        },
      },
    ],
  },
};
