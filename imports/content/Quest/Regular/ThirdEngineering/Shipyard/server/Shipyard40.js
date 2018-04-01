export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard40',
  condition: [
    ['Building/Military/Shipyard', 40],
  ],
  title: 'Построить Верфь 40-го уровня',
  text: '<p>Вам уже встречалась Хайль-Гидра, Командир? Отвратительный корабль. Отвратительный в том смысле, что сочетает в себе огромный урон и довольно крепкую броню, которую почти невозможно пробить даже солидным количеством крейсеров.</p><p>Вот именно поэтому Верфь начинает разработку вашего первого Линкора. Это – наш ответ Рептилоидам и Хайль-Гидре. Прочный, относительно недорогой корабль, обладающий достаточной убойной силой – вот что нужно этой колонии, Консул.</p>',
  options: {
    accept: {
      text: 'И мы это заслужили!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
