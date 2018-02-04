export default {
  id: 'Building/Military/Gates',
  title: 'Врата',
  description: 'Врата — это экспериментальный объект, военное здание нового поколения, которое использует самые передовые достижения в области квантовой физики и механики. Существует теория, что таким же образом, каким была налажена связь с Консулами из нашего мира, есть возможность открыть напрямую портал и установить более чёткую связь с мирами, что находятся ближе. И, возможно, даже путешествовать по другим вселенным. Кто знает… Тем не менее, Врата — передовое научное здание, и множество открытий, совершённых в этих стенах, можно ставить на поток и использовать в войне.',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: '+',
        textAfter: '% ресурсов за победы в космосе',
        result(level) {
          return level * 0.1;
        },
      },
      {
        notImplemented: true,
        textBefore: 'Дополнительные ',
        textAfter: '% в день',
        result(level) {
          return [0, 2, 5, 8, 10, 15][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [8, 'slowExponentialGrow', 0],
      crystals: [9, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [120, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [50, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.QuadCooler = [6, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nicolascagium = [5, 'slowLinearGrow', 60];
    } else {
      price.AncientScheme = [3, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Science', 26],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Science', 38],
        ['Research/Evolution/DoomsDaySizing', 15],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Science', 50],
        ['Research/Evolution/DoomsDaySizing', 35],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Science', 74],
        ['Research/Evolution/DoomsDaySizing', 55],
        ['Building/Residential/Alliance', 53],
      ];
    }
    return [
      ['Research/Evolution/Science', 82],
      ['Research/Evolution/DoomsDaySizing', 75],
      ['Building/Residential/Alliance', 72],
    ];
  },
};
