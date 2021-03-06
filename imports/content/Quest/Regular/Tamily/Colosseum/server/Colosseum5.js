export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum5',
  condition: [
    ['Building/Residential/Colosseum', 5],
  ],
  title: 'Построить Колизей 5-го уровня',
  text: '<p>Поздравляю вас с постройкой Колизея, правитель! Вы спрашивали про тотализатор? Система очень простая: на каждый турнир приглашаются именитые гости со всей вселенной, которые ставят артефакты на исход боя.</p><p>Военные, в свою очередь, за очки чести поставляют в Колизей «зелёное мясо», которое сражается на потеху инопланетной публики. В итоге все остаются в выигрыше – гости развлекаются, военные сбывают пленных, вы получаете артефакты, а учёные – останки рептилоидов.</p>',
  options: {
    accept: {
      text: 'Да, хорошо, что не наоборот.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 150,
    crystals: 150,
  },
};
