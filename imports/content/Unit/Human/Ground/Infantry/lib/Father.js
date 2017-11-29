export default {
  id: 'Unit/Human/Ground/Infantry/Father',
  title: 'Папаня',
  description: 'Да-да, те самые Папки, что наводнили интернет. Те самые школьники, что просиживают всё своё свободное время в Дотке. Те самые, что близко знакомы со всеми мамками в мире. Те самые бесполезные куски мяса, что коптят эту планету. Именно им была предоставлена честь идти в первых рядах на войну против Рептилоидов. Ну и пусть от них никакого толку, зато мы совместили приятное с полезным.',
  basePrice: {
    humans: 1,
    metals: 95,
    time: 25 * 10,
  },
  characteristics: {
    weapon: {
      damage: { min: 2, max: 3 },
      signature: 5,
    },
    health: {
      armor: 25,
      signature: 5,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Infantry/Striker',
    'Unit/Reptile/Ground/Infantry/Ripper',
    'Unit/Reptile/Ground/Infantry/Horror',
  ],
  requirements() {
    return [
      ['Building/Military/Barracks', 1],
    ];
  },
};
