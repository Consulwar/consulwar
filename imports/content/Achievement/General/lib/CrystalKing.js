export default {
  id: 'Achievement/General/CrystalKing',
  field: 'Resources/Spent/Crystals',
  levels: [100000000],
  title: 'Кристальный Король',
  description: 'Потратить 100 000К кристаллов',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' кристаллов в час',
        priority: 1,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 2000 : 0;
        },
      },
    ],
  },
};
