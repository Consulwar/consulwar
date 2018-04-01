export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation/PowerStation100',
  condition: [
    ['Building/Military/PowerStation', 100],
  ],
  title: 'Построить Электростанцию 100-го уровня',
  text: '<p>Командир, у меня прекрасные новости: осталось совсем немного до того момента, когда ваши инженеры, наконец, запитают всю колонию от самой мощной Электростанции на этой планете. Будут и резервные решения, если вы беспокоитесь о безопасности, Консул.</p><p>Но самое главное — мы вот-вот подойдём к совершенно новому этапу строительства, когда уже нечего улучшать, а можно спокойно сфокусироваться на том, чтобы дать пизды проклятым Рептилоидам. Вы — лучший, Командир!</p>',
  options: {
    accept: {
      text: 'Обниматься не будем.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9000,
    crystals: 9000,
  },
};
