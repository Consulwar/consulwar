export default {
  id: 'House/Avatar/Strawman',
  isUnique: true,
  title: 'Соломенный человек',
  description: 'На самом деле все системы связи вселенной Консулов и вселенной 42 работают через портал и напрямую передают сигнал в нейросети. Аватар Консула, как физическое тело в принципе может не участвовать. Так почему бы не заменить его соломой? ',
  effects: {
    Price: [
      {
        textBefore: 'Снижает стоимость постройки на ',
        textAfter: '%',
        priority: 2,
        affect: ['metals', 'crystals'],
        result() {
          return 1;
        },
      },
    ],
  },
};
