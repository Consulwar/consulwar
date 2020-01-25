export default {
  id: 'Achievement/General/Pesduk',
  title: 'Мой песдюк',
  description: 'Вырастил песдюка на свою голову',
  effects: {
    Special: [
      {
        textBefore: 'Песдюк теперь живёт на вашей колонии',
        priority: 1,
        result() {},
      },
    ],
  },
};
