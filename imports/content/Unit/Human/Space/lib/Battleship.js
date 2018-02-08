export default {
  id: 'Unit/Human/Space/Battleship',
  title: 'Линкор',
  description: 'Линкор или Линейный корабль — основная боевая единица в космосе. Сам Адмирал Стил Болз назвал эти Линкоры величайшим космическим орудием. Понятно, что есть корабли и мощнее, однако же сочетание серьёзного вооружения, крепкой брони, относительно невысокой стоимости и прекрасных показателей приоритетов атаки делают Линкоры самым полезным кораблём на поле боя, способным дать отпор даже крайне Ебучим Флотилиям Рептилоидов.',
  basePrice: {
    humans: 5000,
    metals: 150000,
    crystals: 30000,
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
    'Unit/Reptile/Space/Armadillo',
    'Unit/Reptile/Space/Hydra',
    'Unit/Reptile/Space/Dragon',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 35],
      ['Research/Evolution/Alloy', 35],
      ['Research/Evolution/Hyperdrive', 20],
    ];
  },
};
