export default {
  id: 'Achievement/General/Hacker',
  levels: [1, 2, 3],
  title: [
    'Кулхацкер 1 степени',
    'Кулхацкер 2 степени',
    'Кулхацкер 3 степени',
  ],
  description: [
    'Найти 1 уязвимость в игре и сообщить о ней',
    'Найти 2 уязвимости в игре и сообщить о них',
    'Найти 3 уязвимости в игре и сообщить о них',
  ],
  effects: {
    Special: [
      {
        textBefore: '',
        textAfter: ' ггк единоразово + приз',
        priority: 1,
        result(level) {
          return level * 500;
        },
      },
    ],
  },
};
