export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard60',
  condition: [
    ['Building/Military/Shipyard', 60],
  ],
  title: 'Построить Верфь 60-го уровня',
  text: '<p>Интересная получается картина, Командир: я просмотрел несколько боёв и заметил, что ваши Траки являются приоритетной целью у очень серьёзных кораблей Рептилоидов – Виверн. Эти заразы встречаются почти в каждом патруле, с которым у вас были стычки за последнее время.</p><p>Я уже отправил данные инженерам, и они нашли способ улучшить навигацию и позиционирование Траков. Проще говоря, они перестанут высовываться до окончания боя. Я бы сказал, что это очень эффективный способ сохранить флот и добычу.</p>',
  options: {
    accept: {
      text: 'Ещё бы и чести было столько же, сколько людишек!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7700,
    crystals: 7700,
  },
};
