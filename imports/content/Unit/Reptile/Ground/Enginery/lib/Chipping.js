export default {
  id: 'Unit/Reptile/Ground/Enginery/Chipping',
  title: 'Отбойный комплекс',
  description: 'Отбойный Комплекс — это огромное боевое здание, до упора напичканное турелями, системами ПВО и дальнобойными орудиями. Обычно такие комплексы Рептилии устанавливают в самых важных боевых точках и сражаться с их и без того сильной армией, да ещё при поддержке этих Комплексов становится буквально адской задачей.',
  basePrice: {
    unires: 3000000,
  },
  characteristics: {
    weapon: {
      damage: { min: 250000, max: 250000 },
      signature: 100,
    },
    health: {
      armor: 5000000,
      signature: 4000,
    },
  },
  targets: [
    'Unit/Human/Ground/Enginery/MotherTank',
    'Unit/Human/Ground/Enginery/Grandmother',
    'Unit/Human/Ground/Enginery/HBHR',
  ],
};
