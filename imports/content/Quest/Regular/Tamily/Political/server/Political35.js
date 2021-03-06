export default {
  id: 'Quest/Regular/Tamily/Political/Political35',
  condition: [
    ['Building/Residential/Political', 35],
  ],
  title: 'Построить Политический Центр 35-го уровня',
  text: '<p>Я как чувствовала, Консул, что делать отопление в Политическом Центре – не слишком удачная идея. Видимо, повышенный комфорт заронил в умы серых пиджаков странную идею устроить себе каникулы.</p><p>Мол, они очень хорошо потрудились в эту сессию – шахты исправно добывают руду, строительство идёт бешеными темпами, даже рептилоиды периодически терпят от нашего победоносного флота… Теперь, значит, можно и отдохнуть.</p>',
  options: {
    accept: {
      text: 'А что, отличная идея! Я пока вздремну, а ты погоняй там народ вокруг Центра пару часиков.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 450,
    crystals: 450,
  },
};
