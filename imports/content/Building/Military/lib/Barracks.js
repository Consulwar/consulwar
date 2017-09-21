export default {
  id: 'Building/Military/Barracks',
  title: 'Казармы',
  description: 'Пусть пешие войска этой вселенной недалеко ушли от всем известных штурмовиков, однако кто-то же должен подготовить этих «бравых» ребят для войны против Рептилоидов. Помимо этого, Казармы также являются своего рода предприятием по изготовлению всего боевого арсенала: вооружения, брони и отдельных боевых систем. И хоть на наших солдат без слёз не взглянешь, при должной подготовке от них можно добиться определённых успехов в бою. В конце концов, пехота — наша основная боевая единица в этой войне.',
  effects: {
    Price: [
      {
        textBefore: 'Подготовка пехоты на ',
        textAfter: '% дешевле',
        condition: 'Unit/Ground/Infantry/Human',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return level * 0.5;
        },
      },
      {
        textBefore: 'Подготовка пехоты на ',
        textAfter: '% быстрее',
        condition: 'Unit/Ground/Infantry/Human',
        priority: 2,
        affect: 'time',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 30, 50, 70, 90][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1.5, 'slowExponentialGrow', 0],
      crystals: [0.1, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [5, 'slowExponentialGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.WeaponParts = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.ReptileTechnology = [4, 'slowLinearGrow', 60];
    } else {
      price.SapphirePlasmoid = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 20],
        ['Building/Military/Laboratory', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 35],
        ['Building/Military/Laboratory', 40],
        ['Building/Residential/House', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 60],
        ['Building/Military/Laboratory', 60],
        ['Building/Residential/House', 50],
        ['Building/Residential/Alliance', 40],
      ];
    }
    return [
      ['Building/Military/PowerStation', 70],
      ['Building/Military/Laboratory', 80],
      ['Building/Residential/House', 65],
      ['Building/Residential/Alliance', 60],
    ];
  },
};
