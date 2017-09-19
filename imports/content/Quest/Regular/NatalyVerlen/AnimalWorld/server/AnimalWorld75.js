export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld75',
  condition: [
    ['Research/Evolution/AnimalWorld', 75],
  ],
  title: 'Исследовать В Мире Животных 75-го уровня',
  text: '<p>Каюсь, Консул, я не углядела и в Политический Центр пролез какой-то мошенник. Наврал нашим пиджакам с три короба про новую физику, они уши и развесили. Хотят теперь дать ему денег и снарядить новый класс кораблей, которые должны будут двигаться в космосе без топлива, просто за счёт какой-то неведомой торсионной тяги.</p><p>Ладно, раз моя ошибка, то мне и исправлять… Для начала отправлю гуру новой физики в шахту, а потом возьму лазерную пушку и начну вправлять мозги чиновникам.</p>',
  options: {
    accept: {
      text: 'Он тебе и в шахте чего-нибудь сломает. Предлагаю расстрел.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 11500,
    crystals: 11500,
  },
};
