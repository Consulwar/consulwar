export default {
  id: 'Building/Military/Laboratory',
  title: 'Лаборатория',
  description: 'Можно сотню лет танцевать с бубном и верить в летающих по воздуху существ, потом ещё тысячу лет придумывать сказочки о живущих на небе мужиках и взрываться каждый раз при упоминании твоего любимого героя из фантастических книжек, но настоящая магия начинается там, где есть наука. Именно наука вывела нас в космос, именно наука помогла этим людям привести вас, Консул, в их вселенную. И именно наука поможет нам всем победить Рептилоидов! Ну… Или Летающий Макаронный Монстр… Он тоже может…',
  effects: {
    Price: [
      {
        textBefore: 'Исследования на ',
        textAfter: '% быстрее',
        condition: 'Research',
        priority: 2,
        affect: 'time',
        result(level) {
          return (level) + [0, 10, 25, 42, 66, 100][Math.floor(level / 20)];
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
        ['Building/Military/PowerStation', 5],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 15],
        ['Building/Residential/Spaceport', 1],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 30],
        ['Building/Residential/Spaceport', 20],
        ['Building/Military/Barracks', 20],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 45],
        ['Building/Residential/Spaceport', 35],
        ['Building/Military/Barracks', 30],
        ['Research/Evolution/Science', 60],
      ];
    }
    return [
      ['Building/Military/PowerStation', 65],
      ['Building/Residential/Spaceport', 50],
      ['Building/Military/Barracks', 45],
      ['Research/Evolution/Science', 80],
    ];
  },
};
