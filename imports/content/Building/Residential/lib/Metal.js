export default {
  id: 'Building/Residential/Metal',
  title: 'Шахта металла',
  description: 'Металл – один из основных ресурсов. Он необходим абсолютно для всего: для строительства зданий, армий, флота, исследований и так далее. Современные шахты металла способны добывать и обрабатывать его в огромных количествах. И хоть люди больше не спускаются в шахты, данное здание нуждается в постоянном управлении и технических настройках, поэтому требует постоянного притока новых кадров. Процесс добычи металла крайне трудоёмок, однако ничего не сравнится с блеском новенького космического корабля или хорошо бронированного танка.',
  effects: {
    Income: [
      {
        textBefore: 'Добыча металла: ',
        textAfter: ' килограмм в час',
        priority: 1,
        affect: 'metals',
        result({ level }) {
          return [
            0,
            4, 8, 12, 16, 20,
            24, 28, 32, 36, 40,
            44, 48, 52, 56, 60,
            64, 68, 72, 76, 100,
            108, 116, 124, 132, 140,
            148, 156, 164, 172, 180,
            188, 196, 204, 212, 220,
            228, 236, 244, 252, 300,
            314, 328, 342, 356, 370,
            384, 398, 412, 426, 440,
            454, 468, 482, 496, 510,
            524, 538, 552, 566, 650,
            672, 694, 716, 738, 760,
            782, 804, 826, 848, 870,
            892, 914, 936, 958, 980,
            1002, 1024, 1046, 1068, 1200,
            1232, 1264, 1296, 1328, 1360,
            1392, 1424, 1456, 1488, 1520,
            1552, 1584, 1616, 1648, 1680,
            1712, 1744, 1776, 1808, 2000,
            2045, 2090, 2135, 2180, 2225, //
            2270, 2315, 2360, 2405, 2450, //
            2495, 2540, 2585, 2630, 2675, //
            2720, 2765, 2810, 2855, // 3100,
            31000,
          ][level];
        },
      },
    ],
    Special: [
      {
        textBefore: 'Укрытия для ',
        textAfter: ' килограмм металла',
        priority: 1,
        condition: 'Unique/bunker',
        affect: 'metals',
        result({ level }) {
          return [
            0,
            250,
            3000,
            50000,
            200000,
            500000,
            1000000,
            5000000,
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice: {
    group: 'progress',
    tier: 1,
    humans: 2,
    metals: 5,
    crystals: 0.5,
    honor: 7,
  },
  plasmoidDuration: 60 * 60 * 24 * 7,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Drill', 1],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Drill', 25],
        ['Research/Evolution/Alloy', 13],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Drill', 45],
        ['Research/Evolution/Alloy', 25],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Drill', 65],
        ['Research/Evolution/Alloy', 52],
        ['Research/Evolution/Nanotechnology', 45],
      ];
    }
    return [
      ['Research/Evolution/Drill', 85],
      ['Research/Evolution/Alloy', 75],
      ['Research/Evolution/Nanotechnology', 62],
    ];
  },
};
