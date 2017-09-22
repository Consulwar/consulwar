export default {
  id: 'Achievement/General/Helper',
  title: 'Помощь проекту',
  description: 'Помогал проекту',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 1 : 0;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Чат дешевле на ',
        textAfter: '%',
        priority: 6,
        condition: 'Unique/message',
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 100 : 0;
        },
      },
    ],
  },
};
