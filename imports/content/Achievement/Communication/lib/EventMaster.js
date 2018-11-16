export default {
  id: 'Achievement/Communication/EventMaster',
  levels: [1, 2, 3],
  title: [
    'Ивентмастер 1 степени',
    'Ивентмастер 2 степени',
    'Ивентмастер 3 степени',
  ],
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' ГГК в час',
        priority: 1,
        affect: 'credits',
        result({ level }) {
          return level;
        },
      },
    ],
  },
};
