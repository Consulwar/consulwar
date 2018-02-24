import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Factory',
  title: 'Военный завод',
  description: 'Представьте хруст, с которым ломаются кости рептилоида под сотнями тонн веса боевого танка, как растекаются мозги этого лживого зелёного ублюдка… Замечательно. Несомненно, военная техника — наше самое главное преимущество в этой войне. Наша пехота никогда не сможет похвастаться такими показателями, какие есть у хорошо смазанного и напичканного вооружением боевого робота или танка. Без техники нам не победить, Консул, а без Военного Завода не будет и самой техники. Полагаю, Великий Консул уже знает, куда следует вложить инвестиции.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство техники на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Enginery',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Траков C быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/TruckC',
        priority: 6,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Дредноутов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'enginery',
    tier: 2,
    humans: 5,
    metals: 20,
    crystals: 5,
    honor: 18,
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
