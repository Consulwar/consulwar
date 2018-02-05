export default {
  id: 'Building/Military/Laboratory',
  title: 'Лаборатория',
  description: 'Можно сотню лет танцевать с бубном и верить в летающих по воздуху существ, потом ещё тысячу лет придумывать сказочки о живущих на небе мужиках и взрываться каждый раз при упоминании твоего любимого героя из фантастических книжек, но настоящая магия начинается там, где есть наука. Именно наука вывела нас в космос, именно наука помогла этим людям привести вас, Консул, в их вселенную. И именно наука поможет нам всем победить Рептилоидов! Ну… Или Летающий Макаронный Монстр… Он тоже может…',
  effects: {
    Price: [
      {
        textBefore: 'Исследования дешевле на ',
        textAfter: '%',
        condition: 'Research',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level) {
          return level * 0.5;
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.3, 'slowExponentialGrow', 0],
      crystals: [0.1, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [4, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.CrystalFragments = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.batteries = [5, 'slowLinearGrow', 60];
    } else {
      price.PlasmaTransistors = [5, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 3],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 23],
        ['Research/Evolution/Science', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 43],
        ['Research/Evolution/Science', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 63],
        ['Research/Evolution/Science', 55],
        ['Building/Residential/Entertainment', 55],
      ];
    }
    return [
      ['Building/Military/PowerStation', 82],
      ['Research/Evolution/Science', 75],
      ['Building/Residential/Entertainment', 75],
    ];
  },
};
