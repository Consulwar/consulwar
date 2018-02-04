export default {
  id: 'Building/Military/Airfield',
  title: 'Военный аэродром',
  description: '«У них члены больше чем у нас? Бомби их!» © Джордж Карлин. Авиация, разумеется, является крайне важным элементом на боевой карте Земли. Без поддержки с воздуха любую нашу армию разнесут в щепки превосходящие силы Рептилоидов. Аэродром в основном специализируется на подготовке и оснащении истребителей и бомбардировщиков для ведения боя в условиях атмосферы, однако многие разработки, ведущиеся здесь, крайне важны и для космических кораблей. Это превращает Аэродром в необходимый для нашей миссии элемент военно-промышленного комплекса, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство авиации на ',
        textAfter: '% дешевле',
        condition: 'Unit/Human/Ground/Air',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level) {
          return level * 0.3;
        },
      },
      {
        textBefore: 'Строительство авиации на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air',
        priority: 2,
        affect: 'time',
        result(level) {
          return [0, 10, 17, 33, 100, 233][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [4.5, 'slowExponentialGrow', 0],
      crystals: [3.9, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [35, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [6, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.SecretTechnology = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.QuadCooler = [6, 'slowLinearGrow', 60];
    } else {
      price.keanureevesium = [4, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 9],
        ['Building/Residential/Crystal', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 27],
        ['Building/Residential/Crystal', 28],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 37],
        ['Building/Residential/Crystal', 46],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 47],
        ['Building/Residential/Crystal', 66],
        ['Research/Evolution/DoomsDaySizing', 50],
      ];
    }
    return [
      ['Building/Military/PowerStation', 57],
      ['Building/Residential/Crystal', 88],
      ['Research/Evolution/DoomsDaySizing', 70],
    ];
  },
};
