export default {
  id: 'Building/Military/PowerStation',
  title: 'Электростанция',
  description: 'Электростанция снабжает энергией всю военную структуру планеты. В жилых районах есть свои компактные энергетические комплексы, встроенные в дома, и их энергии вполне хватает на обеспечение всех нужд жильцов. Однако же для серьёзных военных сооружений и исследовательских станций нужно гораздо больше энергии.',
  effects: {
    Price: [
      {
        textBefore: 'Исследования на ',
        textAfter: '% дешевле',
        condition: 'Research',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return (level * 0.2) + [0, 5, 10, 15, 20, 25][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.5, 'slowExponentialGrow', 0],
      crystals: [0.3, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [6, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [2, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.SilverPlasmoid = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.EmeraldPlasmoid = [4, 'slowLinearGrow', 60];
    } else {
      price.SapphirePlasmoid = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/House', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/House', 35],
        ['Building/Residential/Metal', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/House', 50],
        ['Building/Residential/Metal', 50],
        ['Building/Residential/Crystal', 50],
      ];
    }
    return [
      ['Building/Residential/House', 65],
      ['Building/Residential/Metal', 65],
      ['Building/Residential/Crystal', 65],
      ['Research/Evolution/Energy', 80],
    ];
  },
};
