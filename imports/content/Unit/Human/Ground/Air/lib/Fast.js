export default {
  id: 'Unit/Reptile/Ground/Air/Fast',
  title: 'Скорострел',
  description: 'Быстрый, резкий, неумолимый воздушный убийца. Говорят, что инженер, создавший это чудо, ублажал себя всю ночь на схемы Скорострела, пока не умер от перенасыщения гормонами счастья. Дело в том, что Скорострел — действительно гениальное изобретение. Равных ему нет в воздухе. Даже Рептилоиды не добились таких успехов. Больше Скорострелов, Консул, и в небе мы будем короли!',
  basePrice: {
    humans: 5,
    metals: 100,
    crystals: 45,
    time: 30,
  },
  characteristics: {
    damage: {
      min: 172,
      max: 216,
    },
    life: 300,
  },
  targets: [
    'Unit/Reptile/Ground/Air/Amphibian',
    'Unit/Reptile/Ground/Air/Amfizben',
    'Unit/Reptile/Ground/Infantry/Striker',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 1],
    ];
  },
};
