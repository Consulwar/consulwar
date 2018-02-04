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
        result(level) {
          return level * 0.5;
        },
      },
      {
        textBefore: 'Максимальный бонус ресурсов +',
        textAfter: '%',
        notImplemented: true,
        result(level) {
          return [0, 10, 25, 50, 75, 100][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5, 'slowExponentialGrow', 0],
      crystals: [5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [20, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [20, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.weaponParts = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nanoWires = [6, 'slowLinearGrow', 60];
    } else {
      price.ancientKnowledge = [4, 'slowLinearGrow', 80];
    }
    return price;
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
