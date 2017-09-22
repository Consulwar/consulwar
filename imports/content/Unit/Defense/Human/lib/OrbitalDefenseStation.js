export default {
  id: 'Unit/Defense/Human/OrbitalDefenseStation',
  title: 'Орбитальная Станция Обороны',
  description: 'Космическая Станция Обороны —это гигантский боевой комплекс на орбите планеты. Броня этого грандиозного сооружения почти непробиваема, а вооружение отличается невероятной точностью и мощностью. Имей вы такой объект на орбите своей колонии, Консул, Чешуйчатые подумали бы дважды, прежде чем нападать на вас.',
  basePrice: {
    metals: 12000,
    crystals: 3500,
    time: 60 * 60 * 24,
  },
  characteristics: {
    damage: {
      min: 160000,
      max: 200000,
    },
    life: 800000,
  },
  targets: [
    'Unit/Space/Reptile/Armadillo',
    'Unit/Space/Reptile/Shadow',
    'Unit/Space/Reptile/Blade',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 90],
      ['Research/Evolution/Engineering', 85],
      ['Research/Evolution/Converter', 70],
      ['Building/Military/OSCD', 10],
    ];
  },
};
