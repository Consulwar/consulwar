export default {
  id: 'Unit/Ground/Enginery/Human/HBHR',
  title: 'ОБЧР',
  description: 'ОБЧР, или Огромный Боевой Человекоподобный Робот, появился на вооружении армии людей не так давно. Сама идея создания подобной боевой машины поступила от Консулов при первом пробном подключении канала связи. Лучшие умы параллельной вселенной работали над созданием этого нового и крайне мощного вооружения и, надо признать, у них получилось. ОБЧР очень дорогой в эксплуатации и требует серьёзных затрат в подготовке к строительству, однако присутствие этой устрашающей боевой машины на поле боя может повернуть исход сражения в совсем иную сторону.',
  basePrice: {
    metals: 800000,
    crystals: 320000,
    humans: 4000,
    time: 7200,
  },
  characteristics: {
    damage: {
      min: 20480,
      max: 25600,
    },
    life: 48000,
  },
  targets: [
    'Unit/Ground/Enginery/Reptile/Patron',
    'Unit/Ground/Infrantry/Reptile/TooFucking',
    'Unit/Ground/Enginery/Reptile/Slider',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 100],
      ['Research/Evolution/Energy', 100],
      ['Building/Military/Complex', 80],
      ['Building/Residential/BlackMarket', 80],
    ];
  },
};
