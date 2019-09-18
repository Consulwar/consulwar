export default {
  id: 'Achievement/Communication/Winner',
  title: 'Победитель',
  description: 'Победить в любом конкурсе от Консулов',
  effects: {
    Price: [
      {
        textBefore: 'Подготовка наземных войск дешевле на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 2,
        affect: ['metals', 'crystals'],
        result({ level }) {
          return (level > 0) ? 5 : 0;
        },
      },
    ],
  },
};
