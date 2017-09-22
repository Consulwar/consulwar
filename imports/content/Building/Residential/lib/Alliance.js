export default {
  id: 'Building/Residential/Alliance',
  title: 'Система связи',
  description: '«Пшш-пшш. Алло, ёба. Это ты?» Система связи – уникальный комплекс. Он позволит вам крайне эффективно координировать действия с вашими союзниками по борьбе с рептилоидными захватчиками. Вступить в альянс или даже создать свой с блэкджеком и… Консулами. Помните, правитель, люди рассчитывают на вас, и ваш аватар здесь именно затем, чтобы помочь им. Сила Консулов действительно велика, однако лишь объединение усилий сделает их власть непоколебимой!',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: '',
        textAfter: '% альянсового бонуса',
        result(level = this.getCurrentLevel()) {
          return level * 1;
        },
      },
      {
        notImplemented: true,
        textBefore: '',
        textAfter: '',
        result(level = this.getCurrentLevel()) {
          return level === 0 ? '' : [
            'Можно вступить в альянс',
            'Можно создавать альянс до 10 человек',
            'Можно создавать альянс до 20 человек',
            'Можно создавать альянс до 30 человек',
            'Можно создавать альянс до 40 человек',
            'Можно создавать альянс до 50 человек',
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5, 'slowExponentialGrow', 0],
      crystals: [5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [15, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [15, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.chip = [6, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nicolascagium = [5, 'slowLinearGrow', 60];
    } else {
      price.AncientTechnology = [3, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Energy', 10],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Energy', 25],
        ['Research/Evolution/Alloy', 20],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Energy', 40],
        ['Research/Evolution/Alloy', 40],
        ['Building/Military/Storage', 10],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Energy', 60],
        ['Research/Evolution/Alloy', 60],
        ['Building/Military/Storage', 30],
        ['Research/Evolution/Nanotechnology', 25],
      ];
    }
    return [
      ['Research/Evolution/Energy', 85],
      ['Research/Evolution/Alloy', 80],
      ['Building/Military/Storage', 60],
      ['Research/Evolution/Nanotechnology', 55],
    ];
  },
};
