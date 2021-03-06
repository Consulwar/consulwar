export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial23',
  condition: [
    ['Statistic/chat.messages', 1],
  ],
  slides: 4,
  helpers: [
    {
      url: '/game/chat/',
      target: '#message > textarea',
      direction: 'top',
    },

    {
      url: '',
      target: 'header .menu li.chat:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Написать сообщение в чат',
  text: '<p>В целом, мне кажется, вы уже освоились, Консул. Людей, Металл и Кристалл можно добыть с помощью зданий и в боях, Честь выдаётся за отправку войск или за бои в космосе, Артефакты можно добывать на планетах. Это всё, что нужно вам для развития колонии. Не забывайте смотреть на необходимые технологии и ускорять строительство. Ах да! Общение с другими консулами. Напишите любую фразу в чат, правитель.</p>',
  options: {
    accept: {
      text: 'Сейчас я им напишу пару ласковых…',
      mood: 'positive',
    },
  },
  reward: {
    honor: 500,
  },
};
