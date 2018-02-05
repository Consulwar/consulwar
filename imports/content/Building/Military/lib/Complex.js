import { tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Complex',
  title: 'Инженерный комплекс',
  description: 'В условиях военного времени инженеры — очень важные ребята. Их пытливый ум и тяга к созданию чего-то колоссального — как по своим размерам, так и по возможностям — несомненно, пригодится при создании новых видов вооружения и боевой техники. Конечно, основное, над чем будут работать инженеры — это Оборонный комплекс, который поможет удержать позиции на Земле и не позволит Рептилоидам перехватить инициативу. В то же время разработки Инженерного комплекса могут пригодиться и в других сферах. Не стоит недооценивать возможности технических наук, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Ремонт юнитов ',
        textAfter: '%',
        condition: 'Unique/Repair',
        priority: 2,
        affect: ['metals', 'crystals', 'credits'],
        result(level) {
          return level * 0.3;
        },
      },
      {
        textBefore: 'Строительство Пожинателей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Reaper',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство ОБЧР на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Enginery/HBHR',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5, 'slowExponentialGrow', 0],
      crystals: [0.3, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [50, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [4, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.garyoldmanium = [5, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AncientTechnology = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Gates', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Gates', 25],
        ['Research/Evolution/Engineering', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Gates', 44],
        ['Research/Evolution/Engineering', 25],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Gates', 56],
        ['Research/Evolution/Engineering', 40],
        ['Research/Evolution/Energy', 50],
      ];
    }
    return [
      ['Building/Military/Gates', 65],
      ['Research/Evolution/Engineering', 55],
      ['Research/Evolution/Energy', 70],
    ];
  },
};
