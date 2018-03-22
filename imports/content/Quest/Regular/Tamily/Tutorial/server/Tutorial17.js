export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial17',
  condition: [
    ['Building/Military/Laboratory', 15],
    ['Research/Evolution/Science', 15],
  ],
  slides: 2,
  title: 'Построить Лабораторию 15-го уровня, исследовать Научный Отдел 15-го уровня',
  text: '<p>Важно следить за требованиями зданий и исследований, они меняются с уровнем. Например, вам нужна Лаборатория 15-го уровня, чтобы исследовать Научный отдел, а Научный отдел нужен будет для Лаборатории в будущем. Давайте улучшим Лабораторию до 15-го уровня, а затем и Научный отдел в исследованиях до 15-го уровня.</p>',
  options: {
    accept: {
      text: 'Важно смотреть на необходимые технологии, понял.',
      mood: 'positive',
    },
  },
  reward: {
    credits: 100,
  },
};
