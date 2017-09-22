export default {
  id: 'Research/Evolution/Crystallization',
  title: 'Кристаллизация',
  description: 'Жидкие кристаллы являются важнейшим элементом энергетических комплексов и вооружения. До недавнего времени кристаллов хватало сполна, однако с началом войны потребность в этом веществе выросла многократно и учёные были вынуждены искать новый способ получения этого ценного ресурса. Кристаллизация — это промышленный способ синтеза в лаборатории вещества, подобного Кристалину. Замечу, подобного. Это не совсем те же самые кристаллы, хотя они и имеют схожую структуру. Но на их производство уходит не в пример меньше средств. Более того, на испытаниях некоторые адаптивные элементы вооружения показывают лучшие результаты, если в них используется искусственно синтезированный вид кристалла, а не природный. Так что без хорошего оружия мы точно не останемся, Консул.',
  effects: {
    Income: [
      {
        textBefore: 'Прирост кристалла на ',
        textAfter: '%',
        priority: 2,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return level * 0.2;
        },
      },
      {
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        priority: 2,
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 25, 50, 65, 80][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.05, 'slowExponentialGrow', 0],
      crystals: [0.3, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [15, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.emeraldPlasmoid = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.sapphirePlasmoid = [6, 'slowLinearGrow', 60];
    } else {
      price.jimcarrium = [4, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 30],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 40],
        ['Building/Residential/Crystal', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 50],
        ['Building/Residential/Crystal', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 60],
        ['Building/Residential/Crystal', 55],
      ];
    }
    return [
      ['Building/Military/Laboratory', 70],
      ['Building/Residential/Crystal', 75],
    ];
  },
};
