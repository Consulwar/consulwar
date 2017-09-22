export default {
  id: 'Unit/Space/Human/Carrier',
  title: 'Авианосец',
  description: 'Авианосец, или, как его ещё называют, Улей – это огромный боевой корабль-завод. Он способен производить и ремонтировать Гаммадронов прямо во время боя. Авианосец имеет серьёзное вооружение, однако же основной урон он наносит благодаря рою дронов, который всегда его сопровождает. Именно поэтому его и прозвали Ульем, хотя руководству по непонятной причине это название не слишком нравится.',
  basePrice: {
    humans: 17000,
    metals: 820,
    crystals: 250,
    time: 30 * 60,
  },
  characteristics: {
    damage: {
      min: 7200,
      max: 9000,
    },
    life: 20000,
  },
  targets: [
    'Unit/Space/Reptile/Hydra',
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Blade',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 50],
      ['Building/Military/Shipyard', 45],
      ['Research/Evolution/Alloy', 45],
      ['Research/Evolution/Hyperdrive', 30],
    ];
  },
};
