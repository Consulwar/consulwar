export default {
  id: 'Achievement/Space/LeprechaunKiller',
  field: 'battle.tradefleet.victory',
  levels: [10],
  title: 'Убийца леприконов',
  description: '10 раз уничтожить караван',
  effects: {
    Military: [
      {
        textBefore: 'Броня Флагмана +',
        condition: 'Unit/Human/Space/Flagship',
        priority: 1,
        affect: 'life',
        result({ level }) {
          return (level > 0) ? 50000 : 0;
        },
      },
    ],
  },
};
