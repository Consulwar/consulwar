export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology5',
  condition: [
    ['Research/Evolution/Nanotechnology', 5],
  ],
  title: 'Исследовать Нанотехнологии 5-го уровня',
  text: '<p>Добро пожаловать в наш новый отдел нанотехнологий, Консул! А точнее, в отдел атомно-фотонных микросхем. Эти штуки вскоре будут использоваться везде – от линкора до тостера, и всё благодаря магнитным ловушкам, позволяющим манипулировать отдельными атомами.</p><p>Чип, представляющий собой цепочку таких ловушек, будет очень быстрым и очень маленьким. И всё это для того, чтобы пушка какого-нибудь Папани стреляла быстрее, чем он успевает подумать об этом.</p>',
  options: {
    accept: {
      text: 'Мне кажется, что и пендель бы сработал, и стоит он значительно дешевле.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 150,
    crystals: 150,
  },
};
