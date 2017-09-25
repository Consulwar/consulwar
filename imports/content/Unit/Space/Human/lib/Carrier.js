export default {
  id: 'Unit/Space/Human/Carrier',
  title: 'Авианосец',
  description: 'Авианосец, или, как его ещё называют, Улей – это огромный боевой корабль-завод. Он способен производить и ремонтировать Гаммадронов прямо во время боя. Авианосец имеет серьёзное вооружение, однако же основной урон он наносит благодаря рою дронов, который всегда его сопровождает. Именно поэтому его и прозвали Ульем, хотя руководству по непонятной причине это название не слишком нравится.',
  basePrice: {
    humans: 10000,
    metals: 250000,
    crystals: 45000,
    time: 5 * 24 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 22500, max: 27500 },
      signature: 40,
    },
    health: {
      armor: 200000,
      signature: 2000,
    },
  },
  targets: [
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 42],
      ['Building/Military/Barracks', 45],
      ['Research/Evolution/Ikea', 46],
    ];
  },
};
