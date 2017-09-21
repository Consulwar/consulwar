export default {
  id: 'Building/Residential/PulseCatcher',
  title: 'Импульсный уловитель',
  description: 'Импульсный уловитель – это специальное сооружение, предназначенное для сбора и распределения особой импульсной энергии. Подобная энергия не используется в Электростанции и не применяется в работе основных систем, однако особые физические свойства импульсной энергии позволяют использовать её в очень специфичных, но важных аспектах: например, в современной медицине.',
  effects: {
    Special: [
      {
        textBefore: '+',
        textAfter: '% увеличение ежедневного бонуса Консулов',
        result(level = this.getCurrentLevel()) {
          return level * 0.5;
        },
      },
      {
        notImplemented: true,
        textBefore: '20% шанс при расчёте бонуса получить ещё металл и кристалл эквивалентно ',
        textAfter: ' добычи',
        result(level = this.getCurrentLevel()) {
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
        ['Research/Evolution/Science', 20],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Science', 30],
        ['Building/Military/Gates', 20],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Science', 40],
        ['Building/Military/Gates', 35],
        ['Building/Residential/Alliance', 25],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Science', 60],
        ['Building/Military/Gates', 55],
        ['Building/Residential/Alliance', 55],
        ['Research/Evolution/Drill', 50],
      ];
    }
    return [
      ['Research/Evolution/Science', 75],
      ['Building/Military/Gates', 80],
      ['Building/Residential/Alliance', 75],
      ['Research/Evolution/Drill', 70],
    ];
  },
};
