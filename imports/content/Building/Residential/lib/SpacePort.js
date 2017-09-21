export default {
  id: 'Building/Residential/SpacePort',
  title: 'Космопорт',
  description: 'Гражданский Космопорт – это удобное и полезное здание для связи с внешним миром; что-то вроде аэропорта, только используется для гражданских рейсов на далёкие дистанции. Именно через Космопорт к вам на планету сможет попасть больше людей, Консул. Космопорт также служит системой мониторинга космоса, этакая диспетчерская радиорубка галактики на вашей планете.',
  effects: {
    Price: [
      {
        textBefore: 'Уменьшает цену контейнера на ',
        textAfter: ' ГГК',
        affect: 'credits',
        priority: 1,
        condition: 'Unique/containerPrice',
        result(level = this.getCurrentLevel()) {
          return level * 1;
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
        ['Building/Residential/House', 20],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/House', 30],
        ['Research/Evolution/Alloy', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/House', 40],
        ['Research/Evolution/Alloy', 25],
        ['Research/Evolution/Energy', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/House', 50],
        ['Research/Evolution/Alloy', 35],
        ['Research/Evolution/Energy', 50],
        ['Building/Military/Airfield', 40],
      ];
    }
    return [
      ['Building/Residential/House', 70],
      ['Research/Evolution/Alloy', 45],
      ['Research/Evolution/Energy', 70],
      ['Building/Military/Airfield', 70],
    ];
  },
};
