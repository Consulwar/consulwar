export default {
  id: 'Quest/Regular/NatalyVerlen/Ikea/Ikea40',
  condition: [
    ['Research/Evolution/Ikea', 40],
  ],
  title: 'Исследовать Мебель из Икеа 40-го уровня',
  text: '<p>Консул, наш отдел фармацевтики окончательно сошёл с ума: мало того, что они и так получают самые лучшие центрифуги и лабораторные реакторы, так этого им показалось мало, и они прислали мне заявку на установку для определения истираемости и ломкости.</p><p>Они, видите ли, хотят посмотреть, как быстро у них ломаются таблетки! Я откровенно посоветовала начальнику отдела выпускать продукцию в порошках, а ещё лучше – в шприцах-дротиках, хотя бы в стрельбе потренируются на случай захвата планеты.</p>',
  options: {
    accept: {
      text: 'И мишени в виде жоп на учениях поставить, ага.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
