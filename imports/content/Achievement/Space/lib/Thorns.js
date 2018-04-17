export default {
  id: 'Achievement/Space/Thorns',
  title: 'У розы есть шипы',
  description: 'Был готов к жертвам',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' людей в час',
        priority: 1,
        affect: 'humans',
        result({ level }) {
          return (level > 0) ? 50 : 0;
        },
      },
    ],
  },
};
