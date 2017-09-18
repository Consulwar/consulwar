export default {
  id: 'Unit/Defense/Human/PlasmaKiller',
  title: 'Плазменный Убийца',
  description: 'Мелкие и шустрые корабли Чешуйчатых постоянно обходят вашу оборону, потому что крупные орудия не могут по ним попасть, а простым пушкам не хватает урона, чтобы справиться с тысячами Истребителей? Это больше не проблема. Плазменный Убийца распидорасит на атомы этих надоедливых мошек, ведь у него просто превосходные параметры скорости атаки и урона.',
  basePrice: {
    metals: 80000,
    crystals: 20000,
    time: 60 * 20,
  },
  characteristics: {
    damage: {
      min: 6400,
      max: 8000,
    },
    life: 100000,
  },
  targets: [
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Wyvern',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 60],
      ['Research/Evolution/Engineering', 55],
    ];
  },
};
