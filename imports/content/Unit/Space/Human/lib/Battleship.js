export default {
  id: 'Unit/Space/Human/Battleship',
  title: 'Линкор',
  description: 'Линкор или Линейный корабль — основная боевая единица в космосе. Сам Адмирал Стил Болз назвал эти Линкоры величайшим космическим орудием. Понятно, что есть корабли и мощнее, однако же сочетание серьёзного вооружения, крепкой брони, относительно невысокой стоимости и прекрасных показателей приоритетов атаки делают Линкоры самым полезным кораблём на поле боя, способным дать отпор даже крайне Ебучим Флотилиям Рептилоидов.',
  basePrice: {
    humans: 5000,
    metals: 150000,
    crystals: 30000,
    time: 2 * 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 36000, max: 44000 },
      signature: 500,
    },
    health: {
      armor: 160000,
      signature: 1000,
    },
  },
  targets: [
    'Unit/Space/Reptile/Armadillo',
    'Unit/Space/Reptile/Hydra',
    'Unit/Space/Reptile/Dragon',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 35],
      ['Research/Evolution/Alloy', 35],
      ['Research/Evolution/Hyperdrive', 20],
    ];
  },
};
