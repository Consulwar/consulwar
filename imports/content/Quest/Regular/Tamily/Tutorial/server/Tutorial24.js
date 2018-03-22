export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial24',
  condition: [
    ['Statistic/containers.open', 1],
  ],
  slides: 6,
  title: 'Купить белый контейнер и открыть его',
  text: '<p>Мне сообщили, что вам доступны специальные контейнеры. Они находятся в здании Космопорта. Специальная синяя кнопка откроет вам доступ к меню покупки контейнеров. Купите один белый контейнер и откройте его. Контейнеры привозят контрабандисты, иногда в этих контейнерах может быть что-то ооочень полезное. А иногда нет. Как повезет.</p>',
  options: {
    accept: {
      text: 'Контейнеры? Кажется, я знаю название вашего издателя…',
      mood: 'positive',
    },
  },
  reward: {
    honor: 500,
    humans: 2000,
    metals: 2500,
    crystals: 1500,
  },
};
