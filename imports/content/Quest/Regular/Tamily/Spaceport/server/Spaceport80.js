export default {
  id: 'Quest/Regular/Tamily/Spaceport/Spaceport80',
  condition: [
    ['Building/Residential/Spaceport', 80],
  ],
  title: 'Построить Космопорт 80-го уровня',
  text: '<p>И снова интересные новости с орбиты, правитель, — к нам занесло командный модуль по имени Уитли. Мы знаем его имя, потому что этого робота совершенно невозможно заткнуть, он болтает без остановки.</p><p>Никто так и не понял, как ему это удаётся в безвоздушном пространстве, но он уже довёл до истерики весь персонал наземных служб Космопорта. Инженеры умоляют выбросить его в открытый космос, Консул.</p>',
  options: {
    accept: {
      text: 'Выбрасывайте — космос такой большой, надо всё посмотреть!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 158,
    crystals: 216,
  },
};
