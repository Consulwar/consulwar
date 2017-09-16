export default {
  id: 'Unit/Defense/Human/DoomsDayGun',
  title: 'Орудие Судного Дня',
  description: 'Раз, два, Орудие Судного Дня заберёт тебя… Это не шутки, Консул. Это уникальное строение способно уничтожать целые планеты и всё, что находится рядом с ними. Его орудия сокрушительны настолько, что на их перезарядку уходит целая прорва времени. И всё же, Консул, будьте осторожны — это оружие способно изменить ход истории.',
  basePrice: {
    RubyPlasmoid: 500,
    time: 60 * 60 * 24 * 7,
  },
  characteristics: {
    damage: {
      min: 800000,
      max: 1000000,
    },
    life: 0,
  },
  targets: [
    // нет приоритетной цели, рандом
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 100],
      ['Research/Evolution/Engineering', 100],
      ['Building/Military/Void', 80],
      ['Research/Evolution/DoomsDaySizing', 10],
    ];
  },
};
