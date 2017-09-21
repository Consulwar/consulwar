export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld45',
  condition: [
    ['Research/Evolution/AnimalWorld', 45],
  ],
  title: 'Исследовать В Мире Животных 45-го уровня',
  text: '<p>И снова нелепая инициатива в Политическом Центре – на сей раз обсуждают дресс-код. Мало того, что я и так не могу отличить одного чиновника от другого, так они ещё требуют одинаково одеть всю охрану и обслуживающий персонал! Чтобы, значит, никто не перепутал мыслителя, работающего на благо планеты, с каким-то никчёмным инженеришкой.</p><p>Ну что ж, они напросились – теперь все серые пиджаки будут сами охранять и поддерживать в рабочем состоянии своё здание. Экономно и никакой путаницы.</p>',
  options: {
    accept: {
      text: 'Сурово! Сразу зауважал инженеришек.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 85,
    crystals: 85,
  },
};
