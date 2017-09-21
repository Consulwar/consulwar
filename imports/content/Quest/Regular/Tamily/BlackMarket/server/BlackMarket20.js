export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket20',
  condition: [
    ['Building/Residential/BlackMarket', 20],
  ],
  title: 'Построить Черный Рынок 20-го уровня',
  text: '<p>Представляете, правитель, кто-то анонимно выставил на Чёрном Рынке неизвестный науке артефакт — деревянную шкатулку-головоломку. В прилагаемой инструкции написано, что тот, кто соберёт её части в правильном порядке, откроет портал в рай чувственных удовольствий.</p><p>Ерунда, конечно, но идея создать межпланетный аукцион на Рынке кажется мне перспективной.</p>',
  options: {
    accept: {
      text: 'В топку эту шкатулку! И если кожаную книгу привезут, её тоже в топку.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9,
    crystals: 10,
  },
};
