export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher45',
  condition: [
    ['Building/Residential/PulseCatcher', 45],
  ],
  title: 'Построить Импульсный Уловитель 45-го уровня',
  text: '<p>В центре нашей галактики происходит уникальное событие, правитель! Прямо сейчас мы можем наблюдать, как черная дыра поглощает нейтронную звезду.</p><p>Ну, то есть увидеть в реальном времени, как горячий газ падает за горизонт событий, смогут только те счастливчики, которым выпало дежурить у новенького рентгеновского телескопа, который только что поставили на Импульсный Уловитель. Остальным придётся удовлетвориться трансляцией, которая идёт в реальном времени на все инфопанели планеты.</p>',
  options: {
    accept: {
      text: 'Хочешь сказать, у вас это как футбол? Ужас какой.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
