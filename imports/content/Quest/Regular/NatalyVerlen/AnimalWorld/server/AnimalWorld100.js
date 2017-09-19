export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld100',
  condition: [
    ['Research/Evolution/AnimalWorld', 100],
  ],
  title: 'Исследовать В Мире Животных 100-го уровня',
  text: '<p>Ну и, наконец, самое интересное предложение из Политического Центра. Серые пиджаки рекомендуют существенно увеличить количество материалов для постройки зданий, подготовки армии и запуска космических кораблей.</p><p>Это, по их мнению, должно заставить нашу планету оценить те блага, которые она имеет благодаря справедливому и разумному управлению серых пиджаков. И на этой восхитительно безумной ноте я, пожалуй, отправлю их всех в самую гущу войны. Больше они нам не понадобятся.</p>',
  options: {
    accept: {
      text: 'Но не забывай, Натали, что я вам всё ещё нужен! Без меня никак!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 14000,
    crystals: 14000,
  },
};
