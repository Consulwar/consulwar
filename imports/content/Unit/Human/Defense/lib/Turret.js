export default {
  id: 'Unit/Human/Defense/Turret',
  title: 'Турель',
  description: 'Эти специализированные Турели, Консул, устанавливаются на дальних рубежах. Они не требуют перезарядки, так как заряжаются от солнечной энергии, и имеют угол обзора 360 градусов, осуществляемый за счет гравитационных двигателей. В основном Турели используются для уничтожения небольших и шустрых кораблей.',
  basePrice: {
    metals: 60,
    crystals: 10,
  },
  decayTime: 15 * 60,
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
    'Unit/Reptile/Space/Sphero',
    'Unit/Reptile/Space/Blade',
    'Unit/Reptile/Space/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Residential/SpacePort', 10],
    ];
  },
};
