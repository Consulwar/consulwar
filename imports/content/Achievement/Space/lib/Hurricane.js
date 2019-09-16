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
        textBefore: 'Строительство Гаммадронов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Gammadrone',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Ос быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Wasp',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Миражей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Mirage',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Рейлганов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Railgun',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Фрегатов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Frigate',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Траков C быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/TruckC',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Крейсеров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Cruiser',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Линкоров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Battleship',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Авианосцев быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Carrier',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Дредноутов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 8,
        affect: 'time',
        result: effect,
      },
      {
        textBefore: 'Строительство Пожинателей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Reaper',
        priority: 8,
        affect: 'time',
        result: effect,
      },
    ],
  },
};
