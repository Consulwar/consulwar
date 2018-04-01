export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum35',
  condition: [
    ['Building/Residential/Colosseum', 35],
  ],
  title: 'Построить Колизей 35-го уровня',
  text: '<p>Может быть, вы не знали этого, правитель, но мусорщики – самые зажиточные граждане нашего общества. Я имею в виду, конечно же, космических мусорщиков – тех, кто вылавливает части разбитых кораблей Рептилоидов на орбите планеты и в других труднодоступных для ваших траков местах.</p><p>Но не волнуйтесь, все «награбленное» непосильным трудом им просто негде сбывать, поэтому каждый ценный артефакт чешуйчатых идёт на благое дело – кровавое месиво в Колизее.</p>',
  options: {
    accept: {
      text: 'Звучит многообещающе.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 450,
    crystals: 450,
  },
};
