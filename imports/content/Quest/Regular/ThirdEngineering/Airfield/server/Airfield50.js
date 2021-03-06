export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield50',
  condition: [
    ['Building/Military/Airfield', 50],
  ],
  title: 'Построить Аэродром 50-го уровня',
  text: '<p>А помните речевое управление, которым занимается авиазавод? В общем, оказалось, что для безопасного тестирования лучше отрабатывать манёвры на наземных стендах и макетах. Да и для других испытаний стенды пригодятся – на них вполне можно проводить тренировки новичков.</p><p>Пропадёт, конечно, давняя традиция запихивать зелёных пилотов в старый Трак и говорить им, что они летят десантироваться на родную планету Рептилоидов, но это даже к лучшему – меньше штанов стирать гарнизонной прачечной.</p>',
  options: {
    accept: {
      text: 'Хуячечной! Ладно, стройте эти ваши макеты.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
