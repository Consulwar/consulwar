export default {
  id: 'Achievement/General/WithoutRules',
  field: 'Colosseum/Tournaments/Total',
  levels: [250],
  title: 'Без правил',
  description: 'Провести 250 турниров в колизее',
  effects: {
    Special: [
      {
        notImplemented: true,
        textBefore: 'Уменьшает время подготовки турнира на ',
        textAfter: '%',
        affect: 'tournamentsCooldownPeriod',
        priority: 2,
        condition: 'Unique/tournamentsCooldownBonus',
        result(level = this.getCurrentLevel()) {
          return (level > 0) ? 10 : 0;
        },
      },
    ],
  },
};
