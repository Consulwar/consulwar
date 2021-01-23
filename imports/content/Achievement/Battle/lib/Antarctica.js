export default {
  id: 'Achievement/Battle/Antarctica',
  title: 'Кубики льда',
  description: 'Пил колу со льдом с пингвинами',
  effects: {
    Military: [
      {
        textBefore: 'Урон наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 10,
        affect: 'damage',
        result({ level }) {
          return (level > 0) ? 10 : 0;
        },
      },
      {
        textBefore: 'Жизни наземной армии +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 10,
        affect: 'life',
        result({ level }) {
          return (level > 0) ? 20 : 0;
        },
      },
    ],
  },
};
