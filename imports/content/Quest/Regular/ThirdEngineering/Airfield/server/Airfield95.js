export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield95',
  condition: [
    ['Building/Military/Airfield', 95],
  ],
  title: 'Построить Аэродром 95-го уровня',
  text: '<p>Наши инженеры, Консул, проводят техническое обслуживание вашего флота, основываясь на том, как быстро изнашиваются те или иные детали. Работа отдела заключается в том, чтобы выбраковать те части, которые вот-вот пойдут вразнос.</p><p>Это работа тонкая, но вполне выполнимая. И было бы совсем здорово, если бы существовала возможность не только отлавливать изношенные детали, но и заменять их более прочными. Правда, для этого отделу понадобится небольшое расширение.</p>',
  options: {
    accept: {
      text: 'Как рука, кстати? ТО прошла?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 108,
    crystals: 108,
  },
};
