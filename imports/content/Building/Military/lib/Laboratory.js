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
        result({ level }) {
          return level * 0.5;
        },
      },
    ],
  },
  basePrice: {
    group: 'special',
    tier: 1,
    humans: 2.5,
    metals: 0.5,
    crystals: 1.5,
    honor: 7,
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
