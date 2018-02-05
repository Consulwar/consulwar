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
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [6, 'slowExponentialGrow', 0],
      crystals: [4.5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [50, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [7, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.batteries = [5, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nanoWires = [6, 'slowLinearGrow', 60];
    } else {
      price.jimcarrium = [4, 'slowLinearGrow', 80];
    }
    return price;
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
