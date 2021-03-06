export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket75',
  condition: [
    ['Building/Residential/BlackMarket', 75],
  ],
  title: 'Построить Черный Рынок 75-го уровня',
  text: '<p>Иногда артефактом может оказаться то, что невозможно погрузить в трюм пиратского корабля, правитель.</p><p>Только что стало известно, что контрабандисты из отдалённого сектора обнаружили невероятный мир — кольцеобразную структуру, вращающуюся вокруг ничем не примечательной звезды. И на внутренней стороне этого кольца вполне можно жить! Учёные уже выкупили карту этого района Вселенной и собираются в длительную командировку.</p>',
  options: {
    accept: {
      text: 'Увидят там таких трёхногих с двумя головами — пусть не пугаются.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
