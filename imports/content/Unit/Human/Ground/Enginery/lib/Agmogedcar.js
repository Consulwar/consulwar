export default {
  id: 'Unit/Human/Ground/Enginery/Agmogedcar',
  title: 'Бгоневичок',
  description: 'Таки прототип Бгоневичка был изготовлен не в этой вселенной. Главнокомандующий ФШМ с Кибер-Пиратом и Товарищем Ульяновым изобрели эту крайне быструю и эффективную машинку для своих целей. После перемещения ФШМ во Вселенную 42 создание Бгоневичка стало одной из причин принятия его на высокие военные посты. Скорость и управляемость Бгоневичка позволяют ему быть настоящим «охотником» на воздушные войска и тяжёлую пехоту противника.',
  basePrice: {
    humans: 10,
    metals: 2450,
    crystals: 500,
    time: 16625 / 2,
  },
  queue: 'Ground/Enginery',
  characteristics: {
    weapon: {
      damage: { min: 350, max: 450 },
      signature: 18,
    },
    health: {
      armor: 900,
      signature: 15,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Air/Amphibian',
    'Unit/Reptile/Ground/Air/Amphisbaena',
    'Unit/Reptile/Ground/Enginery/Breaker',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 1],
    ];
  },
};
