export default {
  id: 'Unit/Ground/Enginery/Human/EasyTank',
  title: 'Танк Изи',
  description: 'Танк Изи — это лёгкое манёвренное средство для уничтожения наземной техники Рептилоидов. Изобретённый ещё 20 лет назад, как платформа для исследования далёких колоний, Изи был улучшен и переоборудован для ведения боевых действий. Стабилизаторы и башня превратили Изи в настоящую проблему для Рептилий и их техники. Шустрый и опасный — чего ещё можно желать, Консул?',
  basePrice: {
    humans: 15,
    metals: 39000,
    crystals: 3000,
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
    'Unit/Ground/Enginery/Reptile/Slider',
    'Unit/Ground/Enginery/Reptile/Breaker',
    'Unit/Ground/Enginery/Reptile/Crusher',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 40],
      ['Research/Evolution/Energy', 40],
    ];
  },
};
