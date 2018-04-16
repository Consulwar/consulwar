export default {
  id: 'Achievement/General/Tits',
  title: 'Сиськи',
  description: 'Нашёл все сиськи в игре',
  effects: {
    Special: [
      {
        priority: 1,
        result({ level }) {
          return level ? 'молодец!' : '';
        },
      },
    ],
  },
};
