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
          return level + [0, 1, 3, 5, 10, 25][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice: {
    group: 'infantry',
    tier: 3,
    humans: 15,
    metals: 70,
    crystals: 40,
    honor: 4,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/Entertainment', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/Entertainment', 45],
        ['Building/Residential/Metal', 42],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/Entertainment', 64],
        ['Building/Residential/Metal', 64],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/Entertainment', 85],
        ['Building/Residential/Metal', 80],
        ['Building/Residential/Crystal', 80],
      ];
    }
    return [
      ['Building/Residential/Entertainment', 95],
      ['Building/Residential/Metal', 100],
      ['Building/Residential/Crystal', 100],
    ];
  },
};
