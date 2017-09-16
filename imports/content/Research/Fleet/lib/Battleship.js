import Battleship from '/imports/content/Unit/Space/Human/lib/Battleship';

export default {
  id: 'Research/Fleet/Battleship',
  title: 'Усиление Линкора',
  description: 'Линкоры – это броня нашего флота. Его усиление просто необходимо, иначе Линкоры не смогут держать столько урона, сколько потребуется в сражениях против мощных кораблей Чешуйчатых. Мы также сможем разработать новые листы корпуса для кораблей класса Линкор, и эти листы позволят им получать гораздо меньше урона от всех типов атак, что сделает эти корабли настоящими космическими крепостями.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Линкора +',
        condition: {
          id: 'Unit/Space/Human/Battleship',
        },
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 25;
          } else if (level < 100) {
            return level * 50;
          }
          return level * 100;
        },
      },
      {
        textBefore: 'Броня Линкора +',
        condition: {
          id: 'Unit/Space/Human/Battleship',
        },
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 70;
          } else if (level < 100) {
            return level * 140;
          }
          return level * 280;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [800, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Battleship.requirements,
};
