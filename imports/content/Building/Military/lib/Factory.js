export default {
  id: 'Building/Military/Factory',
  title: 'Военный завод',
  description: 'Представьте хруст, с которым ломаются кости рептилоида под сотнями тонн веса боевого танка, как растекаются мозги этого лживого зелёного ублюдка… Замечательно. Несомненно, военная техника — наше самое главное преимущество в этой войне. Наша пехота никогда не сможет похвастаться такими показателями, какие есть у хорошо смазанного и напичканного вооружением боевого робота или танка. Без техники нам не победить, Консул, а без Военного Завода не будет и самой техники. Полагаю, Великий Консул уже знает, куда следует вложить инвестиции.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство техники на ',
        textAfter: '% дешевле',
        condition: 'Unit/Human/Ground/Enginery',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Строительство техники на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Enginery',
        priority: 2,
        affect: 'time',
        result(level) {
          return [0, 10, 25, 66, 150, 400][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [4, 'slowExponentialGrow', 0],
      crystals: [0.2, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [15, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [3, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.ShipDetails = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.RotaryAmplifier = [5, 'slowLinearGrow', 60];
    } else {
      price.chip = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 6],
        ['Building/Residential/Metal', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 22],
        ['Building/Residential/Metal', 28],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 32],
        ['Building/Residential/Metal', 48],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 42],
        ['Building/Residential/Metal', 68],
        ['Research/Evolution/Engineering', 46],
      ];
    }
    return [
      ['Building/Military/PowerStation', 52],
      ['Building/Residential/Metal', 85],
      ['Research/Evolution/Engineering', 62],
    ];
  },
};
