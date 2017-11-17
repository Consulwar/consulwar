export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization75',
  condition: [
    ['Research/Evolution/Crystallization', 75],
  ],
  title: 'Исследовать Кристаллизацию 75-го уровня',
  text: '<p>Одному из наших лаборантов пришла в голову слегка безумная идея, Консул. Он хочет сильно растянуть высокопрочную полимерную плёнку, но не на воздухе, а в специальном растворе. Теоретические выкладки позволяют предположить, что в результате в плёнке образуются поры нанометрового размера.</p><p>Если опыты подтвердят эту сумасшедшую теорию, то мы получим очень дешёвый и быстрый способ производства разделительных мембран для очистки жидкостей и газов. Первое, что приходит на ум – опреснение морской воды.</p>',
  options: {
    accept: {
      text: 'Очистка жидкостей? Пришлите-ка мне парочку!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 105,
    crystals: 105,
  },
};