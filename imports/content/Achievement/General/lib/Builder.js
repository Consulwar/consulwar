export default {
  id: 'Achievement/General/Builder',
  field: 'Building/Total',
  levels: [100, 250, 500, 750, 1000],
  title: [
    'Градостроитель 1 степени',
    'Градостроитель 2 степени',
    'Градостроитель 3 степени',
    'Градостроитель 4 степени',
    'Градостроитель 5 степени',
  ],
  description: [
    'Построить 100 зданий',
    'Построить 250 зданий',
    'Построить 500 зданий',
    'Построить 750 зданий',
    'Построить 1000 зданий',
  ],
  effects: {
    Income: [
      {
        textBefore: 'Приток населения +',
        textAfter: ' человек в час',
        priority: 1,
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return [1, 2.5, 5, 7.5, 10][level - 1];
        },
      },
    ],
  },
};
