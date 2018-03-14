import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/OSCD',
  title: 'Фабрика ОСКО',
  description: 'Что вы представляете, Консул, когда слышите словосочетание «орбитальная станция»? Пару капсул с понатыканными на них солнечными батареями? Это мы в своём мире тратим время на то, чтобы окроплять космические корабли святой водой. А в этом мире люди не тратили время на глупости. Данная фабрика производит самые мощные защитные сооружения — Орбитальные Станции Космической Обороны. Поверьте, зрелище впечатляющее.',
  effects: {
    Military: [
      {
        textBefore: 'Броня обороны +',
        textAfter: '%',
        condition: 'Unit/Human/Defense',
        priority: 2,
        affect: 'life',
        result(level) {
          return level * 0.2;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Орбитальных Станций Обороны на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/OrbitalDefenseStation',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Бабочек на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air/Butterfly',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'progress',
    tier: 4,
    humans: 120,
    metals: 400,
    crystals: 200,
    honor: 155,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/DefenseComplex', 35],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/DefenseComplex', 45],
        ['Building/Military/Shipyard', 18],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/DefenseComplex', 58],
        ['Building/Military/Shipyard', 27],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/DefenseComplex', 75],
        ['Building/Military/Shipyard', 36],
        ['Research/Evolution/DoomsDaySizing', 60],
      ];
    }
    return [
      ['Building/Military/DefenseComplex', 85],
      ['Building/Military/Shipyard', 45],
      ['Research/Evolution/DoomsDaySizing', 80],
    ];
  },
};
