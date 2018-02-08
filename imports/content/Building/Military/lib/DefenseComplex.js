import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/DefenseComplex',
  title: 'Оборонный комплекс',
  description: 'Оборонный комплекс занимается разработкой новых видов вооружения, которое сможет отбивать нападения Рептилоидов на вашу планету или на другие ваши колонии. От минных полей — до гигантских пушек, способных за несколько залпов ломать самые мощные корабли. Пусть ваш народ почувствует себя в безопасности. Застройтесь к чертям собачьим турелями и наблюдайте, как корабли Рептилий сыпятся с неба.',
  effects: {
    Special: [
      {
        textBefore: 'Строительство обороны быстрее на ',
        textAfter: '%',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Мин быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Defense/Mine',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Турелей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Defense/Turret',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Снайпер Ганов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Defense/SniperGun',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Плазменных убийц быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Defense/PlasmaKiller',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Кристал-Ганов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Defense/CrystalGun',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Гаммадронов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Gammadrone',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'fleet',
    tier: 2,
    humans: 5,
    metals: 20,
    crystals: 4,
    honor: 22,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 20],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 30],
        ['Research/Evolution/Engineering', 10],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 45],
        ['Research/Evolution/Engineering', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 60],
        ['Research/Evolution/Engineering', 50],
        ['Research/Evolution/Nanotechnology', 48],
      ];
    }
    return [
      ['Building/Military/PowerStation', 75],
      ['Research/Evolution/Engineering', 70],
      ['Research/Evolution/Nanotechnology', 68],
    ];
  },
};
