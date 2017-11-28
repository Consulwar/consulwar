export default {
  id: 'Unit/Human/Ground/Enginery/EasyTank',
  title: 'Танк Изи',
  description: 'Танк Изи — это лёгкое манёвренное средство для уничтожения наземной техники Рептилоидов. Изобретённый ещё 20 лет назад, как платформа для исследования далёких колоний, Изи был улучшен и переоборудован для ведения боевых действий. Стабилизаторы и башня превратили Изи в настоящую проблему для Рептилий и их техники. Шустрый и опасный — чего ещё можно желать, Консул?',
  basePrice: {
    humans: 15,
    metals: 390,
    crystals: 30,
    time: 30,
  },
  characteristics: {
    damage: {
      min: 211,
      max: 264,
    },
    life: 780,
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Slider',
    'Unit/Reptile/Ground/Enginery/Breaker',
    'Unit/Reptile/Ground/Enginery/Crusher',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 40],
      ['Research/Evolution/Energy', 40],
    ];
  },
};
