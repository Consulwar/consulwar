export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates35',
  condition: [
    ['Building/Military/Gates', 35],
  ],
  title: 'Построить Врата 35-го уровня',
  text: '<p>Мне иногда кажется, Командир, что вратам нравится всё круглое. Ну, в смысле, они сами круглые, наверное, им комфортно открываться во всякие люки. Вот вчера, например, мы на пару минут увидели явно каменный круглый ход, отдаленно напоминающий канализацию.</p><p>А потом откуда-то выползла здоровая змея и уставилась на нас жуткими желтыми глазами. Два техника, которые стояли ближе всех, мгновенно остолбенели и попадали на пол, как деревянные. Натали их до сих пор в лазарете сканирует.</p>',
  options: {
    accept: {
      text: 'Ага. А куда делась змея, говоришь?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 450,
    crystals: 450,
  },
};
