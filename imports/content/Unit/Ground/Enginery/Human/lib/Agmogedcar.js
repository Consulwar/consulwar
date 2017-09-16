export default {
  id: 'Unit/Ground/Enginery/Human/Agmogedcar',
  title: 'Бгоневичок',
  description: 'Таки прототип Бгоневичка был изготовлен не в этой вселенной. Главнокомандующий ФШМ с Кибер-Пиратом и Товарищем Ульяновым изобрели эту крайне быструю и эффективную машинку для своих целей. После перемещения ФШМ во Вселенную 42 создание Бгоневичка стало одной из причин принятия его на высокие военные посты. Скорость и управляемость Бгоневичка позволяют ему быть настоящим «охотником» на воздушные войска и тяжёлую пехоту противника.',
  basePrice: {
    humans: 10,
    metals: 15000,
    crystals: 3500,
    time: 20,
  },
  characteristics: {
    damage: {
      min: 100,
      max: 126,
    },
    life: 330,
  },
  targets: [
    'Unit/Ground/Infantry/Reptile/Ripper',
    'Unit/Ground/Air/Reptile/Amfizben',
    'Unit/Ground/Air/Reptile/Amphibian',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 1],
    ];
  },
};
