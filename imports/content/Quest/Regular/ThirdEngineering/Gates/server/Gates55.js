export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates55',
  condition: [
    ['Building/Military/Gates', 55],
  ],
  title: 'Построить Врата 55-го уровня',
  text: '<p>Или вот ещё был случай, Командир. Приходим мы с утра в помещение для персонала и чувствуем, что тянет таким холодным ветром откуда-то. И пахнет, главное, одновременно костром, степью и одиночеством. Ну, мы к Вратам, глядим – там город. Тихий такой, осенний, уютный даже. Только какой-то неправильный.</p><p>Минут пять мы на него пялились, как заворожённые, и только потом заметили трупы на улицах. Эпидемия. В общем, Врата закрылись, и мои техники трое суток ангар дезинфекцией поливали. Мало ли что.</p>',
  options: {
    accept: {
      text: 'Третий, ты что, заболел? Какая степь, какое одиночество?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 358,
    crystals: 230,
  },
};
