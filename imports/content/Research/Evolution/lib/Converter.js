export default {
  id: 'Research/Evolution/Converter',
  title: 'Преобразователь плазмоидов',
  description: 'Технология преобразования плазмоидов — это, что называется, технология нового времени. Учёные только начинают разбираться в этой новой области. И пока ещё не совсем понятно, как работают сами плазмоиды, однако же это крайне важные элементы, которые помогают нам в развитии науки, техники и всего остального. Думаю, не стоит скупиться на такие полезные технологии, Консул. А вы как считаете?',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Удвоить плазмоиды преобразователем +',
        textAfter: '%',
        result(level) {
          return level * 0.7;
        },
      },
      {
        notImplemented: true,
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        result(level) {
          return [0, 3, 5, 8, 10, 15][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [2.4, 'slowExponentialGrow', 0],
      crystals: [1.6, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [50, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [20, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.keanureevesium = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.TopazPlasmoid = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 55],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 65],
        ['Research/Evolution/Nanotechnology', 60],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 75],
        ['Research/Evolution/Nanotechnology', 70],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 85],
        ['Research/Evolution/Nanotechnology', 80],
        ['Building/Military/Gates', 50],
      ];
    }
    return [
      ['Building/Military/Laboratory', 95],
      ['Research/Evolution/Nanotechnology', 90],
      ['Building/Military/Gates', 80],
    ];
  },
};
