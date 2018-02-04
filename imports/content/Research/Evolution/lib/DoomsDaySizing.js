export default {
  id: 'Research/Evolution/DoomsDaySizing',
  title: 'Калибровка Судного дня',
  description: 'ОСД или, как её прозвали ребята из научного сообщества, Орудие Судного Дня — это новейшая система вооружения, требующая огромного количества энергии для использования. В то же время испытания на одной из планет показали, на что способно ОСД. К сожалению, орудие настолько мощное, что приходится тратить кучу времени на его зарядку и калибровку. Однако же результат стоит того в полной мере.',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Перезарядки ОСД -',
        textAfter: '%',
        result(level) {
          return level * 0.3;
        },
      },
      {
        notImplemented: true,
        textBefore: 'Спецспособность ОСД +',
        textAfter: '%',
        result(level) {
          return [0, 5, 10, 15, 20, 30][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5, 'slowExponentialGrow', 0],
      crystals: [3, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [80, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [30, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.garyoldmanium = [5, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AncientKnowledge = [4, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Converter', 9],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Converter', 18],
        ['Research/Evolution/Energy', 20],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Converter', 27],
        ['Research/Evolution/Energy', 40],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Converter', 42],
        ['Research/Evolution/Energy', 58],
        ['Research/Evolution/Hyperdrive', 72],
      ];
    }
    return [
      ['Research/Evolution/Converter', 56],
      ['Research/Evolution/Energy', 80],
      ['Research/Evolution/Hyperdrive', 90],
    ];
  },
};
