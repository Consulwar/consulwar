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
            0,
            1, 3, 4, 5, 6,
            8, 9, 10, 11, 13,
            14, 15, 16, 18, 19,
            20, 21, 23, 24, 30,
            33, 36, 38, 41, 44,
            47, 50, 52, 55, 58,
            61, 64, 66, 69, 72,
            75, 78, 80, 83, 100,
            105, 110, 114, 119, 124,
            129, 134, 138, 143, 148,
            153, 158, 162, 167, 172,
            177, 182, 186, 191, 220,
            227, 234, 241, 248, 255,
            261, 268, 275, 282, 289,
            296, 303, 310, 317, 324,
            330, 337, 344, 351, 400,
            410, 420, 430, 440, 450,
            460, 470, 480, 490, 500,
            510, 520, 530, 540, 550,
            560, 570, 580, 590, 650,
            664, 677, 691, 704, 718,
            731, 745, 758, 772, 785,
            799, 812, 826, 839, 853,
            866, 880, 893, 907, 980,
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
            100,
            1000,
            10000,
            50000,
            150000,
            300000,
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1.4, 'slowExponentialGrow', 0],
      crystals: [0.75, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [20, 'slowExponentialGrow', 20];
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
