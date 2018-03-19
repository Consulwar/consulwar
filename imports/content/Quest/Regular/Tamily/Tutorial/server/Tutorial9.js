export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial9',
  condition: [
    ['Statistic/units.build.Unit/Human/Space/Wasp', 2],
  ],
  title: 'Построить 2 космических корабля «Оса»',
  text: '<p>Прекрасно, прекрасно! Теперь вы можете строить Ос – это боевой космический юнит. Они находятся во вкладке «Войска». Предлагаю построить сразу 2 штуки, жаль только, ускорить в этот раз не получится. Так что не стройте сразу больше 2, чтобы долго не ждать.</p>',
  options: {
    accept: {
      text: 'Все начинают с малого.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Defense/Mine': 100,
  },
};
