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
        result(level = this.getCurrentLevel()) {
          return level * 0.1;
        },
      },
      {
        textBefore: 'Дополнительное ускорение ',
        textAfter: '%',
        condition: 'Building',
        priority: 2,
        affect: 'time',
        result(level = this.getCurrentLevel()) {
          return [0, 3, 5, 8, 10, 15][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [20, 'slowExponentialGrow', 0],
      crystals: [10, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [110, 'slowLinearGrow', 20];
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
        ['Building/Military/Laboratory', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 20],
        ['Research/Evolution/Science', 10],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 30],
        ['Research/Evolution/Science', 20],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 40],
        ['Research/Evolution/Science', 40],
      ];
    }
    return [
      ['Building/Military/Laboratory', 50],
      ['Research/Evolution/Science', 50],
      ['Research/Evolution/Nanotechnology', 20],
    ];
  },
};
