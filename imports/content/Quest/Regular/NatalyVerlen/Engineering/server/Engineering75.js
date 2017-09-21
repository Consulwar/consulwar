export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering75',
  condition: [
    ['Research/Evolution/Engineering', 75],
  ],
  title: 'Исследовать Оборонную Инженерию 75-го уровня',
  text: '<p>Можно сказать, что внедрение нового материала брони прошло с переменным успехом, Командующий. С одной стороны, материал, который мы получили в Лаборатории, на испытаниях показал характеристики, вдвое превышающие исходные.</p><p>С другой стороны, среди этих характеристик внезапно затесалась упругость, поэтому во время тестового обстрела снаряды отрикошетили и взорвались на вдвое большей площади, чем тренировочный полигон. В общем, мы проводим дополнительный набор специалистов для работы в поле.</p>',
  options: {
    accept: {
      text: 'Ну да, а желающие прямо ломятся к вам толпами.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 180,
    crystals: 180,
  },
};
