export default {
  id: 'Quest/Regular/NatalyVerlen/Ikea/Ikea100',
  condition: [
    ['Research/Evolution/Ikea', 100],
  ],
  title: 'Исследовать Мебель из Икеа 100-го уровня',
  text: '<p>Орбитальная станция охраняет нашу планету от рептилоидного вторжения день и ночь, Консул. У людей, которые там работают и живут, нет выходных и праздничных дней, а иногда нет даже перерыва на обед.</p><p>Прибавьте к этому посменное дежурство, стресс и искусственную гравитацию, и вы поймёте, что организация рабочего пространства на огромной орбитальной станции – та ещё головная боль. А вопрос о том, какая мебель должна быть на этой станции, решался самыми талантливыми учёными нашей лаборатории.</p>',
  options: {
    accept: {
      text: 'Сто пудов всё белое и играет вальс про Дунай.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 13500,
    crystals: 13500,
  },
};
