import { tier2 } from '/imports/content/formula';

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
        result(level) {
          return (level * 0.2) + [0, 10, 25, 50, 65, 80][Math.floor(level / 20)];
        },
      },
    ],
    Price: [
      {
        textBefore: 'Подготовка Псиоников быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Psiman',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Плазменных убийц на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/PlasmaKiller',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Жидкоплазменных Тиранов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/Tyrant',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство XYNлётов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air/Xynlet',
        priority: 4,
        affect: 'time',
        result: tier2,
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
        ['Building/Military/Laboratory', 6],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 16],
        ['Building/Residential/Crystal', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 36],
        ['Building/Residential/Crystal', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 46],
        ['Building/Residential/Crystal', 55],
        ['Research/Evolution/Alloy', 56],
      ];
    }
    return [
      ['Building/Military/Laboratory', 56],
      ['Building/Residential/Crystal', 75],
      ['Research/Evolution/Alloy', 65],
    ];
  },
};
