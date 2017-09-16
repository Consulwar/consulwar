export default {
  id: 'Unit/Space/Human/Frigate',
  title: 'Фрегат',
  description: 'Фрегаты – это корабли лёгкого класса. Достаточно небольшой сам по себе, Фрегат, однако же, обладает неплохим вооружением и бронёй, а также высокой скоростью стрельбы; способен уничтожать небольшие корабли противника. Фрегаты часто используются в качестве небольших мобильных оборонных кораблей. Идти в авангарде флота Фрегат не сможет, зато он вполне способен прикрывать крупные союзные корабли от истребителей Рептилоидов, и он отлично справляется с этой задачей.',
  basePrice: {
    humans: 100,
    metals: 13500,
    crystals: 4500,
    time: 500,
  },
  characteristics: {
    damage: {
      min: 1200,
      max: 1500,
    },
    life: 4000,
  },
  targets: [
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 25],
      ['Building/Military/Shipyard', 20],
    ];
  },
};
