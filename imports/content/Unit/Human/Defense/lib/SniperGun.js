export default {
  id: 'Unit/Human/Defense/SniperGun',
  title: 'Снайпер Ган',
  description: 'Такие орудия, как Снайпер Ган и Рельсовая Пушка, устанавливаются на специальных платформах на орбите вашей планеты. Они способны вести прицельный точечный огонь по хорошо бронированным кораблям. Дальность стрельбы позволяет этому орудию некоторое время избегать атак после начала боя.',
  basePrice: {
    metals: 4000,
    crystals: 2000,
  },
  queue: 'Defense/Regular',
  decayTime: 12 * 60 * 60,
  characteristics: {
    weapon: {
      damage: { min: 4000, max: 6000 },
      signature: 500,
    },
    health: {
      armor: 12000,
      signature: 1000,
    },
  },
  targets: [
    'Unit/Reptile/Space/Wyvern',
    'Unit/Reptile/Space/Dragon',
    'Unit/Reptile/Space/Hydra',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 33],
      ['Research/Evolution/Drill', 30],
    ];
  },
};
