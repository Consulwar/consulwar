export default {
  id: 'Building/Residential/TradingPort',
  title: 'Торговый порт',
  description: 'Торговля была основой благосостояния во все времена, и сейчас ничего не поменялось. В военное время крайне важно вести дела с другими колониями, подконтрольными системе Галактического Совета, или даже с независимыми планетами. Вашей колонии есть что предложить, а другие могут помочь вам в достижении вашей цели. Торговый порт обеспечит быстрый доступ к ресурсам и позволит их обменять.',
  effects: {
    Special: [
      {
        textBefore: '',
        textAfter: '% к выгодной сделке',
        priority: 2,
        condition: 'Unique/tradingBonus',
        affect: 'amount',
        result({ level }) {
          return level * 0.5;
        },
      },
    ],
  },
  basePrice: {
    group: 'fleet',
    tier: 2,
    humans: 12,
    metals: 2,
    crystals: 1.5,
    honor: 16,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/SpacePort', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/SpacePort', 24],
        ['Building/Military/Storage', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/SpacePort', 38],
        ['Building/Military/Storage', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/SpacePort', 38],
        ['Building/Military/Storage', 30],
        ['Research/Evolution/Hyperdrive', 52],
      ];
    }
    return [
      ['Building/Residential/SpacePort', 68],
      ['Building/Military/Storage', 50],
      ['Research/Evolution/Hyperdrive', 67],
    ];
  },
};
