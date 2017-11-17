export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher75',
  condition: [
    ['Building/Residential/PulseCatcher', 75],
  ],
  title: 'Построить Импульсный Уловитель 75-го уровня',
  text: '<p>Пока наверняка не доказано, что странное вещество вообще существует, однако им уже активно интересуются физики-теоретики, правитель. И один из учёных выдвинул теорию о том, что мы не можем обнаружить кварковое вещество просто потому, что оно не взаимодействует с обычной материей.</p><p>Мол, из-за того, что в нашем мире все взаимодействия электромагнитные, странное вещество проскальзывает мимо материи по её наружному заряду. Выходит, нужно либо воспроизвести условия внутри звезды, либо…</p>',
  options: {
    accept: {
      text: '…отправить этого умника прямиком в кварковую звезду. Посмотрим, как он из неё выскользнет.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 80,
    crystals: 80,
  },
};