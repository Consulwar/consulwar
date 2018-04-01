export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort45',
  condition: [
    ['Building/Residential/TradingPort', 45],
  ],
  title: 'Построить Торговый Порт 45-го уровня',
  text: '<p>Сегодня в Порт прибыл корабль «Бумеранг». Пилот прямо-таки выбежал из корабля и принялся обнимать персонал на поле с радостными воплями: «Люди! Настоящие, живые люди!».</p><p>Медперсонал уже вколол ему лёгкое успокоительное, и пока пилот отдыхает, сделка проходит в автоматическом режиме. Таможенники подумывают распространить этот радушный приём на все прилетающие суда.</p>',
  options: {
    accept: {
      text: 'Радушный приём по выгодному курсу, ага.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
