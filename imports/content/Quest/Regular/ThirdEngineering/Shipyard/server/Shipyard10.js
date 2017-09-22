export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard10',
  condition: [
    ['Building/Military/Shipyard', 10],
  ],
  title: 'Построить Верфь 10-го уровня',
  text: '<p>Это здание, Командир, является ключевым для вашего звёздного флота. Здесь мы будем производить корабли, которые надерут зелёные жопы; и хоть галактика велика, поверьте мне, им некуда будет скрыться от наших штурмовых отрядов.</p><p>Поэтому для начала мы усовершенствуем конструкцию Ос, а именно: их уникальную способность оставлять свой хвост в корабле противника. Такой трюк даже не снился Рептилоидам, а значит, нам будет гораздо проще застать их врасплох. Верфь готова начать испытания этой технологии.</p>',
  options: {
    accept: {
      text: 'Вперёд, к зелёным жопам!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7,
    crystals: 7,
  },
};
