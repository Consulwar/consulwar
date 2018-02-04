export default {
  id: 'Research/Evolution/Nanotechnology',
  title: 'Нанотехнологии',
  description: 'Вопреки расхожему мнению, нанотехнологии представляют собой не рой милипиздрических роботов, а специальные технологии, позволяющие создавать крайне точные, мелкие и чрезвычайно удобные микросхемы, которые в свою очередь вставляются во всё подряд. Вооружение, танки, броня, системы защиты, щиты, умная броня, очень умная броня, здания, мой тостер, Консул, ваш тостер… Нанотехнологии везде. Несомненно, самое важное место их применения — это боевой космический флот. Возможность крайне быстро рассчитать движение противника и максимально точно нацелить на него орудия, учитывая все необходимые условия, позволит вашему флоту, Консул, действовать намного эффективнее.',
  effects: {
    Special: [
      {
        textBefore: 'Шанс добыть карту в бою +',
        notImplemented: true,
        textAfter: '%',
        result(level) {
          return level * 0.7;
        },
      },
      {
        notImplemented: true,
        textBefore: '',
        textAfter: ' в день',
        result(level) {
          return [
            '2 карточки',
            '3 карточки',
            '4 карточки',
            '5 карточек',
            '6 карточек',
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1.2, 'slowExponentialGrow', 0],
      crystals: [0.8, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [20, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [10, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.WeaponParts = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nicolascagium = [5, 'slowLinearGrow', 60];
    } else {
      price.AncientArtifact = [3, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Alloy', 28],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Alloy', 38],
        ['Building/Military/Gates', 18],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Alloy', 48],
        ['Building/Military/Gates', 27],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Alloy', 58],
        ['Building/Military/Gates', 36],
        ['Research/Evolution/Drill', 72],
      ];
    }
    return [
      ['Research/Evolution/Alloy', 68],
      ['Building/Military/Gates', 47],
      ['Research/Evolution/Drill', 94],
    ];
  },
};
