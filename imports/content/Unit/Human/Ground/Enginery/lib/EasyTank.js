export default {
  id: 'Unit/Human/Ground/Enginery/EasyTank',
  title: 'Танк Изи',
  description: 'Танк Изи — это лёгкое манёвренное средство для уничтожения наземной техники Рептилоидов. Изобретённый ещё 20 лет назад, как платформа для исследования далёких колоний, Изи был улучшен и переоборудован для ведения боевых действий. Стабилизаторы и башня превратили Изи в настоящую проблему для Рептилий и их техники. Шустрый и опасный — чего ещё можно желать, Консул?',
  basePrice: {
    humans: 50,
    metals: 16000,
    crystals: 1250,
    time: 4500 * 5,
  },
  characteristics: {
    weapon: {
      damage: { min: 1125, max: 1375 },
      signature: 16,
    },
    health: {
      armor: 8750,
      signature: 24,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Slider',
    'Unit/Reptile/Ground/Enginery/Breaker',
    'Unit/Reptile/Ground/Infantry/Striker',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 40],
      ['Research/Evolution/Energy', 40],
    ];
  },
};
