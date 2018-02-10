export default {
  id: 'Unit/Human/Defense/CrystalGun',
  title: 'Кристалл-Ган',
  description: 'Кристалл-Ган — это потрясающий пример оборонных технологий. Сам комплекс орудий устанавливается на планете, отчего уничтожить его становится довольно проблематично, при этом дальность атаки и точность этих орудий позволяют наносить огромный урон кораблям Зелёных тварей. Причём сконцентрированная в пушке энергия кристалла способна прошибать броню самых крупных кораблей.',
  basePrice: {
    metals: 100000,
    crystals: 300000,
  },
  decayTime: 10 * 24 * 60 * 60,
  characteristics: {
    weapon: {
      damage: { min: 720000, max: 880000 },
      signature: 6000,
    },
    health: {
      armor: 10000000,
      signature: 5000,
    },
  },
  targets: [
    'Unit/Reptile/Space/Godzilla',
    'Unit/Reptile/Space/Octopus',
    'Unit/Reptile/Space/Prism',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 65],
      ['Building/Military/Gates', 50],
      ['Research/Evolution/Engineering', 60],
    ];
  },
};
