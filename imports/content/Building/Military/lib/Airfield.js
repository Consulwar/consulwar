import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Airfield',
  title: 'Военный аэродром',
  description: '«У них члены больше чем у нас? Бомби их!» © Джордж Карлин. Авиация, разумеется, является крайне важным элементом на боевой карте Земли. Без поддержки с воздуха любую нашу армию разнесут в щепки превосходящие силы Рептилоидов. Аэродром в основном специализируется на подготовке и оснащении истребителей и бомбардировщиков для ведения боя в условиях атмосферы, однако многие разработки, ведущиеся здесь, крайне важны и для космических кораблей. Это превращает Аэродром в необходимый для нашей миссии элемент военно-промышленного комплекса, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство авиации на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Миражей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Mirage',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Траков C быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/TruckC',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'aviation',
    tier: 2,
    humans: 6,
    metals: 8,
    crystals: 9,
    honor: 20,
  },
  plasmoidDuration: 60 * 60 * 24 * 28,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 9],
        ['Building/Residential/Crystal', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 27],
        ['Building/Residential/Crystal', 28],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 37],
        ['Building/Residential/Crystal', 46],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 47],
        ['Building/Residential/Crystal', 66],
        ['Research/Evolution/DoomsDaySizing', 50],
      ];
    }
    return [
      ['Building/Military/PowerStation', 57],
      ['Building/Residential/Crystal', 88],
      ['Research/Evolution/DoomsDaySizing', 70],
    ];
  },
};
