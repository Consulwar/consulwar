export default {
  id: 'Research/Evolution/Drill',
  title: 'Бурильный бур',
  description: 'Бурильный бур обрабатывает горные породы лазером, ультразвуком, использует термическую обработку породы, на месте перерабатывает шлак в энергию и попутно устанавливает высокотехнологичные сваи, прокладывая туннель в кратчайшие сроки. И всё это с невероятной для такой махины скоростью. Да… Подобные технологии не на каждом сверхсовременном боевом корабле встретишь… Самое интересное, что учёные до сих пор до конца не понимают, как работает этот бур. Дело в том, что его схему 10 лет назад увидел во сне обычный учитель физики. Правда, теперь его останки покоятся где-то на захваченной Рептилоидами Земле, но его детище живёт и исправно служит человечеству. На данный момент эта технология активно применяется в добыче металла и показывает себя с лучшей стороны. Ещё бы кофе мог заваривать, и цены б ему не было…',
  effects: {
    Income: [
      {
        textBefore: 'Прирост металла на ',
        textAfter: '%',
        priority: 2,
        affect: 'metals',
        result(level = this.getCurrentLevel()) {
          return level * 0.2;
        },
      },
      {
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        priority: 2,
        affect: 'metals',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 25, 50, 65, 80][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [30, 'slowExponentialGrow', 0],
      crystals: [5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [140, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.rotaryAmplifier = [5, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.quadCooler = [6, 'slowLinearGrow', 60];
    } else {
      price.garyoldmanium = [5, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 35],
        ['Building/Residential/Metal', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 45],
        ['Building/Residential/Metal', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 55],
        ['Building/Residential/Metal', 55],
      ];
    }
    return [
      ['Building/Military/Laboratory', 65],
      ['Building/Residential/Metal', 75],
    ];
  },
};
