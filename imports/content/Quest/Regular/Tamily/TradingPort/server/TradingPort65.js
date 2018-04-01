export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort65',
  condition: [
    ['Building/Residential/TradingPort', 65],
  ],
  title: 'Построить Торговый Порт 65-го уровня',
  text: '<p>О, прибыл торговый флот малоков, правитель. Обожаю, когда они прилетают: эти огромные дядьки настолько суровы, что продают за бесценок отбитые в бою предметы роскоши — видимо, считают их угрозой для своего спартанского существования.</p><p>Так что для всей колонии начинается бесплатный праздник, как только на горизонте замаячат грозные малокские корабли. Вы ведь отпустите меня в Торговый Порт на полчасика?</p>',
  options: {
    accept: {
      text: 'Только если ты купишь мне шкуру хаббата.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 2000,
  },
};
