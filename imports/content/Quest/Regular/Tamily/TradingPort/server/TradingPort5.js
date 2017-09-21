export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort5',
  condition: [
    ['Building/Residential/TradingPort', 5],
  ],
  title: 'Построить Торговый Порт 5-го уровня',
  text: '<p>Ваш порт готов принимать первые грузы, правитель. Кстати, с вами давно хотела поторговать какая-то Космическая гильдия. Странные товарищи: всё время ширяются спайсом, и глаза у них…</p><p>Впрочем, это не должно препятствовать хорошим деловым отношениям. Прикажите улучшить порт, и мы сможем принимать ещё больше грузов и делегаций с других планет.</p>',
  options: {
    accept: {
      text: 'А, этих я знаю, нормальные ребята. Привет Муад`Дибу от Консула.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 150,
    crystals: 3,
  },
};
