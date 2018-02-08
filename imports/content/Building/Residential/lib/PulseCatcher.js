export default {
  id: 'Building/Residential/PulseCatcher',
  title: 'Импульсный уловитель',
  description: 'Импульсный уловитель – это специальное сооружение, предназначенное для сбора и распределения особой импульсной энергии. Подобная энергия не используется в Электростанции и не применяется в работе основных систем, однако особые физические свойства импульсной энергии позволяют использовать её в очень специфичных, но важных аспектах: например, в современной медицине.',
  effects: {
    Special: [
      {
        textBefore: '+',
        textAfter: '% увеличение ежедневного бонуса Консулов',
        result(level) {
          return level * 0.5;
        },
      },
    ],
  },
  basePrice: {
    group: 'special',
    tier: 3,
    humans: 10,
    metals: 20,
    crystals: 15,
    honor: 30,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/Alliance', 4],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/Alliance', 18],
        ['Research/Evolution/Science', 24],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/Alliance', 32],
        ['Research/Evolution/Science', 36],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/Alliance', 46],
        ['Research/Evolution/Science', 56],
        ['Building/Military/Gates', 45],
      ];
    }
    return [
      ['Building/Residential/Alliance', 60],
      ['Research/Evolution/Science', 80],
      ['Building/Military/Gates', 55],
    ];
  },
};
