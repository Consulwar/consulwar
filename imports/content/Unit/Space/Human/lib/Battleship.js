export default {
  id: 'Unit/Space/Human/Battleship',
  title: 'Линкор',
  description: 'Линкор или Линейный корабль — основная боевая единица в космосе. Сам Адмирал Стил Болз назвал эти Линкоры величайшим космическим орудием. Понятно, что есть корабли и мощнее, однако же сочетание серьёзного вооружения, крепкой брони, относительно невысокой стоимости и прекрасных показателей приоритетов атаки делают Линкоры самым полезным кораблём на поле боя, способным дать отпор даже крайне Ебучим Флотилиям Рептилоидов.',
  basePrice: {
    humans: 7500,
    metals: 650,
    crystals: 140,
    time: 60 * 20,
  },
  characteristics: {
    damage: {
      min: 4000,
      max: 5000,
    },
    life: 15000,
  },
  targets: [
    'Unit/Space/Reptile/Hydra',
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 45],
      ['Building/Military/Shipyard', 40],
      ['Research/Evolution/Alloy', 40],
      ['Research/Evolution/Hyperdrive', 1],
    ];
  },
};
