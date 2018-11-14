export default {
  id: 'Achievement/Space/Thorns',
  levels: [1, 2, 3],
  title: [
    'У розы есть шипы 1 степени',
    'У розы есть шипы 2 степени',
    'У розы есть шипы 3 степени',
  ],
  description: 'Был готов к жертвам',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' людей в час',
        priority: 1,
        affect: 'humans',
        result({ level }) {
          return (level > 0) ? 25 * (1 + level) : 0;
        },
      },
    ],
  },
};
