export default {
  id: 'Unit/Defense/Human/Turret',
  title: 'Турель',
  description: 'Эти специализированные Турели, Консул, устанавливаются на дальних рубежах. Они не требуют перезарядки, так как заряжаются от солнечной энергии, и имеют угол обзора 360 градусов, осуществляемый за счет гравитационных двигателей. В основном Турели используются для уничтожения небольших и шустрых кораблей.',
  basePrice: {
    metals: 3000,
    crystals: 500,
    time: 60,
  },
  characteristics: {
    damage: {
      min: 400,
      max: 500,
    },
    life: 2000,
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 20],
      ['Research/Evolution/Engineering', 5],
    ];
  },
};
