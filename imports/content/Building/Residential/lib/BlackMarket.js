export default {
  id: 'Building/Residential/BlackMarket',
  title: 'Черный рынок',
  description: 'К сожалению, далеко не все товары можно достать честным способом, ну или простым… Пираты, контрабандисты, независимые торговцы – все эти ребята не имеют права торговать на территориях Галактического Совета, а рептилоиды скорее порвут их на куски, чем купят их товары. До появления Консулов они могли торговать только друг с другом, но теперь всё изменилось. Выгоду такой торговли сложно переоценить, Консул.',
  effects: {
    Special: [
      {
        textBefore: 'Единоразовый бонус: ',
        notImplemented: true,
        textAfter: '',
        result(level = this.getCurrentLevel()) {
          return [
            0,
            '1 рейлган',
            '2 рейлгана',
            '5 рейлганов',
            '10 рейлганов',
            '25 рейлганов',
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [7500, 'slowExponentialGrow', 0],
      crystals: [9000, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [200, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [20, 'slowLinearGrow', 0];
    } else if (level < 40) {
      price.chip = [6, 'slowLinearGrow', 20];
    } else if (level < 60) {
      price.nicolascagium = [5, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AncientArtifact = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/Political', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/Political', 35],
        ['Building/Residential/Spaceport', 40],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/Political', 50],
        ['Building/Residential/Spaceport', 55],
        ['Building/Military/Shipyard', 45],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/Political', 65],
        ['Building/Residential/Spaceport', 80],
        ['Building/Military/Shipyard', 65],
        ['Building/Military/Complex', 70],
      ];
    }
    return [
      ['Building/Residential/Political', 75],
      ['Building/Residential/Spaceport', 95],
      ['Building/Military/Shipyard', 85],
      ['Building/Military/Complex', 85],
    ];
  },
};
