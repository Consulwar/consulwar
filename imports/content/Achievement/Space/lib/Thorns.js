export default {
  id: 'Achievement/Space/Thorns',
  levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  title: [
    'У розы есть шипы 1 степени',
    'У розы есть шипы 2 степени',
    'У розы есть шипы 3 степени',
    'У розы есть шипы 4 степени',
    'У розы есть шипы 5 степени',
    'У розы есть шипы 6 степени',
    'У розы есть шипы 7 степени',
    'У розы есть шипы 8 степени',
    'У розы есть шипы 9 степени',
    'У розы есть шипы 10 степени',
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
