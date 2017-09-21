export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science60',
  condition: [
    ['Research/Evolution/Science', 60],
  ],
  title: 'Исследовать Научный Отдел 60-го уровня',
  text: '<p>Генетические эксперименты с растениями – занятие небыстрое, Консул. Нужно разобрать образец на отдельные клетки и попытаться встроить в них нужную ДНК.  Поэтому наши инженеры изобрели так называемую «генную пушку».</p><p>Это действительно что-то вроде ружья, стреляющего микрочастичками золота, на которые нанесена нужная ДНК. Как ни странно, но такая примитивная технология работает гораздо лучше, чем возня с отдельными клетками под микроскопом. Хотя, конечно, эту пушку нужно ещё доработать.</p>',
  options: {
    accept: {
      text: 'Золото я конфискую для отделки флагмана, а так – дорабатывайте.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 70,
    crystals: 70,
  },
};
