export default {
  notImplemented: true,
  id: 'Achievement/General/LossOfLosses',
  title: 'Потеря потерь',
  description: 'Загнать любой ресурс в минус 100 000 или больший минус',
  effects: {
    ProfitOnce: [
      {
        notImplemented: true,
        textAfter: ' ГГК',
        result(level) {
          return (level > 0) ? 250 : 0;
        },
      },
    ],
  },
};
