export default {
  id: 'Unit/Defense/Human/Tyrant',
  title: 'Жидкоплазменный Тиран',
  description: 'Когда Рептилии атакуют вас мощным флотом и выстраивают серьёзную оборону из крупных и тяжёлых кораблей, они точно не ожидают, что вы будете поливать их строй жидкой плазмой. Эта новейшая разработка в области вооружения способна, словно нож — масло, прорезать корабли ваших врагов насквозь. Изплазмительное орудие.',
  basePrice: {
    credits: 5000,
    time: 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 360000, max: 440000 },
      signature: 1800,
    },
    health: {
      armor: 4000000,
      signature: 2500,
    },
  },
  targets: [
    'Unit/Space/Reptile/Armadillo',
    'Unit/Space/Reptile/Prism',
    'Unit/Space/Reptile/Hydra',
  ],
  requirements() {
    return [
      ['Building/Residential/Political', 50],
      ['Research/Evolution/Crystallization', 54],
      ['Research/Evolution/Hyperdrive', 43],
    ];
  },
};
