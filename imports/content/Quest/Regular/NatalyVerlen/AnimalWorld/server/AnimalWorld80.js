export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld80',
  condition: [
    ['Research/Evolution/AnimalWorld', 80],
  ],
  title: 'Исследовать В Мире Животных 80-го уровня',
  text: '<p>Новая гениальная идея от наших чиновников из Политического Центра – нужно все свободное население бросать на строительство. По их мнению, это должно существенно сократить время постройки любого здания.</p><p>А ничего, что техники только ограниченное количество? И стройматериалы подвозятся строго в соответствии с графиком работ? И даже если мы сможем обеспечить всех техникой и материалами, остаётся вопрос квалификации. Даже вы это понимаете, Консул, а дебилы из Центра – нет.</p>',
  options: {
    accept: {
      text: 'Я всё понимаю, только не сверкай так глазами. Как ты любишь свою работу, аж страшно.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 120,
    crystals: 120,
  },
};
