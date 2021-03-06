export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum15',
  condition: [
    ['Building/Residential/Colosseum', 15],
  ],
  title: 'Построить Колизей 15-го уровня',
  text: '<p>У нас посетители, Консул, – инсектоидная раса, прибывшая с другого края Вселенной. Несмотря на то, что эти тварюшки ужасно падки на зрелища, они так и не додумались до того, чтобы изобрести телетрансляции.</p><p>Поэтому довольно долгое время эта раса развлекалась тем, что устраивала затмения на планетах с низким уровнем развития и любовалась на то, как примитивные жители в ужасе мечутся и поджигают свои дома. Но планеты рано или поздно кончаются…</p>',
  options: {
    accept: {
      text: '…а побоища в Колизее – никогда!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 250,
    crystals: 250,
  },
};
