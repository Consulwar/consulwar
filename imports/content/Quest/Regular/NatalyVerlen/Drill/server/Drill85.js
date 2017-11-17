export default {
  id: 'Quest/Regular/NatalyVerlen/Drill/Drill85',
  condition: [
    ['Research/Evolution/Drill', 85],
  ],
  title: 'Исследовать Бурильный Бур 85-го уровня',
  text: '<p>Из-за вашего эмоционального порыва, Консул, Совет решил выделить вам дополнительное оборудование для шахт металла. Это приборы, которые геологи называют каротажем; а проще говоря, это обычные зонды, которые регистрируют изменения электромагнитных полей, ионизирующего излучения, температуры…</p><p>В общем, любых косвенных признаков, по которым можно вычислить физические свойства окружающих горных пород. Использование таких зондов должно уберечь бурильное оборудование от катастрофы.</p>',
  options: {
    accept: {
      text: 'Совет дал приборы, я дал средства… Кто-то на нашей планете всё время что-то берёт.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 110,
    crystals: 110,
  },
};