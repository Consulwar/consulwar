export default {
  id: 'Building/Military/Airfield',
  title: 'Военный аэродром',
  description: '«У них члены больше чем у нас? Бомби их!» © Джордж Карлин. Авиация, разумеется, является крайне важным элементом на боевой карте Земли. Без поддержки с воздуха любую нашу армию разнесут в щепки превосходящие силы Рептилоидов. Аэродром в основном специализируется на подготовке и оснащении истребителей и бомбардировщиков для ведения боя в условиях атмосферы, однако многие разработки, ведущиеся здесь, крайне важны и для космических кораблей. Это превращает Аэродром в необходимый для нашей миссии элемент военно-промышленного комплекса, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство авиации на ',
        textAfter: '% дешевле',
        condition: {
          type: 'unit',
          group: 'ground',
          special: 'air',
        },
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return level * 0.3;
        },
      },
      {
        textBefore: 'Строительство авиации на ',
        textAfter: '% быстрее',
        condition: {
          type: 'unit',
          group: 'ground',
          special: 'air',
        },
        priority: 2,
        affect: 'time',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 15, 25, 50, 70][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [450, 'slowExponentialGrow', 0],
      crystals: [390, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [350, 'slowLinearGrow', 20];
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
        ['Building/Military/PowerStation', 20],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 35],
        ['Building/Residential/Spaceport', 5],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 45],
        ['Building/Residential/Spaceport', 20],
        ['Building/Residential/Alliance', 20],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 55],
        ['Building/Residential/Spaceport', 45],
        ['Building/Residential/Alliance', 40],
        ['Building/Military/Shipyard', 35],
      ];
    }
    return [
      ['Building/Military/PowerStation', 65],
      ['Building/Residential/Spaceport', 65],
      ['Building/Residential/Alliance', 60],
      ['Building/Military/Shipyard', 55],
    ];
  },
};
