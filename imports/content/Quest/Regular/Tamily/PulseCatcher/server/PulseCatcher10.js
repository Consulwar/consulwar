export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher10',
  condition: [
    ['Building/Residential/PulseCatcher', 10],
  ],
  title: 'Построить Импульсный Уловитель 10-го уровня',
  text: '<p>Неожиданно Уловителем заинтересовались учёные-биологи, Консул. Оказалось, что они уже давно ищут надёжный способ напыления наночастиц. Опыты с мощным магнитным полем показали, что это в принципе возможно, но нужна ещё и управляемая гравитация, чтобы частички не слипались друг с другом.</p><p>И если мы найдём место на Уловителе, то там можно будет проводить испытания этой плазменной пыли, как учёные её называют. Говорят, что смогут со временем создать настоящие наноповязки и наномази.</p>',
  options: {
    accept: {
      text: 'Плазменная – не алмазная, пусть играются в свою науку.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 200,
    crystals: 200,
  },
};
