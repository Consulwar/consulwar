export default {
  notImplemented: true,
  id: 'Achievement/General/Leader',
  // field: 'statue.gained.honor',
  levels: [1000000],
  title: 'Вождь',
  description: 'Заработать 1 000К чести от статуи консула',
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
