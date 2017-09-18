export default {
  id: 'Building/Residential/Crystal',
  title: 'Шахта кристалла',
  description: 'Данный вид кристалла крайне заинтересовал учёных в 70-е годы прошлого века. Этот ресурс никогда не встречался на нашей родной планете – Земле, однако его находили абсолютно на всех колониях, куда отправляли экспедиции. Подобные ресурсы попадают на планеты из космоса, и крайне странно, что на Земле данный ресурс отсутствовал вовсе. Но гораздо более интересно другое: оказалось, что в жидком состоянии кристалл – абсолютно уникальное явление, он может быть биостимулятором, энергетическим ресурсом, основным элементом вооружения и даже усиливает потенцию! В общем, если вы хотите обеспечить весёлый вечер себе или рептилоиду, постройка данной шахты просто необходима для вашей колонии, Консул.',
  effects: {
    Income: [
      {
        textBefore: 'Добыча кристалла: ',
        textAfter: ' грамм в час',
        priority: 1,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return [
            0, 15, 17, 19, 22,
            24, 27, 30, 33, 35,
            39, 42, 45, 48, 52,
            55, 59, 62, 66, 69,
            64, 83, 106, 134, 169,
            211, 262, 323, 394, 476,
            567, 670, 785, 911, 1049,
            1197, 1355, 1520, 1690, 1862,
            2015, 2380, 2766, 3186, 3638,
            4083, 4541, 5007, 5470, 5922,
            5983, 6894, 7876, 8920, 9926,
            10848, 11425, 11806, 11966, 12010,
            12019, 14334, 16738, 19131, 20915,
            22452, 23879, 24922, 25517, 25874,
            26395, 30177, 33602, 36748, 38729,
            40433, 41410, 41999, 42599, 42784,
            42735, 47174, 51606, 55430, 57885,
            59875, 61340, 62232, 62520, 62811,
            64103, 70144, 72570, 74359, 74716,
            75076, 75440, 75807, 76179, 76554,
            76923,
          ][level];
        },
      },
    ],
    Special: [
      {
        textBefore: 'Укрытия для ',
        textAfter: ' грамм кристалла',
        priority: 1,
        condition: 'Unique/bunker',
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return [
            0,
            10000,
            100000,
            1000000,
            5000000,
            15000000,
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [140, 'slowExponentialGrow', 0],
      crystals: [75, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [200, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [2, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.CrystalFragments = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.RotaryAmplifier = [5, 'slowLinearGrow', 60];
    } else {
      price.nanoWires = [6, 'slowLinearGrow', 80];
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
      ['Research/Evolution/Crystallization', 40],
    ];
  },
};
