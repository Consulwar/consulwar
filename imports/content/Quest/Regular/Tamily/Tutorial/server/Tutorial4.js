export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial4',
  condition: [
    ['Building/Military/Laboratory', 10],
  ],
  slides: 3,
  title: 'Построить Лабораторию 10-го уровня',
  text: '<p>Теперь у вас есть Электростанция и можно переходить к Лаборатории, она нужна для различных важных исследований, о которых я расскажу вам позже. Давайте не мелочиться – постройте Лабораторию сразу 10 уровня. Чтобы не ждать, вы можете бесплатно (до 20 уровня) ускорять строительство любого здания. Для этого достаточно нажать кнопку «Ускорить».</p>',
  options: {
    accept: {
      text: 'Ускорять строительство, после того, как его начал. Запомню.',
      mood: 'positive',
    },
  },
  reward: {
    crystals: 1000,
  },
};
