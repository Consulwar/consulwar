export default {
  id: 'Research/Fleet/Railgun',
  title: 'Усиление Рейлгана',
  description: 'Усиливать ли главный снайперский корабль Империи людей? Хм… Ну, я даже не знаю. Если вы собираетесь сражаться против мелких и юрких кораблей вроде Сферо или Клинка, то, само собой, нет. Однако же, если вы доросли до серьёзной битвы, и ваш противник не кто иной, как Тень… Уж поверьте, Консул, пара десятков точных, мощных, всепрошибающих выстрелов от Рейлганов положат даже такого здоровяка, как Тень Рептилоидов.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Рейлгана +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Railgun',
        priority: 2,
        affect: 'damage',
        result(level) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Рейлгана +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Railgun',
        priority: 2,
        affect: 'life',
        result(level) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [180, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements() {
    return [
      ['Building/Residential/Spaceport', 62],
      ['Building/Military/Gates', 48],
      ['Research/Evolution/Energy', 60],
    ];
  },
};
