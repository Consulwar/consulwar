export default {
  id: 'Quest/Regular/Tamily/Metal/Metal55',
  condition: [
    ['Building/Residential/Metal', 55],
  ],
  title: 'Построить Шахту Металла 55-го уровня',
  text: '<p>Правитель, ваша Лаборатория снова удивляет: сегодня они прислали новые чертежи и формулы на ваше утверждение. Там говорится что-то про наноструктуры из Кристалла, которыми можно улучшить знаменитое Металлическое Плетение. Технология, кажется, не очень дорогая, к тому же они клянутся, что она даст хорошую прибавку к добыче в Шахте Металла. Если вы одобрите этот план, Инженеры сегодня же начнут экспериментировать с первыми образцами. Кстати, а вы случайно не знаете, что такое хиральность?</p>',
  options: {
    accept: {
      text: 'О, эта такая штука, Тамили! Тебе понравится.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 70,
    crystals: 13,
  },
};
