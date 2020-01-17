import { tier3 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Hyperdrive',
  title: 'Гипердвигатели',
  description: '«Эй, Рулевой! Заряжай-ка движок!» — «А зачем, Адмирал?» — «Гиперпрыжок! Гиперпрыжок! Мы совершаем… гиперпрыжок!» Мне кажется, что именно такие песни должны петь на космических кораблях перед отправкой в гиперпространство. Вы только представьте себе, Консул, двигатель не разгоняет корабль путём стандартной тяги. Двигатель открывает портал, червоточину… Это, по сути, является искривлением пространства вселенной. Это воздействие на материю на квантовом уровне! Всегда интересовало: вот если мы можем совершать такие манипуляции с материей, почему мы ещё не научились создавать вещи из воздуха?',
  effects: {
    Special: [
      {
        condition: 'Unique/spaceEngine',
        textBefore: '',
        textAfter: ' уровень движителей',
        result({ level }) {
          return level;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Линкоров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Battleship',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Плазменных Убийц на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/PlasmaKiller',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Доставка Жидкоплазменных Тиранов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/Tyrant',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
    ],
  },
  basePrice: {
    group: 'special',
    tier: 4,
    humans: 65,
    metals: 240,
    crystals: 300,
    honor: 160,
  },
  plasmoidDuration: 60 * 60 * 24 * 1,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 40],
        ['Research/Evolution/Converter', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 54],
        ['Research/Evolution/Converter', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 68],
        ['Research/Evolution/Converter', 40],
        ['Building/Military/Shipyard', 40],
      ];
    }
    return [
      ['Building/Military/Laboratory', 90],
      ['Research/Evolution/Converter', 50],
      ['Building/Military/Shipyard', 50],
    ];
  },
};
