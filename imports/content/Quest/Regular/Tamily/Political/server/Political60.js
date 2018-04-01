export default {
  id: 'Quest/Regular/Tamily/Political/Political60',
  condition: [
    ['Building/Residential/Political', 60],
  ],
  title: 'Построить Политический Центр 60-го уровня',
  text: '<p>И снова у нас беспорядки в Политическом Центре. На сей раз пострадали вёдра, которые я с большим трудом добыла в казарменной столовой турникмэнов. И не спрашивайте, зачем они там были нужны, главное, что их опять похитили! Вместе с новым созывом, который только-только приступил к подсчёту кворума.</p><p>На этот раз нам, правда, удалось отбить пиджаков у хулиганов, но они-таки успели надеть эти вёдра на головы свежеиспечённым чиновникам. И многие намертво застряли в этих вёдрах, Консул.</p>',
  options: {
    accept: {
      text: 'А? Что? Как достать из ведра голову? Переворачиваешь и стучишь! Вот у нас случай был…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1000,
    crystals: 1000,
  },
};
