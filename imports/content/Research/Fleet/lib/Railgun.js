import Railgun from '/imports/content/Unit/Space/Human/lib/Railgun';

export default {
  id: 'Research/Fleet/Railgun',
  title: 'Усиление Рейлгана',
  description: 'Усиливать ли главный снайперский корабль Империи людей? Хм… Ну, я даже не знаю. Если вы собираетесь сражаться против мелких и юрких кораблей вроде Сферо или Клинка, то, само собой, нет. Однако же, если вы доросли до серьёзной битвы, и ваш противник не кто иной, как Тень… Уж поверьте, Консул, пара десятков точных, мощных, всепрошибающих выстрелов от Рейлганов положат даже такого здоровяка, как Тень Рептилоидов.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Рейлгана +',
        condition: 'Unit/Space/Human/Railgun',
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 250;
          } else if (level < 100) {
            return level * 500;
          }
          return level * 1000;
        },
      },
      {
        textBefore: 'Броня Рейлгана +',
        condition: 'Unit/Space/Human/Railgun',
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 100;
          } else if (level < 100) {
            return level * 200;
          }
          return level * 400;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [1800, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Railgun.requirements,
};
