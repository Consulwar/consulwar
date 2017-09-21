export default {
  id: 'Achievement/General/Slaver',
  field: 'Resources/Spent/Humans',
  levels: [1000000],
  title: 'Работорговец',
  description: 'Потратить 1 000 000 людей',
  effects: {
    Income: [
      {
        textBefore: 'Приток населения +',
        textAfter: ' человек в час',
        priority: 1,
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 30 : 0;
        },
      },
    ],
  },
};
