export default {
  id: 'Quest/Regular/Tamily/SpacePort/SpacePort45',
  condition: [
    ['Building/Residential/SpacePort', 45],
  ],
  title: 'Построить Космопорт 45-го уровня',
  text: '<p>Правитель, сегодня в Космопорт прибыла труппа странствующих артистов, которые во что бы то ни стало хотели выступить с концертом в Центре Развлечений. При рутинном сканировании у одного из них в крови был обнаружен редкий яд, который гарантированно убьет бедолагу через пару дней. Однако от лечения в нашем лазарете артист отказался.</p><p>Очень странная история, Консул, мы отправили всю труппу на орбиту, а биологический отдел просит у вас дополнительные средства на исследования яда.</p>',
  options: {
    accept: {
      text: 'Хм… Я чую крысу. На всякий случай припрячьте артефакты.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
