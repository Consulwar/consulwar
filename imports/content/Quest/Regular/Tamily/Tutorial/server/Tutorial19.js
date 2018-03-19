export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial19',
  condition: [
    ['Unit/Human/Defense/Turret', 25],
  ],
  title: 'Построить 25 оборонных орудий «Турель»',
  text: '<p>Вы, наверное, уже обратили внимание, что помимо космических и наземных юнитов есть ещё планетарная оборона. Это мощные турели и мины, которые помогут вам обороняться от тех отрядов, что летят прямо на вашу планету. Да, будут и такие. Сейчас вам доступны только Турели, и я думаю, что стоит построить хотя бы 25 штук.</p>',
  options: {
    accept: {
      text: '25 штук турелей. Как-то маловато, но ладно…',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Mirage': 10,
    metals: 3500,
    crystals: 1000,
  },
};