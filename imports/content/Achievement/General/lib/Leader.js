export default {
  notImplemented: true,
  id: 'Achievement/General/Leader',
  // field: 'statue.gained.honor',
  levels: [100000],
  title: 'Вождь',
  description: 'Заработать 100 000 чести от статуи консула',
  effects: {
    Special: [
      {
        notImplemented: true,
        textAfter: ' рандомный белый итем в день',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 1 : 0;
        },
      },
    ],
  },
};
