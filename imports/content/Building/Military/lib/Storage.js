export default {
  id: 'Building/Military/Storage',
  title: 'Склад Cовета',
  description: 'Как вам уже известно, Великий Консул, за нашими действиями пристально следит Совет Галактики. Эти ребята только и ждут, чтобы уличить кого-нибудь в сговоре с Рептилоидами или в некомпетентности. Тем не менее закон обязывает их помогать новым Правителям вроде вас. Для удобства поставки ресурсов и постоянной связи с планетой Совета рекомендую рассмотреть вариант строительства данного Склада.',
  effects: {
    Special: [
      {
        textBefore: 'Поставка ресурсов за ежедневные задания +',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/dailyQuestReward',
        affect: ['crystals', 'metals'],
        result(level) {
          return level * 0.5;
        },
      },
      {
        textBefore: 'Заданий в сутки: ',
        textAfter: '',
        priority: 1,
        condition: 'Unique/dailyQuestCount',
        affect: 'count',
        result(level) {
          return [1, 2, 3, 4, 5, 6][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [7.5, 'slowExponentialGrow', 0],
      crystals: [7.5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [100, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [25, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.ReptileTechnology = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.PlasmaTransistors = [5, 'slowLinearGrow', 60];
    } else {
      price.garyoldmanium = [5, 'slowLinearGrow', 80];
    }
    return price;
  },
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
