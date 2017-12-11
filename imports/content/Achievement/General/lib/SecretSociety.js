export default {
  notImplemented: true,
  id: 'Achievement/General/SecretSociety',
  title: 'Тайное общество',
  description: 'Знает то, чего не знают другие',
  effects: {
    ProfitOnce: [
      {
        notImplemented: true,
        textAfter: ' рубиновых плазмоидов',
        result(level) {
          return (level > 0) ? 50 : 0;
        },
      },
    ],
  },
};
