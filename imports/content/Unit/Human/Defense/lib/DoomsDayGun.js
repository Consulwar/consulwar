export default {
  id: 'Unit/Human/Defense/DoomsDayGun',
  title: 'Орудие Судного Дня',
  description: 'Раз, два, Орудие Судного Дня заберёт тебя… Это не шутки, Консул. Это уникальное строение способно уничтожать целые планеты и всё, что находится рядом с ними. Его орудия сокрушительны настолько, что на их перезарядку уходит целая прорва времени. И всё же, Консул, будьте осторожны — это оружие способно изменить ход истории. ВНИМАНИЕ: НЕОБРАТИМО',
  basePrice: {
    'Resource/Artifact/Red/RubyPlasmoid': 200,
  },
  queue: 'Defense/Ultimate',
  characteristics: {
    weapon: {
      damage: { min: 1000000000, max: 1000000000 },
      signature: 1,
    },
    health: {
      armor: 1,
      signature: 1,
    },
  },
  maxCount: 1,
  targets: [
    // нет приоритетной цели, рандом
  ],
  requirements() {
    return [
      ['Building/Military/Complex', 120],
      ['Building/Residential/PulseCatcher', 120],
      ['Research/Evolution/DoomsDaySizing', 120],
    ];
  },
};
