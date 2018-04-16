export default {
  id: 'Building/Residential/BlackMarket',
  title: 'Черный рынок',
  description: 'К сожалению, далеко не все товары можно достать честным способом, ну или простым… Пираты, контрабандисты, независимые торговцы – все эти ребята не имеют права торговать на территориях Галактического Совета, а рептилоиды скорее порвут их на куски, чем купят их товары. До появления Консулов они могли торговать только друг с другом, но теперь всё изменилось. Выгоду такой торговли сложно переоценить, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Юниты дешевле на ',
        textAfter: '%',
        condition: 'Unit/Human',
        priority: 2,
        affect: ['metals', 'crystals'],
        result({ level }) {
          return level * 0.1;
        },
      },
    ],
  },
  basePrice: {
    group: 'infantry',
    tier: 4,
    humans: 80,
    metals: 800,
    crystals: 120,
    honor: 140,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/TradingPort', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/TradingPort', 30],
        ['Research/Evolution/AnimalWorld', 36],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/TradingPort', 45],
        ['Research/Evolution/AnimalWorld', 44],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/TradingPort', 60],
        ['Research/Evolution/AnimalWorld', 70],
        ['Research/Evolution/Ikea', 70],
      ];
    }
    return [
      ['Building/Residential/TradingPort', 75],
      ['Research/Evolution/AnimalWorld', 62],
      ['Research/Evolution/Ikea', 90],
    ];
  },
};
