export default {
  id: 'Unit/Defense/Human/Tyrant',
  title: 'Жидкоплазменный Тиран',
  description: 'Когда Рептилии атакуют вас мощным флотом и выстраивают серьёзную оборону из крупных и тяжёлых кораблей, они точно не ожидают, что вы будете поливать их строй жидкой плазмой. Эта новейшая разработка в области вооружения способна, словно нож — масло, прорезать корабли ваших врагов насквозь. Изплазмительное орудие.',
  basePrice: {
    credits: 1000,
    time: 60 * 20,
  },
  characteristics: {
    damage: {
      min: 36000,
      max: 45000,
    },
    life: 250000,
  },
  targets: [
    'Unit/Space/Reptile/Armadillo',
    'Unit/Space/Reptile/Prism',
    'Unit/Space/Reptile/Hydra',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 70],
      ['Research/Evolution/Engineering', 65],
    ];
  },
};
