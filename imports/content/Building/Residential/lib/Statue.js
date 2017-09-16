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
        result(level = this.getCurrentLevel()) {
          return level * 10;
        },
      },
      {
        textBefore: 'дополнительно +',
        textAfter: ' чести в час',
        priority: 1,
        affect: 'honor',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 30, 50, 100, 250][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5000, 'slowExponentialGrow', 0],
      crystals: [2000, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [500, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [50, 'slowLinearGrow', 0];
      price.emerald_plasmoid = [4, 'slowLinearGrow', 0];
    } else if (level < 40) {
      price.sapphire_plasmoid = [6, 'slowLinearGrow', 20];
    } else if (level < 60) {
      price.amethyst_plasmoid = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.topaz_plasmoid = [3, 'slowLinearGrow', 60];
    } else {
      price.ruby_plasmoid = [8, 'slowLinearGrow', 80];
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
