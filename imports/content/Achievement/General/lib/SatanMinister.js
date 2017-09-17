export default {
  notImplemented: true,
  id: 'Achievement/General/SatanMinister',
  title: 'Служитель Сатаны',
  description: '100 раз устраивал турнир Кровавое Месиво и больше никаких других турниров',
  effects: {
    ProfitOnce: [
      {
        notImplemented: true,
        textAfter: ' рандомных синих итемов',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 50 : 0;
        },
      },
      {
        notImplemented: true,
        textAfter: ' фиолетовых итемов',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 30 : 0;
        },
      },
      {
        notImplemented: true,
        textAfter: ' оранжевых',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 10 : 0;
        },
      },
      {
        notImplemented: true,
        textAfter: ' рубиновый плазмоид',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 1 : 0;
        },
      },
    ],
  },
};
