export default {
  id: 'Research/Evolution/Engineering',
  title: 'Оборонная инженерия',
  description: 'Злоебучие Рептилоиды повсюду, Консул. Следует держать ухо востро, а ещё лучше — заштамповаться оборонительными сооружениями. Создать из своей планеты целую непокорную крепость с сотнями… Нет… Тысячами! Орудий! Чёрт, как возбуждает. Но вы же понимаете, Консул, что оборону нужно развивать, ничего само собой с неба не падает, кроме поджаренных рептилоидов… Если у вас есть планетарные пушки.',
  effects: {
    Military: [
      {
        textBefore: 'Броня оборонных сооружений +',
        textAfter: '%',
        condition: 'Unit/Defense/Human',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return level * 0.1;
        },
      },
      {
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        condition: 'Unit/Defense/Human',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return [0, 3, 5, 8, 10, 15][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1.2, 'slowExponentialGrow', 0],
      crystals: [0.8, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [25, 'slowExponentialGrow', 20];
    }

    if (level < 20) {
      price.humans = [10, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.chip = [6, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.keanureevesium = [4, 'slowLinearGrow', 60];
    } else {
      price.AncientTechnology = [3, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 35],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 45],
        ['Research/Evolution/Energy', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 55],
        ['Research/Evolution/Energy', 40],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 65],
        ['Research/Evolution/Energy', 60],
      ];
    }
    return [
      ['Building/Military/Laboratory', 75],
      ['Research/Evolution/Energy', 80],
    ];
  },
};
