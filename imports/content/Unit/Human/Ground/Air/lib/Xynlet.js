export default {
  id: 'Unit/Human/Ground/Air/Xynlet',
  title: 'XYNлёт',
  description: 'Ксинолёт был изобретён специально для уничтожения самых опасных наземных единиц рептилий. После многочисленных поражений в боях против опасных КЕР наш инженерный отдел занялся разработкой техники для поиска и ликвидации Самого Злоебучего Врага. Именно такой техникой и является Ксинолёт – он быстрый, юркий, мощный, бесшумный. Возникает из ниоткуда, уничтожает противника и снова пропадает с радаров… Ах… Сказка.',
  basePrice: {
    humans: 50,
    metals: 27250,
    crystals: 17500,
    time: 166562,
  },
  queue: 'Ground/Air',
  characteristics: {
    weapon: {
      damage: { min: 3200, max: 3600 },
      signature: 3,
    },
    health: {
      armor: 26000,
      signature: 20,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Infantry/TooFucking',
    'Unit/Reptile/Ground/Infantry/Horror',
    'Unit/Reptile/Ground/Infantry/Ripper',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 60],
      ['Research/Evolution/Crystallization', 50],
      ['Research/Evolution/Nanotechnology', 50],
    ];
  },
};
