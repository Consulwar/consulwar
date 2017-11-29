export default {
  id: 'Achievement/Communication/Winner',
  title: 'Победитель',
  description: 'Победить в любом конкурсе от Консулов',
  effects: {
    Price: [
      {
        textBefore: 'Стоимость подготовки наземных войск на ',
        textAfter: '% дешевле',
        condition: 'Unit/Human/Ground',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
