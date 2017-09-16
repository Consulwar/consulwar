export default {
  id: 'Building/Residential/Colosseum',
  title: 'Колизей',
  description: 'Хлеба и зрелищ. Не так ли? А что, если бы можно было вернуть времена древнего Рима и устраивать настоящие кровавые битвы? Кровь, кишки… Мясо! Ах, ну да… Тут же война с Рептилоидами на дворе, да ещё и эти морально-культурные ценности… О! А что, если устраивать битвы не между людьми, а между пленными Рептилиями?! Какая замечательная идея, Консул. Вы уже слышите, как ликуют трибуны, наблюдая за тем, как чешуйчатые кромсают друг друга ради свободы… Которую они, кстати, не получат. Подобные развлечения могут принести вашей колонии дополнительный доход. Что скажете, Великий Консул?',
  effects: {
    Special: [
      {
        textBefore: 'Снижает время между турнирами на ',
        textAfter: ' секунд',
        result(level = this.getCurrentLevel()) {
          return level * 580;
        },
      },
      {
        textBefore: '',
        textAfter: ' турниров открыто',
        result(level = this.getCurrentLevel()) {
          return level === 0 ? 0 : [
            '1 вид',
            '2 вида',
            '3 вида',
            '4 вида',
            '5 видов',
            '6 видов',
          ][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1000, 'slowExponentialGrow', 0],
      crystals: [750, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [50, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [5, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.quadCooler = [6, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.garyoldmanium = [5, 'slowLinearGrow', 60];
    } else {
      price.AncientScheme = [3, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Alloy', 30],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Alloy', 45],
        ['Building/Military/Factory', 25],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Alloy', 65],
        ['Building/Military/Factory', 40],
        ['Research/Evolution/Crystallization', 35],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Alloy', 85],
        ['Building/Military/Factory', 55],
        ['Research/Evolution/Crystallization', 55],
        ['Building/Residential/Statue', 45],
      ];
    }
    return [
      ['Research/Evolution/Alloy', 100],
      ['Building/Military/Factory', 80],
      ['Research/Evolution/Crystallization', 75],
      ['Building/Residential/Statue', 75],
    ];
  },
};
