export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard90',
  condition: [
    ['Building/Military/Shipyard', 90],
  ],
  title: 'Построить Верфь 90-го уровня',
  text: '<p>Тень, как вы, наверное, уже знаете, Командир, это пиздец какой страшный корабль. Но страх не должен мешать солдату целится, верно? Поэтому на Верфи крепко подумали и решили снабдить новыми прицелами партию Рейлганов – ведь это полностью автоматизированные орудия и там нет солдат, которые могли бы обосраться, глядя на Тень через прицел.</p><p>Ну, или просто думая о Тени. В общем, идея пришлась одинаково по душе и руководству, и простым солдатам. Осталось только воплотить её в жизнь.</p>',
  options: {
    accept: {
      text: 'Блин, теперь я тоже думаю о Тени.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7000,
    crystals: 7000,
  },
};
