export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy15',
  condition: [
    ['Research/Evolution/Alloy', 15],
  ],
  title: 'Исследовать Особые Сплавы 15-го уровня',
  text: '<p>Отдел Особых Сплавов готов к дальнейшим исследованиям, Командующий. Могу вас заверить, что это направление будет вам полезно, ведь благодаря ему мы можем ускорить строительство всех зданий в колонии.</p><p>Возьмём, к примеру, Космопорт – это огромное здание со сложной структурой. А если поднять уровень Особых Сплавов, то наши ученые смогут значительно снизить время монтажа за счёт облегчения веса несущих конструкций. Вам достаточно приказать, и мы с радостью возьмёмся за эту непростую задачу.</p>',
  options: {
    accept: {
      text: 'Космопорт, говоришь? А что, я как раз собирался там кое-что подновить.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1500,
    crystals: 1500,
  },
};
