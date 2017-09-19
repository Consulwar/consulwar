export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology70',
  condition: [
    ['Research/Evolution/Nanotechnology', 70],
  ],
  title: 'Исследовать Нанотехнологии 70-го уровня',
  text: '<p>Мы долго думали, куда бы ещё приложить созданные нами технологии быстрых вычислений на основе атомных микросхем, и таки придумали: будет весьма интересно нашпиговать нашими чипами производственных роботов.</p><p>У них, в силу специфики работы, крайне узкий спектр задач, а наша технология поможет его расширить. Более того – обученные роботы вполне способны заменить собой операторов и учётчиков, а также дорогостоящих испытателей прототипов на военных заводах.</p>',
  options: {
    accept: {
      text: 'Точно, а людишек я отправлю дредноуты строить!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 290000,
    crystals: 123000,
  },
};
