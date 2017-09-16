export default {
  id: 'Building/Military/Factory',
  title: 'Военный завод',
  description: 'Представьте хруст, с которым ломаются кости рептилоида под сотнями тонн веса боевого танка, как растекаются мозги этого лживого зелёного ублюдка… Замечательно. Несомненно, военная техника — наше самое главное преимущество в этой войне. Наша пехота никогда не сможет похвастаться такими показателями, какие есть у хорошо смазанного и напичканного вооружением боевого робота или танка. Без техники нам не победить, Консул, а без Военного Завода не будет и самой техники. Полагаю, Великий Консул уже знает, куда следует вложить инвестиции.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство техники на ',
        textAfter: '% дешевле',
        condition: {
          type: 'unit',
          group: 'ground',
          special: 'enginery',
        },
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Строительство техники на ',
        textAfter: '% быстрее',
        condition: {
          type: 'unit',
          group: 'ground',
          special: 'enginery',
        },
        priority: 2,
        affect: 'time',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 20, 40, 60, 80][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [400, 'slowExponentialGrow', 0],
      crystals: [20, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [150, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [3, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.ship_details = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.rotary_amplifier = [5, 'slowLinearGrow', 60];
    } else {
      price.chip = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 25],
        ['Building/Military/Barracks', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 40],
        ['Building/Military/Barracks', 30],
        ['Building/Military/Airfield', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 65],
        ['Building/Military/Barracks', 40],
        ['Building/Military/Airfield', 40],
        ['Building/Military/Shipyard', 45],
      ];
    }
    return [
      ['Building/Military/PowerStation', 75],
      ['Building/Military/Barracks', 50],
      ['Building/Military/Airfield', 50],
      ['Building/Military/Shipyard', 60],
    ];
  },
};
