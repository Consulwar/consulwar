export default {
  id: 'Achievement/General/Boomstarter',
  title: 'Бумстартер',
  description: 'Помогал проекту на бумстартере',
  effect: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' металла в час',
        priority: 1,
        affect: 'metals',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 1000 : 0;
        },
      },
      {
        textBefore: '+',
        textAfter: ' кристаллов в час',
        priority: 1,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 300 : 0;
        },
      },
    ],
  },
};
