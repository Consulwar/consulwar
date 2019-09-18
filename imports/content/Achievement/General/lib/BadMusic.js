export default {
  id: 'Achievement/General/BadMusic',
  levels: [1, 2, 3, 4],
  title: [
    'Очень плохая музыка 1 степени',
    'Очень плохая музыка 2 степени',
    'Очень плохая музыка 3 степени',
    'Очень плохая музыка 4 степени',
  ],
  description: 'Направление? Какое направление?',
  effects: {
    Special: [
      {
        textBefore: 'На этот раз как-то не удало-ось',
        priority: 1,
        result() {},
      },
    ],
  },
};
