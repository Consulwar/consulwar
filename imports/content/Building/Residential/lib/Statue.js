export default {
  id: 'Building/Residential/Statue',
  title: 'Статуя Консула',
  description: 'Гигантская статуя Великого Правителя – самого Консула! Ваша двухсотметровая статуя прямо в центре жилого комплекса. Её величественный лик будет отбрасывать тень на город, и каждое утро, просыпаясь, ваши жители будут мысленно благодарить вас за ваши труды, за ваше правление, вашу мудрость и непоколебимость в защите простого народа и борьбе с рептилоидами. Эта статуя не просто памятник при жизни – это статус вашего города, вашей планеты, это мораль вашего народа и маяк для новых людей, что перейдут под ваше командование и ринутся в бой по первому вашему зову, Великий Консул!',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result(level) {
          return level * 1;
        },
      },
      {
        textBefore: 'дополнительно +',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result(level) {
          return [0, 1, 3, 5, 10, 25][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [50, 'slowExponentialGrow', 0],
      crystals: [20, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [50, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [50, 'slowLinearGrow', 0];
      price.EmeraldPlasmoid = [4, 'slowLinearGrow', 0];
    } else if (level < 40) {
      price.SapphirePlasmoid = [6, 'slowLinearGrow', 20];
    } else if (level < 60) {
      price.AmethystPlasmoid = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.TopazPlasmoid = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Alloy', 25],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Alloy', 45],
        ['Building/Military/Barracks', 35],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Alloy', 65],
        ['Building/Military/Barracks', 55],
        ['Building/Military/Void', 20],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Alloy', 85],
        ['Building/Military/Barracks', 75],
        ['Building/Military/Void', 35],
        ['Research/Evolution/Converter', 25],
      ];
    }
    return [
      ['Research/Evolution/Alloy', 100],
      ['Building/Military/Barracks', 85],
      ['Building/Military/Void', 55],
      ['Research/Evolution/Converter', 55],
    ];
  },
};
