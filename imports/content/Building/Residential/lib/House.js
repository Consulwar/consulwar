export default {
  id: 'Building/Residential/House',
  title: 'Жилой комплекс',
  description: 'Жилые комплексы – это дешёвые портативные системы для жизни. Изобретённые ещё в 90-е годы по системе Лайфтэк в рамках проекта «Венера», жилые комплексы стали основным способом строительства в дальних колониях. Налаженное производство позволяет с минимальными затратами и в кратчайшие сроки изготовить и установить десятки тысяч подобных комплексов. В сочетании друг с другом подобные комплексы могут превращаться в целый город буквально за недели. Вашей империи ведь нужны подданные, не так ли, правитель?',
  effects: {
    Income: [
      {
        textBefore: 'Приток населения ',
        textAfter: ' человек в час',
        priority: 1,
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return level * 40;
        },
      },
    ],
    Special: [
      {
        textBefore: 'Укрытия для ',
        textAfter: ' населения планеты',
        priority: 1,
        condition: {
          id: 'bunker',
        },
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return [
            0,
            100000,
            250000,
            500000,
            1000000,
            2000000,
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [20, 'slowExponentialGrow', 0],
      crystals: [10, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [40, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.meteorFragments = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.batteries = [5, 'slowLinearGrow', 60];
    } else {
      price.quadCooler = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Alloy', 10],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Alloy', 25],
        ['Research/Evolution/Energy', 20],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Alloy', 50],
        ['Research/Evolution/Energy', 45],
        ['Research/Evolution/Ikea', 30],
      ];
    }
    return [
      ['Research/Evolution/Alloy', 75],
      ['Research/Evolution/Energy', 70],
      ['Research/Evolution/Ikea', 60],
      ['Research/Evolution/Nanotechnology', 55],
    ];
  },
};
