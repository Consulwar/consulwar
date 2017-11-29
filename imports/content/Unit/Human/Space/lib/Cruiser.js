export default {
  id: 'Unit/Human/Space/Cruiser',
  title: 'Крейсер',
  description: 'Крейсер, как понятно из названия, универсальный боевой корабль, способный выполнять практически любые задачи независимо от основного флота. Оснащён высокоточным ионным орудием, способным вывести из строя почти любые щиты противника. Крейсер также отлично подходит для уничтожения небольших и шустрых целей. Его нельзя назвать основным оружием в космических баталиях против Рептилоидов, однако же и нельзя недооценивать его потенциал. Если флот противника состоит преимущественно из кораблей класса «штурмовик», то несколько таких машинок расправятся с ними гораздо быстрее, чем сотня Ос.',
  basePrice: {
    humans: 1000,
    metals: 13000,
    crystals: 4000,
    time: 1 * 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 5400, max: 6600 },
      signature: 380,
    },
    health: {
      armor: 13000,
      signature: 750,
    },
  },
  targets: [
    'Unit/Reptile/Space/Hydra',
    'Unit/Reptile/Space/Armadillo',
    'Unit/Reptile/Space/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 30],
      ['Building/Military/Barracks', 32],
      ['Research/Evolution/Energy', 30],
    ];
  },
};
