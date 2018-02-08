import { tier1, tier2, tier3 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Gates',
  title: 'Врата',
  description: 'Врата — это экспериментальный объект, военное здание нового поколения, которое использует самые передовые достижения в области квантовой физики и механики. Существует теория, что таким же образом, каким была налажена связь с Консулами из нашего мира, есть возможность открыть напрямую портал и установить более чёткую связь с мирами, что находятся ближе. И, возможно, даже путешествовать по другим вселенным. Кто знает… Тем не менее, Врата — передовое научное здание, и множество открытий, совершённых в этих стенах, можно ставить на поток и использовать в войне.',
  effects: {
    Military: [
      {
        textBefore: 'Урон наземных войск +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 2,
        affect: 'damage',
        result(level) {
          return level * 0.2;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Рейлганов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Railgun',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Кристалл-Ганов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/CrystalGun',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'progress',
    tier: 4,
    humans: 60,
    metals: 110,
    crystals: 250,
    honor: 125,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Science', 26],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Science', 38],
        ['Research/Evolution/DoomsDaySizing', 15],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Science', 50],
        ['Research/Evolution/DoomsDaySizing', 35],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Science', 74],
        ['Research/Evolution/DoomsDaySizing', 55],
        ['Building/Residential/Alliance', 53],
      ];
    }
    return [
      ['Research/Evolution/Science', 82],
      ['Research/Evolution/DoomsDaySizing', 75],
      ['Building/Residential/Alliance', 72],
    ];
  },
};
