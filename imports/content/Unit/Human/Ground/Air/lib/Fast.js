export default {
  id: 'Unit/Human/Ground/Air/Fast',
  title: 'Скорострел',
  description: 'Быстрый, резкий, неумолимый воздушный убийца. Говорят, что инженер, создавший это чудо, ублажал себя всю ночь на схемы Скорострела, пока не умер от перенасыщения гормонами счастья. Дело в том, что Скорострел — действительно гениальное изобретение. Равных ему нет в воздухе. Даже Рептилоиды не добились таких успехов. Больше Скорострелов, Консул, и в небе мы будем короли!',
  basePrice: {
    humans: 25,
    metals: 6375,
    crystals: 4500,
    time: 41612,
  },
  queue: 'Ground/Air',
  characteristics: {
    weapon: {
      damage: { min: 1350, max: 1650 },
      signature: 20,
    },
    health: {
      armor: 7500,
      signature: 20,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Air/Amphisbaena',
    'Unit/Reptile/Ground/Air/Amphibian',
    'Unit/Reptile/Ground/Infantry/Striker',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 1],
    ];
  },
};
