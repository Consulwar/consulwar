export default {
  id: 'Unit/Human/Ground/Enginery/Agmogedcar',
  title: 'Бгоневичок',
  description: 'Таки прототип Бгоневичка был изготовлен не в этой вселенной. Главнокомандующий ФШМ с Кибер-Пиратом и Товарищем Ульяновым изобрели эту крайне быструю и эффективную машинку для своих целей. После перемещения ФШМ во Вселенную 42 создание Бгоневичка стало одной из причин принятия его на высокие военные посты. Скорость и управляемость Бгоневичка позволяют ему быть настоящим «охотником» на воздушные войска и тяжёлую пехоту противника.',
  basePrice: {
    humans: 10,
    metals: 150,
    crystals: 35,
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
    'Unit/Reptile/Ground/Infantry/Ripper',
    'Unit/Reptile/Ground/Air/Amfizben',
    'Unit/Reptile/Ground/Air/Amphibian',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 1],
    ];
  },
};
