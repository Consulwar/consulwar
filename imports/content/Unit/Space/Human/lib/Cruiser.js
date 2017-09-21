export default {
  id: 'Unit/Space/Human/Cruiser',
  title: 'Крейсер',
  description: 'Крейсер, как понятно из названия, универсальный боевой корабль, способный выполнять практически любые задачи независимо от основного флота. Оснащён высокоточным ионным орудием, способным вывести из строя почти любые щиты противника. Крейсер также отлично подходит для уничтожения небольших и шустрых целей. Его нельзя назвать основным оружием в космических баталиях против Рептилоидов, однако же и нельзя недооценивать его потенциал. Если флот противника состоит преимущественно из кораблей класса «штурмовик», то несколько таких машинок расправятся с ними гораздо быстрее, чем сотня Ос.',
  basePrice: {
    humans: 1500,
    metals: 300,
    crystals: 100,
    time: 600,
  },
  characteristics: {
    damage: {
      min: 2400,
      max: 3000,
    },
    life: 7000,
  },
  targets: [
    'Unit/Space/Reptile/Wyvern',
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Hydra',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 35],
      ['Building/Military/Shipyard', 30],
      ['Research/Evolution/Science', 25],
    ];
  },
};
