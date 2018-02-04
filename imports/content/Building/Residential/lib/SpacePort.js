export default {
  id: 'Building/Residential/SpacePort',
  title: 'Космопорт',
  description: 'Гражданский Космопорт – это удобное и полезное здание для связи с внешним миром; что-то вроде аэропорта, только используется для гражданских рейсов на далёкие дистанции. Именно через Космопорт к вам на планету сможет попасть больше людей, Консул. Космопорт также служит системой мониторинга космоса, этакая диспетчерская радиорубка галактики на вашей планете.',
  effects: {
    Price: [
      {
        textBefore: 'Уменьшает цену контейнера на ',
        textAfter: ' ГГК',
        affect: ['credits', 'honor'],
        priority: 2,
        condition: 'Unique/containerPrice',
        result(level) {
          return level * 0.5;
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [3.75, 'slowExponentialGrow', 0],
      crystals: [1.95, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [100, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [8, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.ShipDetails = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.ReptileTechnology = [4, 'slowLinearGrow', 60];
    } else {
      price.chip = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/House', 8],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/House', 25],
        ['Research/Evolution/Alloy', 16],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/House', 35],
        ['Research/Evolution/Alloy', 26],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/House', 45],
        ['Research/Evolution/Alloy', 36],
        ['Research/Evolution/Hyperdrive', 55],
      ];
    }
    return [
      ['Building/Residential/House', 55],
      ['Research/Evolution/Alloy', 46],
      ['Research/Evolution/Hyperdrive', 65],
    ];
  },
};
