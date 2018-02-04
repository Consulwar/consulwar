export default {
  id: 'Research/Evolution/Science',
  title: 'Научный отдел',
  description: 'Любая достаточно развитая технология неотличима от магии. И для подобной магии вовсе не обязательно воздерживаться до тридцати лет, достаточно просто быть довольно умным, начитанным и пытливым сукиным сыном в белом халате. Более того, во времена нынешнего научного прогресса стало возможным создавать учёных из просто умных ребят путём изменения их кода ДНК, что впоследствии добавляет им ещё несколько пунктов IQ. Ну, или они умирают в страшных мучениях… Но что же поделать, это наука, детка. Хочешь быть гением — рискни! Редкое изобретение работает с первого раза, особенно это касается генетики. Но не стоит расстраиваться. Через тернии к звёздам, Консул.',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Время временной карточки +',
        textAfter: '%',
        result(level) {
          return level * 0.5;
        },
      },
      {
        notImplemented: true,
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        result(level) {
          return [0, 10, 20, 30, 40, 50][Math.floor(level / 20)];
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
      price.honor = [12, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.silverPlasmoid = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.SecretTechnology = [4, 'slowLinearGrow', 60];
    } else {
      price.quadCooler = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 35],
        ['Research/Evolution/Energy', 32],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 55],
        ['Research/Evolution/Energy', 52],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 75],
        ['Research/Evolution/Energy', 72],
        ['Research/Evolution/Crystallization', 70],
      ];
    }
    return [
      ['Building/Military/Laboratory', 95],
      ['Research/Evolution/Energy', 90],
      ['Research/Evolution/Crystallization', 90],
    ];
  },
};
