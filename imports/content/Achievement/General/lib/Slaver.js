export default {
  id: 'Achievement/General/Slaver',
  field: 'Resources/Spent/Humans',
  levels: [100000000],
  title: 'Работорговец',
  description: 'Потратить 100 000К людей',
  effects: {
    Income: [
      {
        textBefore: 'Приток населения +',
        textAfter: ' человек в час',
        priority: 1,
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 3000 : 0;
        },
      },
    ],
  },
};
