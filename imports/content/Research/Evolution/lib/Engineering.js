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
        textBefore: 'Доставка Трилинейных Кристал-Ганов на ',
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
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1.2, 'slowExponentialGrow', 0],
      crystals: [0.8, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [25, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [10, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.chip = [6, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.keanureevesium = [4, 'slowLinearGrow', 60];
    } else {
      price.AncientTechnology = [3, 'slowLinearGrow', 80];
    }
    return price;
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
