import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Residential/SpacePort',
  title: 'Космопорт',
  description: 'Гражданский Космопорт – это удобное и полезное здание для связи с внешним миром; что-то вроде аэропорта, только используется для гражданских рейсов на далёкие дистанции. Именно через Космопорт к вам на планету сможет попасть больше людей, Консул. Космопорт также служит системой мониторинга космоса, этакая диспетчерская радиорубка галактики на вашей планете.',
  effects: {
    Special: [
      {
        textBefore: 'Строительство лёгких кораблей быстрее на ',
        textAfter: '%',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Гаммадронов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Gammadrone',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Ос быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Wasp',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Миражей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Mirage',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Рейлганов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Railgun',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Турелей на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/Turret',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'aviation',
    tier: 2,
    humans: 4,
    metals: 12,
    crystals: 4,
    honor: 20,
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
