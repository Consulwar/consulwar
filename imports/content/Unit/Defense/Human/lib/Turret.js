export default {
  id: 'Unit/Defense/Human/Turret',
  title: 'Турель',
  description: 'Эти специализированные Турели, Консул, устанавливаются на дальних рубежах. Они не требуют перезарядки, так как заряжаются от солнечной энергии, и имеют угол обзора 360 градусов, осуществляемый за счет гравитационных двигателей. В основном Турели используются для уничтожения небольших и шустрых кораблей.',
  basePrice: {
    metals: 60,
    crystals: 10,
    time: 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 12, max: 16 },
      signature: 100,
    },
    health: {
      armor: 100,
      signature: 50,
    },
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Residential/Spaceport', 10],
    ];
  },
};
