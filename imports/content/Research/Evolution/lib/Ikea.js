export default {
  id: 'Research/Evolution/Ikea',
  title: 'Мебель из Икеа',
  description: 'Удобство в каждой мелочи… Это же сраное будущее, чёрт возьми! Ну, технически на дворе тот же год, что и у нас, но ведь нельзя не признать, что ребята из параллельной вселенной смогли достичь гораздо большего за тот же промежуток времени. Уверен, новые виды оружия массового поражения придумывали сидя именно на таких прекрасных, крайне удобных и эргономичных стульях из Икеа. Люди любят удобство, Консул. В благоприятной обстановке они лучше работают, лучше думают и лучше взаимодействуют. Недаром слоган этой известной компании гласит: «Каждый десятый европеец сделан на нашей кровати». Вы несомненно сможете улучшить показатели рождаемости в вашей колонии, оснастив подобной мебелью всех своих жителей.',
  effects: {
    Income: [
      {
        textBefore: 'Прирост населения на ',
        textAfter: '%',
        priority: 2,
        affect: 'humans',
        result(level) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        priority: 2,
        affect: 'humans',
        result(level) {
          return [0, 3, 5, 8, 10, 15][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.35, 'slowExponentialGrow', 0],
      crystals: [0.1, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [13, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [1, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.shipDetails = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.rotaryAmplifier = [5, 'slowLinearGrow', 60];
    } else {
      price.nanoWires = [6, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 20],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 39],
        ['Research/Evolution/Alloy', 18],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 59],
        ['Research/Evolution/Alloy', 32],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 69],
        ['Research/Evolution/Alloy', 51],
        ['Research/Evolution/AnimalWorld', 38],
      ];
    }
    return [
      ['Building/Military/Laboratory', 85],
      ['Research/Evolution/Alloy', 80],
      ['Research/Evolution/AnimalWorld', 54],
    ];
  },
};
