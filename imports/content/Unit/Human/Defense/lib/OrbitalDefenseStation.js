export default {
  id: 'Unit/Human/Defense/OrbitalDefenseStation',
  title: 'Орбитальная Станция Обороны',
  description: 'Космическая Станция Обороны — это гигантский боевой комплекс на орбите планеты. Броня этого грандиозного сооружения почти непробиваема, а вооружение отличается невероятной точностью и мощностью. Имей вы такой объект на орбите своей колонии, Консул, Чешуйчатые подумали бы дважды, прежде чем нападать на вас.',
  basePrice: {
    humans: 3000000,
    metals: 20000000,
    crystals: 20000000,
  },
  queue: 'Defense/Ultimate',
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
  maxCount: 1,
  targets: [
    'Unit/Reptile/Space/Armadillo',
    'Unit/Reptile/Space/Shadow',
    'Unit/Reptile/Space/Blade',
  ],
  requirements() {
    return [
      ['Building/Military/OSCD', 5],
      ['Building/Residential/Alliance', 30],
      ['Research/Evolution/Engineering', 28],
    ];
  },
};
