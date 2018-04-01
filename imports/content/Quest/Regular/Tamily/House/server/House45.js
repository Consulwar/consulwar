export default {
  id: 'Quest/Regular/Tamily/House/House45',
  condition: [
    ['Building/Residential/House', 45],
  ],
  title: 'Построить Жилой Комплекс 45-го уровня',
  text: '<p>Есть небольшая проблема, Консул. Вы помните, мы переоборудовали Жилые Комплексы, чтобы люди быстрее собирались на работу? Оказалось, в новой планировке есть некоторые изъяны: в частности, многие люди получили травмы, когда поскальзывались в душе и падали прямиком на горящую плиту… Словом, инженеры поскребли в затылке, и решение было найдено — каждый санокухонный блок будет оснащён универсальной хозяйственной машиной — она будет стирать, гладить, готовить и убирать. По вашей команде, Великий, монтаж тут же начнётся.</p><p>И, если мне будет позволено напомнить, начиная с этого момента для улучшения здания будет требоваться определенный инопланетный артефакт. Вы можете получить его, Консул, атакуя корабли и поселения рептилоидов с помощью вашего космического флота. Флотом и вопросами надирания зелёных задниц у нас ведает Комиссар Вахаёбович. Думаю, он будет в восторге, если вы прикажете ему атаковать что-либо движущееся.</p>',
  options: {
    accept: {
      text: 'Что-либо движущееся я сам не прочь… атаковать.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
