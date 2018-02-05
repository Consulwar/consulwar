import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Alloy',
  title: 'Особые сплавы',
  description: 'Специальная технология сплава составных компонентов металла плюс так называемое «Металлическое плетение» — особый процесс отливки, позволяющий получить волокнистую молекулярную структуру, дают возможность изготавливать невероятно прочные металлические конструкции. Подобная технология может пригодиться как в строительстве, так и в военном деле. Не мне вам говорить, Великий Консул, как важно для нас время… Как говорится, нет времени объяснять, времени вообще нет! Особые сплавы помогут сэкономить огромное количество такого наиважнейшего ресурса, как время. Не говоря уже о том, что строительство некоторых зданий является чересчур сложным, и без данной технологии строительство будет попросту невозможно.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство всех зданий на ',
        textAfter: '% быстрее',
        condition: 'Building',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Линкоров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Battleship',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Подготовка Турникмэнов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Horizontalbarman',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Танков Мамка 2.0 на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Enginery/MotherTank',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.2, 'slowExponentialGrow', 0],
      crystals: [0.1, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [11, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.MeteorFragments = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.ReptileTechnology = [4, 'slowLinearGrow', 60];
    } else {
      price.PlasmaTransistors = [5, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 12],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 24],
        ['Building/Residential/Crystal', 24],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 37],
        ['Building/Residential/Crystal', 48],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 50],
        ['Building/Residential/Crystal', 72],
        ['Research/Evolution/Drill', 67],
      ];
    }
    return [
      ['Building/Military/Laboratory', 70],
      ['Building/Residential/Crystal', 84],
      ['Research/Evolution/Drill', 88],
    ];
  },
};
