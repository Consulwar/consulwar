import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Barracks',
  title: 'Казармы',
  description: 'Пусть пешие войска этой вселенной недалеко ушли от всем известных штурмовиков, однако кто-то же должен подготовить этих «бравых» ребят для войны против Рептилоидов. Помимо этого, Казармы также являются своего рода предприятием по изготовлению всего боевого арсенала: вооружения, брони и отдельных боевых систем. И хоть на наших солдат без слёз не взглянешь, при должной подготовке от них можно добиться определённых успехов в бою. В конце концов, пехота — наша основная боевая единица в этой войне.',
  effects: {
    Price: [
      {
        textBefore: 'Подготовка пехоты на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Infantry',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Крейсеров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Cruiser',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Авианосцев быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Carrier',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1.5, 'slowExponentialGrow', 0],
      crystals: [0.1, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [5, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.WeaponParts = [3, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.ReptileTechnology = [4, 'slowLinearGrow', 60];
    } else {
      price.SapphirePlasmoid = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/House', 12],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/House', 28],
        ['Building/Residential/Entertainment', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/House', 48],
        ['Building/Residential/Entertainment', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/House', 68],
        ['Building/Residential/Entertainment', 52],
        ['Research/Evolution/Nanotechnology', 44],
      ];
    }
    return [
      ['Building/Residential/House', 88],
      ['Building/Residential/Entertainment', 68],
      ['Research/Evolution/Nanotechnology', 64],
    ];
  },
};
