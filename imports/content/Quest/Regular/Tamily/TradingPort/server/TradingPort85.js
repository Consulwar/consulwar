export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort85',
  condition: [
    ['Building/Residential/TradingPort', 85],
  ],
  title: 'Построить Торговый Порт 85-го уровня',
  text: '<p>В Торговом Порту приземлился маленький корабль «Пустельга». Как только его посадочный модуль коснулся бетона, с трапа посыпался почти весь экипаж, разбегаясь с нецензурными криками об ужасных качествах своего капитана.</p><p>Теперь незадачливому командиру предстоит не только закупить новое оборудование и детали, но и набрать на нашей колонии новый экипаж. И сделать это быстро — судя по всему, у него какая-то срочная миссия на другом конце галактики.</p>',
  options: {
    accept: {
      text: 'Баллоны с воздухом ему туда ещё погрузите — так, на всякий случай.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 6000,
    crystals: 6000,
  },
};
