export default {
  id: 'Unit/Human/Defense/TripleCrystalGun',
  title: 'Трилинейный Кристалл-Ган',
  description: 'Вершина технологической эволюции. Мощность этого орудия просто колоссальна, его концентрированная кристаллическая плазма награждает моментальным загаром тысячи Рептилоидов, находящихся на бортах крупных кораблей. Щиты ТКГ могут выдерживать огромное количество урона, так что разрушить эти орудия практически невозможно.',
  basePrice: {
    credits: 40000,
    time: 10 * 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 9000000, max: 11000000 },
      signature: 10000,
    },
    health: {
      armor: 100000000,
      signature: 20000,
    },
  },
  targets: [
    'Unit/Reptile/Space/Shadow',
    'Unit/Reptile/Space/Godzilla',
    'Unit/Reptile/Space/Octopus',
  ],
  requirements() {
    return [
      ['Building/Residential/Political', 65],
      ['Building/Military/Storage', 48],
      ['Research/Evolution/Engineering', 58],
    ];
  },
};
