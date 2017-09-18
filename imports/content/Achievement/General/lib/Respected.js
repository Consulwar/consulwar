export default {
  id: 'Achievement/General/Respected',
  field: 'Resources/Spent/Honor',
  levels: [10000000],
  title: 'Почитаемый',
  description: 'Потратить 10 000К чести',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 100 : 0;
        },
      },
    ],
  },
};
