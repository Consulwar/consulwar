export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering65',
  condition: [
    ['Research/Evolution/Engineering', 65],
  ],
  title: 'Исследовать Оборонную Инженерию 65-го уровня',
  text: '<p>Несмотря на частично сгоревший полигон Лаборатории, опыты с магнитными ловушками для плазменных зарядов продолжаются. Разумеется, мы принимаем все необходимые меры предосторожности, Командующий, так что вам совершенно не о чем беспокоиться.</p><p>Относительно брони тоже поступили хорошие новости: Совет может продать нам немного материала, который чрезвычайно устойчив к нагреванию до экстремальных температур. Броня, конечно, будет недешёвая, но зато надёжная.</p>',
  options: {
    accept: {
      text: 'Вот когда ты сказала, чтобы я не беспокоился…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 2000,
  },
};
