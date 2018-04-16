export default {
  id: 'Achievement/General/CrystalKing',
  field: 'Resources/Spent/Crystals',
  levels: [1000000],
  title: 'Кристальный Король',
  description: 'Потратить 1 000 000 кристаллов',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' кристаллов в час',
        priority: 1,
        affect: 'crystals',
        result({ level }) {
          return (level > 0) ? 20 : 0;
        },
      },
    ],
  },
};
