export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial8',
  condition: [
    ['Building/Residential/SpacePort', 10],
  ],
  title: 'Построить Космопорт 10-го уровня',
  text: '<p>Ваш флот полетел в атаку, но вам нужно больше кораблей для защиты и нападения. Нам… Вам, Правитель. Вам нужен Космопорт. Постройте космопорт 10-го уровня.</p>',
  options: {
    accept: {
      text: 'Наконец-то мы пришли к чему-то интересному.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
    humans: 500,
  },
};
