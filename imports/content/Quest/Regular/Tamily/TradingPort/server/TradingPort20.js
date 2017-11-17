export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort20',
  condition: [
    ['Building/Residential/TradingPort', 20],
  ],
  title: 'Построить Торговый Порт 20-го уровня',
  text: '<p>На планету прибыли торговые агенты Горацио, как они сами себя называют. А ещё они так называют всех представителей своей расы, потому что фактически являются клоном одного и того же человека.</p><p>Кажется, это известный мультимиллионер, пожелавший населить целую планету самыми прекрасными существами во вселенной. Никого прекраснее самого Горацио, понятное дело, не нашлось. Но зато в каждом клоне есть ещё и коммерческая жилка.</p>',
  options: {
    accept: {
      text: 'Отличная идея, кстати, как я сам раньше не додумался?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 8,
    crystals: 12,
  },
};