export default {
  id: 'Unit/Ground/Air/Reptile/Fast',
  title: 'Скорострел',
  description: 'Быстрый, резкий, неумолимый воздушный убийца. Говорят, что инженер, создавший это чудо, ублажал себя всю ночь на схемы Скорострела, пока не умер от перенасыщения гормонами счастья. Дело в том, что Скорострел — действительно гениальное изобретение. Равных ему нет в воздухе. Даже Рептилоиды не добились таких успехов. Больше Скорострелов, Консул, и в небе мы будем короли!',
  basePrice: {
    humans: 5,
    metals: 10000,
    crystals: 4500,
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
    'Unit/Ground/Air/Reptile/Amphibian',
    'Unit/Ground/Air/Reptile/Amfizben',
    'Unit/Ground/Infantry/Reptile/Striker',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 1],
    ];
  },
};
