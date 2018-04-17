export default {
  id: 'Achievement/General/Boomstarter',
  title: 'Бумстартер',
  description: 'Помогал проекту на бумстартере',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' металла в час',
        priority: 1,
        affect: 'metals',
        result({ level }) {
          return (level > 0) ? 10 : 0;
        },
      },
      {
        textBefore: '+',
        textAfter: ' кристаллов в час',
        priority: 1,
        affect: 'crystals',
        result({ level }) {
          return (level > 0) ? 3 : 0;
        },
      },
    ],
  },
};
