import { tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Residential/House',
  title: 'Жилой комплекс',
  description: 'Жилые комплексы – это дешёвые портативные системы для жизни. Изобретённые ещё в 90-е годы по системе Лайфтэк в рамках проекта «Венера», жилые комплексы стали основным способом строительства в дальних колониях. Налаженное производство позволяет с минимальными затратами и в кратчайшие сроки изготовить и установить десятки тысяч подобных комплексов. В сочетании друг с другом подобные комплексы могут превращаться в целый город буквально за недели. Вашей империи ведь нужны подданные, не так ли, правитель?',
  effects: {
    Income: [
      {
        textBefore: 'Приток населения ',
        textAfter: ' человек в час',
        priority: 1,
        affect: 'humans',
        result({ level }) {
          return [
            0,
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15,
            16, 17, 18, 19, 20,
            21.2, 22.4, 23.6, 24.8, 26,
            27.2, 28.4, 29.6, 30.8, 32,
            33.2, 34.4, 35.6, 36.8, 38,
            39.2, 40.4, 41.6, 42.8, 45,
            46.4, 47.8, 49.2, 50.6, 52,
            53.4, 54.8, 56.2, 57.6, 59,
            60.4, 61.8, 63.2, 64.6, 66,
            67.4, 68.8, 70.2, 71.6, 75,
            76.6, 78.2, 79.8, 81.4, 83,
            84.6, 86.2, 87.8, 89.4, 91,
            92.6, 94.2, 95.8, 97.4, 99,
            100.6, 102.2, 103.8, 105.4, 110,
            111.8, 113.6, 115.4, 117.2, 119,
            120.8, 122.6, 124.4, 126.2, 128,
            129.8, 131.6, 133.4, 135.2, 137,
            138.8, 140.6, 142.4, 144.2, 150,
            152, 154, 156, 158, 160, //
            162, 164, 166, 168, 170, //
            172, 174, 176, 178, 180, //
            182, 184, 186, 188, // 200,
            2000,
          ][level];
        },
      },
    ],
    Special: [
      {
        textBefore: 'Укрытия для ',
        textAfter: ' населения планеты',
        priority: 1,
        condition: 'Unique/bunker',
        affect: 'humans',
        result({ level }) {
          return [
            0,
            1000,
            2500,
            5000,
            10000,
            20000,
            200000,
          ][Math.floor(level / 20)];
        },
      },
    ],
    Price: [
      {
        textBefore: 'Подготовка Папань быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Father',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Лазерных Турелей на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/LaserTurret',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'progress',
    tier: 1,
    humans: 1,
    metals: 1.6,
    crystals: 0.8,
    honor: 5,
  },
  plasmoidDuration: 60 * 60 * 24 * 7,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Alloy', 10],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Alloy', 24],
        ['Research/Evolution/Energy', 18],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Alloy', 42],
        ['Research/Evolution/Energy', 45],
        ['Research/Evolution/Ikea', 30],
      ];
    }
    return [
      ['Research/Evolution/Alloy', 72],
      ['Research/Evolution/Energy', 65],
      ['Research/Evolution/Ikea', 60],
    ];
  },
};
