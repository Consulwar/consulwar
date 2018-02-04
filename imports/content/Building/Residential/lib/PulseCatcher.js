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
      {
        notImplemented: true,
        textBefore: '20% шанс при расчёте бонуса получить ещё металл и кристалл эквивалентно ',
        textAfter: ' добычи',
        result(level) {
          return [
            0,
            '1 часу',
            '2 часам',
            '3 часам',
            '4 часам',
            '5 часам',
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [4.5, 'slowExponentialGrow', 0],
      crystals: [3, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [10, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [10, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.SecretTechnology = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nanoWires = [6, 'slowLinearGrow', 60];
    } else {
      price.jimcarrium = [4, 'slowLinearGrow', 80];
    }
    return price;
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
