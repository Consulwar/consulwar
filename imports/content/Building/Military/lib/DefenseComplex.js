export default {
  id: 'Building/Military/DefenseComplex',
  title: 'Оборонный комплекс',
  description: 'Оборонный комплекс занимается разработкой новых видов вооружения, которое сможет отбивать нападения Рептилоидов на вашу планету или на другие ваши колонии. От минных полей — до гигантских пушек, способных за несколько залпов ломать самые мощные корабли. Пусть ваш народ почувствует себя в безопасности. Застройтесь к чертям собачьим турелями и наблюдайте, как корабли Рептилий сыпятся с неба.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство обороны на ',
        textAfter: '% дешевле',
        condition: 'Unit/Human/Defense',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level) {
          return level * 0.3;
        },
      },
      {
        textBefore: 'Строительство обороны на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense',
        priority: 2,
        affect: 'time',
        result(level) {
          return [0, 10, 17, 33, 54, 100][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [5, 'slowExponentialGrow', 0],
      crystals: [5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [60, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [10, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.SecretTechnology = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.chip = [6, 'slowLinearGrow', 60];
    } else {
      price.AmethystPlasmoid = [4, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/PowerStation', 20],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 30],
        ['Research/Evolution/Engineering', 10],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 45],
        ['Research/Evolution/Engineering', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 60],
        ['Research/Evolution/Engineering', 50],
        ['Research/Evolution/Nanotechnology', 48],
      ];
    }
    return [
      ['Building/Military/PowerStation', 75],
      ['Research/Evolution/Engineering', 70],
      ['Research/Evolution/Nanotechnology', 68],
    ];
  },
};
