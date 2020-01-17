import { tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Storage',
  title: 'Склад Совета',
  description: 'Как вам уже известно, Великий Консул, за нашими действиями пристально следит Совет Галактики. Эти ребята только и ждут, чтобы уличить кого-нибудь в сговоре с Рептилоидами или в некомпетентности. Тем не менее закон обязывает их помогать новым Правителям вроде вас. Для удобства поставки ресурсов и постоянной связи с планетой Совета рекомендую рассмотреть вариант строительства данного Склада.',
  effects: {
    Special: [
      {
        textBefore: 'Поставка ресурсов за ежедневные задания +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/dailyQuestReward',
        affect: ['crystals', 'metals'],
        result({ level }) {
          return level * 0.5;
        },
      },
      {
        textBefore: 'Заданий в сутки: ',
        textAfter: '',
        priority: 1,
        condition: 'Unique/dailyQuestCount',
        affect: 'count',
        result({ level }) {
          return [1, 2, 3, 4, 5, 6, 7][Math.floor(level / 20)];
        },
      },
    ],
    Price: [
      {
        textBefore: 'Доставка Трилинейных Кристалл-Ганов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/TripleCrystalGun',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'politic',
    tier: 3,
    humans: 20,
    metals: 100,
    crystals: 25,
    honor: 60,
  },
  plasmoidDuration: 60 * 60 * 24 * 28 * 2,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/PulseCatcher', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/PulseCatcher', 25],
        ['Research/Evolution/Ikea', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/PulseCatcher', 45],
        ['Research/Evolution/Ikea', 25],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/PulseCatcher', 55],
        ['Research/Evolution/Ikea', 44],
        ['Research/Evolution/AnimalWorld', 48],
      ];
    }
    return [
      ['Building/Residential/PulseCatcher', 72],
      ['Research/Evolution/Ikea', 65],
      ['Research/Evolution/AnimalWorld', 66],
    ];
  },
};
