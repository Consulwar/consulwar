import Mirage from '/imports/content/Unit/Space/Human/lib/Mirage';

export default {
  id: 'Research/Fleet/Mirage',
  title: 'Усиление Миража',
  description: 'Мираж разрабатывался как корабль-невидимка, но, к сожалению, на все 100% этого достичь не удалось, и вряд ли удастся в ближайшее время. Однако, чем больше средств будет направлено на разработку усилений и улучшений данного корабля, тем мощнее будет его вооружение, его броня, а самое главное – его система «стелс». Таким образом, Мираж сможет избегать урона во время атаки, при этом сам будет неукоснительно карать своих врагов.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Миража +',
        condition: 'Unit/Space/Human/Mirage',
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 3;
          } else if (level < 100) {
            return level * 6;
          }
          return level * 12;
        },
      },
      {
        textBefore: 'Броня Миража +',
        condition: 'Unit/Space/Human/Mirage',
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 5;
          } else if (level < 100) {
            return level * 10;
          }
          return level * 20;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [20, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Mirage.requirements,
};
