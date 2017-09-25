import Battleship from '/imports/content/Unit/Space/Human/lib/Battleship';

export default {
  id: 'Research/Fleet/Battleship',
  title: 'Усиление Линкора',
  description: 'Линкоры – это броня нашего флота. Его усиление просто необходимо, иначе Линкоры не смогут держать столько урона, сколько потребуется в сражениях против мощных кораблей Чешуйчатых. Мы также сможем разработать новые листы корпуса для кораблей класса Линкор, и эти листы позволят им получать гораздо меньше урона от всех типов атак, что сделает эти корабли настоящими космическими крепостями.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Линкора +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Battleship',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Линкора +',
        textAfter: '%',
        condition: 'Unit/Space/Human/Battleship',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [80, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Battleship.requirements,
};
