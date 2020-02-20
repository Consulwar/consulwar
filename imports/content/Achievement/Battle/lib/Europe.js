export default {
  id: 'Achievement/Battle/Europe',
  levels: [1, 2, 3],
  title: [
    'Шлем освободителя 1 степени',
    'Шлем освободителя 2 степени',
    'Шлем освободителя 3 степени',
  ],
  description: 'Загорал на пляжах Европы',
  effects: {
    Military: [
      {
        textBefore: 'Урон наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 10,
        affect: 'damage',
        result({ level }) {
          return [15, 25, 40][level - 1];
        },
      },
      {
        textBefore: 'Жизни наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 10,
        affect: 'life',
        result({ level }) {
          return [15, 25, 40][level - 1];
        },
      },
    ],
  },
};
