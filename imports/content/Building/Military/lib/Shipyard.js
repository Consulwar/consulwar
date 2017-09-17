export default {
  id: 'Building/Military/Shipyard',
  title: 'Верфь',
  description: 'Когда-то этим словом называли заводы по строительству кораблей. Собственно, с тех пор ничего не изменилось, кроме того, что современные корабли господствуют не в водной стихии, а в космосе. Отбить родную планету людей из этой вселенной — крайне важное и первостепенное задание, но ведь Рептилоиды имеют множество колоний и станций, их флот несомненно огромен и вашей колонии потребуется защита, Консул. Иначе вас могут просто уничтожить из космоса. Надеюсь, вы понимаете, что лучшая защита — это нападение.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство флота на ',
        textAfter: '% дешевле',
        condition: 'Unit/Space/Human',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return level * 0.2;
        },
      },
      {
        textBefore: 'Строительство флота на ',
        textAfter: '% быстрее',
        condition: 'Unit/Space/Human',
        priority: 2,
        affect: 'time',
        result(level = this.getCurrentLevel()) {
          return [0, 5, 10, 20, 30, 40][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [600, 'slowExponentialGrow', 0],
      crystals: [450, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [500, 'slowLinearGrow', 20];
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
        ['Building/Military/PowerStation', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 40],
        ['Building/Military/Airfield', 30],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 50],
        ['Building/Military/Airfield', 40],
        ['Building/Military/DefenseComplex', 20],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 60],
        ['Building/Military/Airfield', 50],
        ['Building/Military/DefenseComplex', 35],
        ['Research/Evolution/Ikea', 40],
      ];
    }
    return [
      ['Building/Military/PowerStation', 75],
      ['Building/Military/Airfield', 60],
      ['Building/Military/DefenseComplex', 60],
      ['Research/Evolution/Ikea', 70],
    ];
  },
};
