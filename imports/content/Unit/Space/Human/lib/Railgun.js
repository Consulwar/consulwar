export default {
  id: 'Unit/Space/Human/Railgun',
  title: 'Рейлган',
  description: 'Рейлганы – это небольшие дальнобойные орудия, управляемые искусственным разумом; по размеру не больше стандартной Осы. Эти маленькие убийцы – настоящий прорыв ювелирно точных технологий людей. Специальные плазменные призмы преобразуют энергию кристаллов в особое вещество, которое со скоростью света вырывается в нужном направлении и на огромном расстоянии буквально разрезает корабли врага пополам, как нож – тёплое масло. Рейлганы не обладают серьёзной бронёй, их защита – то, что они находятся далеко от поля боя. К сожалению, они практически беззащитны в ближнем бою.',
  basePrice: {
    metals: 1000,
    crystals: 2000,
    time: 60 * 60 * 4,
  },
  characteristics: {
    damage: {
      min: 40000,
      max: 50000,
    },
    life: 25000,
  },
  targets: [
    'Unit/Space/Reptile/Shadow',
    'Unit/Space/Reptile/Godzilla',
    'Unit/Space/Reptile/Prism',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 60],
      ['Building/Military/Shipyard', 55],
      ['Research/Evolution/Energy', 60],
      ['Research/Evolution/Hyperdrive', 55],
    ];
  },
};
