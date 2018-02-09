import { tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Residential/Alliance',
  title: 'Система связи',
  description: '«Пшш-пшш. Алло, ёба. Это ты?» Система связи – уникальный комплекс. Он позволит вам крайне эффективно координировать действия с вашими союзниками по борьбе с рептилоидными захватчиками. Вступить в альянс или даже создать свой с блэкджеком и… Консулами. Помните, правитель, люди рассчитывают на вас, и ваш аватар здесь именно затем, чтобы помочь им. Сила Консулов действительно велика, однако лишь объединение усилий сделает их власть непоколебимой!',
  effects: {
    Special: [
      {
        textBefore: '',
        textAfter: '',
        result(level) {
          return level === 0 ? '' : [
            'Можно вступить в альянс 1 уровня',
            'Можно вступить в альянс 2 уровня',
            'Можно вступить в альянс 3 уровня',
            'Можно вступить в альянс 4 уровня',
            'Можно вступить в альянс 5 уровня',
          ][Math.floor(level / 20)];
        },
      },
      {
        textBefore: '',
        textAfter: '',
        result(level) {
          return level === 0 ? '' : [
            '',
            'Можно создавать альянс до 10 человек',
            'Можно создавать альянс до 20 человек',
            'Можно создавать альянс до 30 человек',
            'Можно создавать альянс до 40 человек',
            'Можно создавать альянс до 50 человек',
          ][Math.floor(level / 20)];
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Орбитальных Станций Обороны на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/OrbitalDefenseStation',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'politic',
    tier: 2,
    humans: 5.5,
    metals: 14,
    crystals: 5,
    honor: 18,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 40],
        ['Research/Evolution/AnimalWorld', 30],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 55],
        ['Research/Evolution/AnimalWorld', 40],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 70],
        ['Research/Evolution/AnimalWorld', 50],
        ['Building/Military/Storage', 54],
      ];
    }
    return [
      ['Building/Military/PowerStation', 90],
      ['Research/Evolution/AnimalWorld', 60],
      ['Building/Military/Storage', 68],
    ];
  },
};
