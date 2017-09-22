export default {
  id: 'Building/Military/DefenseComplex',
  title: 'Оборонный комплекс',
  description: 'Оборонный комплекс занимается разработкой новых видов вооружения, которое сможет отбивать нападения Рептилоидов на вашу планету или на другие ваши колонии. От минных полей — до гигантских пушек, способных за несколько залпов ломать самые мощные корабли. Пусть ваш народ почувствует себя в безопасности. Застройтесь к чертям собачьим турелями и наблюдайте, как корабли Рептилий сыпятся с неба.',
  effects: {
    Price: [
      {
        textBefore: 'Строительство обороны на ',
        textAfter: '% дешевле',
        condition: 'Unit/Defense/Human',
        priority: 2,
        affect: ['metals', 'crystals'],
        result(level = this.getCurrentLevel()) {
          return level * 0.3;
        },
      },
      {
        textBefore: 'Строительство обороны на ',
        textAfter: '% быстрее',
        condition: 'Unit/Defense/Human',
        priority: 2,
        affect: 'time',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 15, 25, 35, 50][Math.floor(level / 20)];
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
        ['Building/Military/PowerStation', 35],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 45],
        ['Research/Evolution/Engineering', 1],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 55],
        ['Research/Evolution/Engineering', 20],
        ['Building/Residential/PulseCatcher', 20],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 65],
        ['Research/Evolution/Engineering', 40],
        ['Building/Residential/PulseCatcher', 40],
      ];
    }
    return [
      ['Building/Military/PowerStation', 80],
      ['Research/Evolution/Engineering', 65],
      ['Building/Residential/PulseCatcher', 60],
    ];
  },
};
