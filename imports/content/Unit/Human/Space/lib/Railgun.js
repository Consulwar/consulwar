export default {
  id: 'Unit/Human/Space/Railgun',
  title: 'Рейлган',
  description: 'Рейлганы – это небольшие дальнобойные орудия, управляемые искусственным разумом; по размеру не больше стандартной Осы. Эти маленькие убийцы – настоящий прорыв ювелирно точных технологий людей. Специальные плазменные призмы преобразуют энергию кристаллов в особое вещество, которое со скоростью света вырывается в нужном направлении и на огромном расстоянии буквально разрезает корабли врага пополам, как нож – тёплое масло. Рейлганы не обладают серьёзной бронёй, их защита – то, что они находятся далеко от поля боя. К сожалению, они практически беззащитны в ближнем бою.',
  basePrice: {
    metals: 50000,
    crystals: 200000,
  },
  decayTime: 20 * 24 * 60 * 60,
  characteristics: {
    weapon: {
      damage: { min: 50000, max: 70000 },
      signature: 150,
    },
    health: {
      armor: 120000,
      signature: 40,
    },
  },
  targets: [
    'Unit/Reptile/Space/Hydra',
    'Unit/Reptile/Space/Octopus',
    'Unit/Reptile/Space/Prism',
  ],
  requirements() {
    return [
      ['Building/Residential/Spaceport', 62],
      ['Building/Military/Gates', 48],
      ['Research/Evolution/Energy', 60],
    ];
  },
};
