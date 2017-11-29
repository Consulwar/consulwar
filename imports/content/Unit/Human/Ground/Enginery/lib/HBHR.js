export default {
  id: 'Unit/Human/Ground/Enginery/HBHR',
  title: 'ОБЧР',
  description: 'ОБЧР, или Огромный Боевой Человекоподобный Робот, появился на вооружении армии людей не так давно. Сама идея создания подобной боевой машины поступила от Консулов при первом пробном подключении канала связи. Лучшие умы параллельной вселенной работали над созданием этого нового и крайне мощного вооружения и, надо признать, у них получилось. ОБЧР очень дорогой в эксплуатации и требует серьёзных затрат в подготовке к строительству, однако присутствие этой устрашающей боевой машины на поле боя может повернуть исход сражения в совсем иную сторону.',
  basePrice: {
    humans: 6000,
    metals: 218000,
    crystals: 84000,
    time: 100000 * 5,
  },
  characteristics: {
    weapon: {
      damage: { min: 40000, max: 60000 },
      signature: 40,
    },
    health: {
      armor: 390000,
      signature: 500,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Breaker',
    'Unit/Reptile/Ground/Infantry/Horror',
    'Unit/Reptile/Ground/Infantry/TooFucking',
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
