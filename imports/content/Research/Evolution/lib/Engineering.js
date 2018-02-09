import { tier3 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Engineering',
  title: 'Оборонная инженерия',
  description: 'Злоебучие Рептилоиды повсюду, Консул. Следует держать ухо востро, а ещё лучше — заштамповаться оборонительными сооружениями. Создать из своей планеты целую непокорную крепость с сотнями… Нет… Тысячами! Орудий! Чёрт, как возбуждает. Но вы же понимаете, Консул, что оборону нужно развивать, ничего само собой с неба не падает, кроме поджаренных рептилоидов… Если у вас есть планетарные пушки.',
  effects: {
    Military: [
      {
        textBefore: 'Урон оборонных сооружений +',
        textAfter: '%',
        condition: 'Unit/Human/Defense',
        priority: 2,
        affect: 'damage',
        result(level) {
          return level * 0.2;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Дредноутов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Кристалл-Ганов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/CrystalGun',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Доставка Трилинейных Кристалл-Ганов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/TripleCrystalGun',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство ОБЧР на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Enginery/HBHR',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Бабочек на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air/Butterfly',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Орбитальных Станций Обороны на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/OrbitalDefenseStation',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
    ],
  },
  basePrice: {
    group: 'enginery',
    tier: 3,
    humans: 15,
    metals: 100,
    crystals: 35,
    honor: 60,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/DefenseComplex', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/DefenseComplex', 29],
        ['Research/Evolution/Nanotechnology', 18],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/DefenseComplex', 52],
        ['Research/Evolution/Nanotechnology', 28],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/DefenseComplex', 70],
        ['Research/Evolution/Nanotechnology', 58],
        ['Building/Military/OSCD', 50],
      ];
    }
    return [
      ['Building/Military/DefenseComplex', 90],
      ['Research/Evolution/Nanotechnology', 66],
      ['Building/Military/OSCD', 70],
    ];
  },
};
