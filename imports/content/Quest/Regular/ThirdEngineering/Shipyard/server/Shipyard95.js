export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard95',
  condition: [
    ['Building/Military/Shipyard', 95],
  ],
  title: 'Построить Верфь 95-го уровня',
  text: '<p>Конструкция Пожинателя настолько ценна, что ни при каких обстоятельствах не должна попасть в руки Рептилоидов, Командир. Поэтому инженеры сконструировали бомбу, которую вмонтировали в корпус корабля.</p><p>Если он будет уничтожен во время боя, то бомба сработает и уничтожит не только остатки Пожинателя, но и все корабли Рептилоидов, находящиеся поблизости. По-моему, это отличная идея, и даже немного странно, что её внедрили только на один корабль. Я бы укомплектовал такими бомбами весь флот.</p>',
  options: {
    accept: {
      text: 'А кто бы нам ресурсы привозил, дубина?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 8000,
    crystals: 8000,
  },
};
