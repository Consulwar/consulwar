export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield100',
  condition: [
    ['Building/Military/Airfield', 100],
  ],
  title: 'Построить Аэродром 100-го уровня',
  text: '<p>Мы подходим к завершающему этапу в самолётостроении, Командир, и очень скоро ваш Аэродром станет самым огромным и развитым объектом на планете. Осталось всего ничего – подготовить парад военно-воздушной техники.</p><p>О, я уже представляю, как построенные в ряд тени Скорострелов пронесутся по вашей земле, Консул. Когда-нибудь мы отобьём нашу родную планету у проклятых захватчиков, и сотый Аэродром – один из наиважнейших шагов в сторону победы.</p>',
  options: {
    accept: {
      text: 'Да, победы! И убедитесь, что моя статуя будет натёрта до блеска.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 114,
    crystals: 114,
  },
};
