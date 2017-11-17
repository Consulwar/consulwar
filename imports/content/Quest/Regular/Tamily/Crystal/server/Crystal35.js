export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal35',
  condition: [
    ['Building/Residential/Crystal', 35],
  ],
  title: 'Построить Шахту Кристалла 35-го уровня',
  text: '<p>На шахте всё спокойно, правитель, однако осталась пара нерешённых проблем. Одна из них — охлаждение Кристалла по дороге из самой шахты в специальную К-лабораторию, где изготовляют растворы, называемые Жидким Кристаллом.</p><p>Чтобы уменьшить простои, инженеры предложили проложить туда охлаждающий конвейер. Таким образом, мы ожидаем увеличения выхода готовой продукции, как только вы согласитесь внедрить это нововведение.</p>',
  options: {
    accept: {
      text: 'Я согласен внедрить всё, что угодно, лишь бы Кристаллов было побольше.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7,
    crystals: 9,
  },
};