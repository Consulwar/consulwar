export default {
  id: 'Unit/Defense/Human/TripleCrystalGun',
  title: 'Трилинейный Кристалл-Ган',
  description: 'Вершина технологической эволюции. Мощность этого орудия просто колоссальна, его концентрированная кристаллическая плазма награждает моментальным загаром тысячи Рептилоидов, находящихся на бортах крупных кораблей. Щиты ТКГ могут выдерживать огромное количество урона, так что разрушить эти орудия практически невозможно.',
  basePrice: {
    credits: 5000,
    time: 60 * 30,
  },
  characteristics: {
    damage: {
      min: 200000,
      max: 250000,
    },
    life: 1500000,
  },
  targets: [
    'Unit/Space/Reptile/Shadow',
    'Unit/Space/Reptile/Godzilla',
    'Unit/Space/Reptile/Octopus',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 80],
      ['Research/Evolution/Engineering', 75],
    ];
  },
};
