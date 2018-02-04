export default {
  id: 'Research/Evolution/Energy',
  title: 'Энергетика',
  description: 'Пожалуй, ни у кого не возникнет вопросов, почему энергия считается важнейшим из ресурсов в век научно-технического прогресса. И уж тем более во времена жестокой войны с инопланетной расой. Осваиваются всё новые и новые колонии, заводы работают на полную мощность и, хотя открытие жидкого кристалла коренным образом повлияло на энергетику, вопрос всё же остаётся открытым. Дальнейшее изучение свойств кристаллической энергии может существенно снизить затраты средств на армию и уж тем более является совершенно необходимым для большинства производств.',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Бонусы палаты консула +',
        textAfter: '%',
        result(level) {
          return level * 0.4;
        },
      },
      {
        notImplemented: true,
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        result(level) {
          return [0, 10, 20, 30, 40, 60][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.1, 'slowExponentialGrow', 0],
      crystals: [0.2, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [10, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.silverPlasmoid = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.batteries = [5, 'slowLinearGrow', 60];
    } else {
      price.sapphirePlasmoid = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 9],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 18],
        ['Building/Residential/Metal', 24],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 27],
        ['Building/Residential/Metal', 50],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 44],
        ['Building/Residential/Metal', 72],
        ['Research/Evolution/Converter', 42],
      ];
    }
    return [
      ['Building/Military/Laboratory', 58],
      ['Building/Residential/Metal', 90],
      ['Research/Evolution/Converter', 62],
    ];
  },
};
