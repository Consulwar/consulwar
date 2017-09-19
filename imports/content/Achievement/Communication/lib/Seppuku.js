export default {
  id: 'Achievement/Communication/Seppuku',
  field: 'Chat/Seppuku',
  levels: [50, 100, 200],
  title: [
    'Мастер сэппуку',
    'Живота батенька',
    'А что там внутри',
  ],
  description: [
    'Выполнил 50 сэппуку в чате',
    'Выполнил 100 сэппуку в чате',
    'Выполнил 200 сэппуку в чате',
  ],
  effects: {
    Price: [
      {
        textBefore: 'Сообщения в общий чат дешевле на ',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/message',
        affect: 'crystals',
        result(level = this.getCurrentLevel()) {
          return [10, 20, 30][level - 1];
        },
      },
    ],
  },
};
