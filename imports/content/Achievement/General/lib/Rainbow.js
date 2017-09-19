export default {
  id: 'Achievement/General/Rainbow',
  title: 'Радужный',
  description: 'Нашёл баг в игре и пользовался им, не сообщив, был наказан',
  effects: {
    Income: [
      {
        textAfter: '% от добычи ресурсов',
        priority: 6,
        affect: ['humans', 'metals', 'crystals', 'honor', 'credits'],
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? -10 : 0;
        },
      },
    ],
  },
};
