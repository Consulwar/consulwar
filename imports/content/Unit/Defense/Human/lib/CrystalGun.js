export default {
  id: 'Unit/Defense/Human/CrystalGun',
  title: 'Кристалл-Ган',
  description: 'Кристалл-Ган — это потрясающий пример оборонных технологий. Сам комплекс орудий устанавливается на планете, отчего уничтожить его становится довольно проблематично, при этом дальность атаки и точность этих орудий позволяют наносить огромный урон кораблям Зелёных тварей. Причём сконцентрированная в пушке энергия кристалла способна прошибать броню самых крупных кораблей.',
  basePrice: {
    metals: 1000,
    crystals: 500,
    time: 60 * 30,
  },
  characteristics: {
    damage: {
      min: 16000,
      max: 20000,
    },
    life: 120000,
  },
  targets: [
    'Unit/Space/Reptile/Godzilla',
    'Unit/Space/Reptile/Octopus',
    'Unit/Space/Reptile/Prism',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 75],
      ['Research/Evolution/Engineering', 70],
    ];
  },
};
