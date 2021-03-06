export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard75',
  condition: [
    ['Building/Military/Shipyard', 75],
  ],
  title: 'Построить Верфь 75-го уровня',
  text: '<p>Может показаться, что теперь, когда линейка кораблей боевого флота полностью скомпонована, Верфи больше нечего делать, но это не так. Всегда можно что-нибудь улучшить даже в таком универсальном корабле, как Крейсер.</p><p>Например, снабдить его мощной пушкой, которая будет очень долго заряжаться с начала боя и выдавать залп огромной мощности только под самый конец. Чем не решительная точка в затянувшейся битве, Командир? Уверен, наши инженеры ещё не раз удивят вас своими технологическими новинками.</p>',
  options: {
    accept: {
      text: 'Да они, в принципе, каждый день меня удивляют.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
