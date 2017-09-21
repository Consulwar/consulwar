export default {
  id: 'Unit/Ground/Infantry/Human/Father',
  title: 'Папаня',
  description: 'Да-да, те самые Папки, что наводнили интернет. Те самые школьники, что просиживают всё своё свободное время в Дотке. Те самые, что близко знакомы со всеми мамками в мире. Те самые бесполезные куски мяса, что коптят эту планету. Именно им была предоставлена честь идти в первых рядах на войну против Рептилоидов. Ну и пусть от них никакого толку, зато мы совместили приятное с полезным.',
  basePrice: {
    metals: 17.5,
    humans: 1,
    time: 2,
  },
  characteristics: {
    damage: {
      min: 8,
      max: 10,
    },
    life: 24,
  },
  targets: [
    'Unit/Ground/Infantry/Reptile/Striker',
    'Unit/Ground/Infantry/Reptile/Ripper',
    'Unit/Ground/Infantry/Reptile/Horror',
  ],
  requirements() {
    return [
      ['Building/Military/Barracks', 1],
    ];
  },
};
