export default {
  id: 'Unit/Defense/Human/SniperGun',
  title: 'Снайпер Ган',
  description: 'Такие орудия, как Снайпер Ган и Рельсовая Пушка, устанавливаются на специальных платформах на орбите вашей планеты. Они способны вести прицельный точечный огонь по хорошо бронированным кораблям. Дальность стрельбы позволяет этому орудию некоторое время избегать атак после начала боя.',
  basePrice: {
    metals: 200,
    crystals: 100,
    time: 60 * 5,
  },
  characteristics: {
    damage: {
      min: 2400,
      max: 3000,
    },
    life: 20000,
  },
  targets: [
    'Unit/Space/Reptile/Wyvern',
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Hydra',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 40],
      ['Research/Evolution/Engineering', 35],
    ];
  },
};
