export default {
  id: 'Research/Fleet/Wasp',
  title: 'Усиление Осы',
  description: 'Осы – опасные штурмовые корабли, их мощь Рептилоиды зря недооценивают, а мы и рады будем этим воспользоваться. Как вам известно, Консул, у Осы присутствует система крепления к кораблям противника – её хвост; а также у неё есть система плазменных резаков на днище корабля, способная прорезать корпуса кораблей. При усилении Осы и её систем корабли данного типа будут иметь возможность подлетать к средним кораблям Рептилоидов и уничтожать их в ближнем бою. Правда, и Осу мы тоже потеряем…',
  effects: {
    Military: [
      {
        textBefore: 'Урон Осы +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Wasp',
        priority: 2,
        affect: 'damage',
        result({ level }) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Осы +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Wasp',
        priority: 2,
        affect: 'life',
        result({ level }) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [15, 'slowExponentialGrow', 0],
    };
  },
  plasmoidDuration: 60 * 60 * 24 * 28 * 6,
  maxLevel: 100,
  requirements() {
    return [
      ['Building/Residential/SpacePort', 1],
    ];
  },
};
