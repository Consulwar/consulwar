export default {
  id: 'Unit/Human/Defense/DoomsDayGun',
  title: 'Орудие Судного Дня',
  description: 'Раз, два, Орудие Судного Дня заберёт тебя… Это не шутки, Консул. Это уникальное строение способно уничтожать целые планеты и всё, что находится рядом с ними. Его орудия сокрушительны настолько, что на их перезарядку уходит целая прорва времени. И всё же, Консул, будьте осторожны — это оружие способно изменить ход истории.',
  basePrice: {
    'Resource/Artifact/Red/RubyPlasmoid': 500,
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
  targets: [
    // нет приоритетной цели, рандом
  ],
  requirements() {
    return [
      ['Building/Military/Complex', 80],
      ['Building/Residential/PulseCatcher', 66],
      ['Research/Evolution/DoomsDaySizing', 48],
    ];
  },
};
