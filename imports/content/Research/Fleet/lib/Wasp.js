import Wasp from '/imports/content/Unit/Space/Human/lib/Wasp';

export default {
  id: 'Research/Fleet/Wasp',
  title: 'Усиление Осы',
  description: 'Осы – опасные штурмовые корабли, их мощь Рептилоиды зря недооценивают, а мы и рады будем этим воспользоваться. Как вам известно, Консул, у Осы присутствует система крепления к кораблям противника – её хвост; а также у неё есть система плазменных резаков на днище корабля, способная прорезать корпуса кораблей. При усилении Осы и её систем корабли данного типа будут иметь возможность подлетать к средним кораблям Рептилоидов и уничтожать их в ближнем бою. Правда, и Осу мы тоже потеряем…',
  effects: {
    Military: [
      {
        textBefore: 'Урон Осы +',
        condition: {
          id: 'Unit/Space/Human/Wasp',
        },
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 2;
          } else if (level < 100) {
            return level * 4;
          }
          return level * 8;
        },
      },
      {
        textBefore: 'Броня Осы +',
        condition: {
          id: 'Unit/Space/Human/Wasp',
        },
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 3;
          } else if (level < 100) {
            return level * 5;
          }
          return level * 10;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [150, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Wasp.requirements,
};
