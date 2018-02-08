import { tier3 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/DoomsDaySizing',
  title: 'Калибровка Судного дня',
  description: 'ОСД или, как её прозвали ребята из научного сообщества, Орудие Судного Дня — это новейшая система вооружения, требующая огромного количества энергии для использования. В то же время испытания на одной из планет показали, на что способно ОСД. К сожалению, орудие настолько мощное, что приходится тратить кучу времени на его зарядку и калибровку. Однако же результат стоит того в полной мере.',
  effects: {
    Military: [
      {
        textBefore: '+',
        textAfter: '% к урону флагмана',
        condition: 'Unit/Human/Space/Flagship',
        priority: 2,
        affect: 'damage',
        result(level) {
          return level;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Вызов Потерянных быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Lost',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
    ],
  },
  basePrice: {
    group: 'aviation',
    tier: 4,
    humans: 100,
    metals: 400,
    crystals: 200,
    honor: 148,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Converter', 9],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Converter', 18],
        ['Research/Evolution/Energy', 20],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Converter', 27],
        ['Research/Evolution/Energy', 40],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Converter', 42],
        ['Research/Evolution/Energy', 58],
        ['Research/Evolution/Hyperdrive', 72],
      ];
    }
    return [
      ['Research/Evolution/Converter', 56],
      ['Research/Evolution/Energy', 80],
      ['Research/Evolution/Hyperdrive', 90],
    ];
  },
};
