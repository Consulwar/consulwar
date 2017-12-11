export default {
  id: 'Building/Military/Complex',
  title: 'Инженерный комплекс',
  description: 'В условиях военного времени инженеры — очень важные ребята. Их пытливый ум и тяга к созданию чего-то колоссального — как по своим размерам, так и по возможностям — несомненно, пригодится при создании новых видов вооружения и боевой техники. Конечно, основное, над чем будут работать инженеры — это Оборонный комплекс, который поможет удержать позиции на Земле и не позволит Рептилоидам перехватить инициативу. В то же время разработки Инженерного комплекса могут пригодиться и в других сферах. Не стоит недооценивать возможности технических наук, Консул.',
  effects: {
    Military: [
      {
        textBefore: 'Урон оборонительных сооружений +',
        textAfter: '%',
        condition: 'Unit/Human/Defense',
        priority: 2,
        affect: 'damage',
        result(level) {
          return level * 0.2;
        },
      },
    ],
    Special: [
      {
        notImplemented: true,
        textBefore: 'Однократно +',
        textAfter: '',
        result(level) {
          return [
            0,
            '100 мин',
            '100 турелей',
            '100 снайпер-ганов',
            '100 плазменных убийц',
            '100 кристалл-ганов',
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5, 'slowExponentialGrow', 0],
      crystals: [0.3, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [50, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [4, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.garyoldmanium = [5, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AncientTechnology = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 60],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 70],
        ['Building/Military/Gates', 1],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 80],
        ['Building/Military/Gates', 20],
        ['Building/Military/DefenseComplex', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 90],
        ['Building/Military/Gates', 40],
        ['Building/Military/DefenseComplex', 55],
        ['Building/Residential/Entertainment', 60],
      ];
    }
    return [
      ['Building/Military/PowerStation', 100],
      ['Building/Military/Gates', 60],
      ['Building/Military/DefenseComplex', 70],
      ['Building/Residential/Entertainment', 90],
    ];
  },
};
