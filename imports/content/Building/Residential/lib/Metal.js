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
        result(level = this.getCurrentLevel()) {
          return [
            0, 44, 51, 58, 65,
            73, 81, 89, 98, 106,
            116, 125, 135, 145, 155,
            166, 176, 186, 197, 207,
            193, 248, 317, 403, 508,
            634, 787, 968, 1181, 1429,
            1702, 2010, 2354, 2733, 3147,
            3592, 4065, 4559, 5069, 5587,
            6044, 7141, 8297, 9557, 10914,
            12248, 13624, 15020, 16410, 17767,
            17949, 20683, 23629, 26761, 29777,
            32544, 34275, 35419, 35899, 36030,
            36058, 43001, 50214, 57392, 62746,
            67355, 71636, 74767, 76552, 77621,
            79186, 90531, 100805, 110245, 116188,
            121300, 124229, 125998, 127796, 128353,
            128205, 141522, 154818, 166290, 173656,
            179626, 184020, 186697, 187560, 188434,
            192308, 210431, 217709, 223078, 224147,
            225228, 226320, 227422, 228537, 229662,
            230770,
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
        result(level = this.getCurrentLevel()) {
          return [
            0,
            25000,
            300000,
            5000000,
            20000000,
            50000000,
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [100, 'slowExponentialGrow', 0],
      crystals: [10, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [100, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.meteorFragments = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.RotaryAmplifier = [5, 'slowLinearGrow', 60];
    } else {
      price.PlasmaTransistors = [5, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Energy', 10],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Energy', 25],
        ['Research/Evolution/Alloy', 15],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Energy', 55],
        ['Research/Evolution/Alloy', 25],
        ['Research/Evolution/Science', 35],
      ];
    }
    return [
      ['Research/Evolution/Energy', 75],
      ['Research/Evolution/Alloy', 50],
      ['Research/Evolution/Science', 60],
      ['Research/Evolution/Drill', 40],
    ];
  },
};
