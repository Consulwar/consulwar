export default {
  id: 'Unit/Reptile/Ground/Air/Xynlet',
  title: 'XYNлёт',
  description: 'Ксинолёт был изобретён специально для уничтожения самых опасных наземных единиц рептилий. После многочисленных поражений в боях против опасных КЕР наш инженерный отдел занялся разработкой техники для поиска и ликвидации Самого Злоебучего Врага. Именно такой техникой и является Ксинолёт – он быстрый, юркий, мощный, бесшумный. Возникает из ниоткуда, уничтожает противника и снова пропадает с радаров… Ах… Сказка.',
  basePrice: {
    humans: 20,
    metals: 1500,
    crystals: 1000,
    time: 480,
  },
  characteristics: {
    damage: {
      min: 6400,
      max: 8000,
    },
    life: 1500,
  },
  targets: [
    'Unit/Reptile/Ground/Infantry/TooFucking',
    'Unit/Reptile/Ground/Infantry/Ripper',
    'Unit/Reptile/Ground/Infantry/Horror',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 80],
      ['Research/Evolution/Energy', 80],
      ['Building/Military/Complex', 60],
    ];
  },
};
