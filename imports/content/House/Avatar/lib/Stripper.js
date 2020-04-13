export default {
  id: 'House/Avatar/Stripper',
  isUnique: true,
  title: 'Стриптизёрша',
  description: 'Консул может заказать себе любой робот-аватар. Так почему бы не заказать себе аватар с сиськами, большими, круглыми и упругими. Подобный аватар вполне может улучшить вашу позицию на торговых переговорах. И не спрашивайте как.',
  effects: {
    Special: [
      {
        textBefore: '',
        textAfter: '% к выгодной сделке',
        priority: 2,
        condition: 'Unique/tradingBonus',
        affect: 'amount',
        result() {
          return 2;
        },
      },
    ],
  },
};
