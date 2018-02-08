import { tier1 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Shipyard',
  title: 'Верфь',
  description: 'Когда-то этим словом называли заводы по строительству кораблей. Собственно, с тех пор ничего не изменилось, кроме того, что современные корабли господствуют не в водной стихии, а в космосе. Отбить родную планету людей из этой вселенной — крайне важное и первостепенное задание, но ведь Рептилоиды имеют множество колоний и станций, их флот несомненно огромен и вашей колонии потребуется защита, Консул. Иначе вас могут просто уничтожить из космоса. Надеюсь, вы понимаете, что лучшая защита — это нападение.',
  effects: {
    Special: [
      {
        textBefore: 'Строительство тяжёлых кораблей быстрее на ',
        textAfter: '%',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Фригатов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Frigate',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Траков C быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/TruckC',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Крейсеров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Cruiser',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Линкоров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Battleship',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Авианосцев быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Carrier',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Дредноутов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Пожинателей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Reaper',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
    ],
  },
  basePrice: {
    group: 'fleet',
    tier: 2,
    humans: 7,
    metals: 16,
    crystals: 5,
    honor: 25,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/Alliance', 1],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/Alliance', 22],
        ['Research/Evolution/Hyperdrive', 10],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/Alliance', 44],
        ['Research/Evolution/Hyperdrive', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/Alliance', 62],
        ['Research/Evolution/Hyperdrive', 50],
        ['Building/Military/Complex', 50],
      ];
    }
    return [
      ['Building/Residential/Alliance', 80],
      ['Research/Evolution/Hyperdrive', 70],
      ['Building/Military/Complex', 70],
    ];
  },
};
