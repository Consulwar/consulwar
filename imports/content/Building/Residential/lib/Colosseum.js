export default {
  id: 'Building/Residential/Colosseum',
  title: 'Колизей',
  description: 'Хлеба и зрелищ. Не так ли? А что, если бы можно было вернуть времена древнего Рима и устраивать настоящие кровавые битвы? Кровь, кишки… Мясо! Ах, ну да… Тут же война с Рептилоидами на дворе, да ещё и эти морально-культурные ценности… О! А что, если устраивать битвы не между людьми, а между пленными Рептилиями?! Какая замечательная идея, Консул. Вы уже слышите, как ликуют трибуны, наблюдая за тем, как чешуйчатые кромсают друг друга ради свободы… Которую они, кстати, не получат. Подобные развлечения могут принести вашей колонии дополнительный доход. Что скажете, Великий Консул?',
  effects: {
    Special: [
      {
        textBefore: 'Снижает время между турнирами на ',
        textAfter: ' секунд',
        result(level) {
          return level * 580;
        },
      },
      {
        textBefore: '',
        textAfter: ' турниров открыто',
        result(level) {
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
  basePrice: {
    group: 'special',
    tier: 4,
    humans: 100,
    metals: 220,
    crystals: 160,
    honor: 130,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/Statue', 10],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/Statue', 24],
        ['Building/Military/Barracks', 24],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/Statue', 40],
        ['Building/Military/Barracks', 38],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/Statue', 50],
        ['Building/Military/Barracks', 52],
        ['Building/Residential/BlackMarket', 60],
      ];
    }
    return [
      ['Building/Residential/Statue', 65],
      ['Building/Military/Barracks', 80],
      ['Building/Residential/BlackMarket', 80],
    ];
  },
};
