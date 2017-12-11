export default {
  id: 'Achievement/Space/CarryingLight',
  field: 'Reptiles/Killed/Reptiles/Fleet/Shadow',
  levels: [10],
  title: 'Несущий свет',
  description: 'Уничтожить 10 кораблей Тень',
  effects: {
    Military: [
      {
        textBefore: 'Урон Флагмана +',
        condition: 'Unit/Human/Space/Flagship',
        priority: 2,
        affect: 'damage',
        result(level) {
          return (level > 0) ? 2 : 0;
        },
      },
    ],
  },
};
