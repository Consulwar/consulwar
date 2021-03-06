export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal55',
  condition: [
    ['Building/Residential/Crystal', 55],
  ],
  title: 'Построить Шахту Кристалла 55-го уровня',
  text: '<p>А вы слышали, правитель, что в К-лаборатории придумали новую технологию для нанесения очень тонкого слоя жидкого кристалла на листы брони? Они закрепляют такой лист на обычной центрифуге, наносят раствор, а потом раскручивают. Основная часть раствора разбрызгивается, и на броне остаётся очень тонкий слой кристалла.</p><p>Так вот, для Мамок нужны очень большие листы, правитель. И очень большие центрифуги. Но зато самого кристалла для таких работ будет идти гораздо меньше, и общая производительность шахты вырастет. Если вы, конечно, одобрите этот план.</p>',
  options: {
    accept: {
      text: 'Звучит очень интересно, и хотя я ни хера не понял, план одобряю.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 800,
    crystals: 800,
  },
};
