export default {
  id: 'Unit/Ground/Enginery/Reptile/Chopping',
  title: 'Отбойный комплекс',
  description: 'Отбойный Комплекс — это огромное боевое здание, до упора напичканное турелями, системами ПВО и дальнобойными орудиями. Обычно такие комплексы Рептилии устанавливают в самых важных боевых точках и сражаться с их и без того сильной армией, да ещё при поддержке этих Комплексов становится буквально адской задачей.',
  basePrice: {
    humans: 10000,
    metals: 1500000,
    crystals: 540000,
    time: 3600,
  },
  characteristics: {
    damage: {
      min: 44000,
      max: 55000,
    },
    life: 150000,
  },
  targets: [
    'Unit/Ground/Enginery/Human/MotherTank',
    'Unit/Ground/Enginery/Human/Grandmother',
    'Unit/Ground/Enginery/Human/Hbhr',
  ],
};
