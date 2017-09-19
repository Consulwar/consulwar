export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort40',
  condition: [
    ['Building/Residential/TradingPort', 40],
  ],
  title: 'Построить Торговый Порт 40-го уровня',
  text: '<p>Согласно отчёту, в Порт прилетели корабли торговцев-бентуси. Как обычно, разгрузкой и погрузкой товаров занимались роботы и служащие Торгового Порта — общеизвестно, что бентуси никогда не покидают мостик. Поговаривают, что они в каком-то смысле составляют одно целое со своим кораблём, но никто так и не смог убедиться в этом лично.</p><p>Что касается торговли, то нам придётся снова увеличить терминал — всё больше торговых гильдий прилетают для заключения сделок.</p>',
  options: {
    accept: {
      text: 'Когда начнут возить наложниц и игровые приставки, разбуди меня.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2700,
    crystals: 3300,
  },
};
