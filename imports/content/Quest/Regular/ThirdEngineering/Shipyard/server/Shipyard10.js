export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard10',
  condition: [
    ['Building/Military/Shipyard', 10],
  ],
  title: 'Построить Верфь 10-го уровня',
  text: '<p>Для начала мы усовершенствуем конструкцию Ос, а именно их уникальную способность оставлять свой хвост в корабле противника. Такой трюк даже не снился Рептилоидам, а значит, нам будет гораздо проще застать их врасплох. Верфь готова начать испытания этой технологии.</p>',
  options: {
    accept: {
      text: 'Какой хвост? Ты бредишь, Третий?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 200,
    crystals: 200,
  },
};
