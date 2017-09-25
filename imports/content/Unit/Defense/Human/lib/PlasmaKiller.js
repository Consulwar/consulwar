export default {
  id: 'Unit/Defense/Human/PlasmaKiller',
  title: 'Плазменный Убийца',
  description: 'Мелкие и шустрые корабли Чешуйчатых постоянно обходят вашу оборону, потому что крупные орудия не могут по ним попасть, а простым пушкам не хватает урона, чтобы справиться с тысячами Истребителей? Это больше не проблема. Плазменный Убийца распидорасит на атомы этих надоедливых мошек, ведь у него просто превосходные параметры скорости атаки и урона.',
  basePrice: {
    metals: 140000,
    crystals: 20000,
    time: 5 * 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 80000, max: 120000 },
      signature: 2000,
    },
    health: {
      armor: 2000000,
      signature: 3000,
    },
  },
  targets: [
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Wyvern',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 50],
      ['Research/Evolution/Crystallization', 56],
      ['Research/Evolution/Hyperdrive', 46],
    ];
  },
};
