import { tier3 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Nanotechnology',
  title: 'Нанотехнологии',
  description: 'Вопреки расхожему мнению, нанотехнологии представляют собой не рой милипиздрических роботов, а специальные технологии, позволяющие создавать крайне точные, мелкие и чрезвычайно удобные микросхемы, которые в свою очередь вставляются во всё подряд. Вооружение, танки, броня, системы защиты, щиты, умная броня, очень умная броня, здания, мой тостер, Консул, ваш тостер… Нанотехнологии везде. Несомненно, самое важное место их применения — это боевой космический флот. Возможность крайне быстро рассчитать движение противника и максимально точно нацелить на него орудия, учитывая все необходимые условия, позволит вашему флоту, Консул, действовать намного эффективнее.',
  effects: {
    Military: [
      {
        textBefore: 'Броня наземных войск +',
        textAfter: '%',
        condition: 'Unit/Human/Ground',
        priority: 2,
        affect: 'life',
        result({ level }) {
          return level * 0.2;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Гаммадронов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Gammadrone',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Миражей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Mirage',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Доставка Ионных Мин на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/IonMine',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство XYNлётов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air/Xynlet',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
    ],
  },
  basePrice: {
    group: 'infantry',
    tier: 3,
    humans: 16,
    metals: 110,
    crystals: 35,
    honor: 58,
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
