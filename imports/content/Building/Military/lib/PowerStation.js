export default {
  id: 'Building/Military/PowerStation',
  title: 'Электростанция',
  description: 'Электростанция снабжает энергией всю военную структуру планеты. В жилых районах есть свои компактные энергетические комплексы, встроенные в дома, и их энергии вполне хватает на обеспечение всех нужд жильцов. Однако же для серьёзных военных сооружений и исследовательских станций нужно гораздо больше энергии.',
  effects: {
    Price: [
      {
        textBefore: 'Строения дешевле на ',
        textAfter: '%',
        condition: 'Building',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level) {
          return level * 0.5;
        },
      },
    ],
  },
  basePrice: {
    group: 'fleet',
    tier: 1,
    humans: 0.5,
    metals: 10,
    crystals: 1,
    honor: 6,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/House', 5],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/House', 20],
        ['Research/Evolution/Energy', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/House', 33],
        ['Research/Evolution/Energy', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/House', 42],
        ['Research/Evolution/Energy', 55],
        ['Research/Evolution/Converter', 46],
      ];
    }
    return [
      ['Building/Residential/House', 51],
      ['Research/Evolution/Energy', 75],
      ['Research/Evolution/Converter', 66],
    ];
  },
};
