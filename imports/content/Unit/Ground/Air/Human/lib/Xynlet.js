export default {
  id: 'Unit/Ground/Air/Reptile/Xynlet',
  title: 'XYNлёт',
  description: 'Ксинолёт был изобретён специально для уничтожения самых опасных наземных единиц рептилий. После многочисленных поражений в боях против опасных КЕР наш инженерный отдел занялся разработкой техники для поиска и ликвидации Самого Злоебучего Врага. Именно такой техникой и является Ксинолёт – он быстрый, юркий, мощный, бесшумный. Возникает из ниоткуда, уничтожает противника и снова пропадает с радаров… Ах… Сказка.',
  basePrice: {
    humans: 20,
    metals: 150000,
    crystals: 100000,
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
    'Unit/Ground/Infantry/Reptile/TooFucking',
    'Unit/Ground/Infantry/Reptile/Ripper',
    'Unit/Ground/Infantry/Reptile/Horror',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 80],
      ['Research/Evolution/Energy', 80],
      ['Building/Military/Complex', 60],
    ];
  },
};