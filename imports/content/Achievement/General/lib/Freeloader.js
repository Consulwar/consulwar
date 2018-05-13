export default {
  id: 'Achievement/General/Freeloader',
  field: 'promocode.total',
  levels: [100],
  title: 'Халявщик',
  description: 'Набивал карманы казённым золотом',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' ГГК в час',
        priority: 1,
        affect: 'credits',
        result({ level }) {
          return (level > 0) ? 0.02 : 0;
        },
      },
    ],
  },
};
