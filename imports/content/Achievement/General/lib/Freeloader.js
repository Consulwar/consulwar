export default {
  id: 'Achievement/General/Freeloader',
  field: 'Promocode/Total',
  levels: [100],
  title: 'Халявщик',
  description: 'Набивал карманы казённым золотом',
  effects: {
    ProfitOnce: [
      {
        notImplemented: true,
        textBefore: 'Все донатные усиления включаются на ',
        textAfter: ' месяц',
        result(level) {
          return (level > 0) ? 1 : 0;
        },
      },
    ],
  },
};
