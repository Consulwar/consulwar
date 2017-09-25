export default {
  id: 'Unit/Defense/Human/OrbitalDefenseStation',
  title: 'Орбитальная Станция Обороны',
  description: 'Космическая Станция Обороны — это гигантский боевой комплекс на орбите планеты. Броня этого грандиозного сооружения почти непробиваема, а вооружение отличается невероятной точностью и мощностью. Имей вы такой объект на орбите своей колонии, Консул, Чешуйчатые подумали бы дважды, прежде чем нападать на вас.',
  basePrice: {
    humans: 3000000,
    metals: 20000000,
    crystals: 20000000,
    time: 90 * 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 20000000, max: 20000000 },
      signature: 15000,
    },
    health: {
      armor: 500000000,
      signature: 100000,
    },
  },
  targets: [
    'Unit/Space/Reptile/Armadillo',
    'Unit/Space/Reptile/Shadow',
    'Unit/Space/Reptile/Blade',
  ],
  requirements() {
    return [
      ['Building/Residential/Alliance', 30],
      ['Research/Evolution/Engineering', 28],
      ['Building/Military/OSCD', 5],
    ];
  },
};
