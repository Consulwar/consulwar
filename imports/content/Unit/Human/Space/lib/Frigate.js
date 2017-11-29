export default {
  id: 'Unit/Human/Space/Frigate',
  title: 'Фрегат',
  description: 'Фрегаты – это корабли лёгкого класса. Достаточно небольшой сам по себе, Фрегат, однако же, обладает неплохим вооружением и бронёй, а также высокой скоростью стрельбы; способен уничтожать небольшие корабли противника. Фрегаты часто используются в качестве небольших мобильных оборонных кораблей. Идти в авангарде флота Фрегат не сможет, зато он вполне способен прикрывать крупные союзные корабли от истребителей Рептилоидов, и он отлично справляется с этой задачей.',
  basePrice: {
    humans: 100,
    metals: 3500,
    crystals: 1000,
    time: 5 * 60 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 400, max: 600 },
      signature: 40,
    },
    health: {
      armor: 2200,
      signature: 125,
    },
  },
  targets: [
    'Unit/Reptile/Space/Blade',
    'Unit/Reptile/Space/Sphero',
    'Unit/Reptile/Space/Armadillo',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 1],
    ];
  },
};
