const effect = function ({ level }) {
  return [0, 1, 3, 6, 10][level];
};

export default {
  id: 'Achievement/Space/Hurricane',
  levels: [1, 2, 3, 4],
  title: [
    'Ураган пати 1 степени',
    'Ураган пати 2 степени',
    'Ураган пати 3 степени',
    'Ураган пати 4 степени',
  ],
  description: 'Отправил ёбаный флот в блядский рейд',
  effects: {
    Price: [
      {
        condition: 'Unit/Human/Space/Gammadrone',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Wasp',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Mirage',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Railgun',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Frigate',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/TruckC',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Cruiser',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Battleship',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Carrier',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 10,
        affect: 'time',
        result: effect,
      },
      {
        condition: 'Unit/Human/Space/Reaper',
        priority: 10,
        affect: 'time',
        result: effect,
      },
    ],
    Special: [
      {
        textBefore: 'Строительство флота быстрее на ',
        textAfter: '%',
        result: effect,
      },
    ],
  },
};
