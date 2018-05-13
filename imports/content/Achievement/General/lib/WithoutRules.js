export default {
  id: 'Achievement/General/WithoutRules',
  field: 'colosseum.tournaments.total',
  levels: [250],
  title: 'Без правил',
  description: 'Провести 250 турниров в колизее',
  effects: {
    Income: [
      {
        textBefore: '+',
        textAfter: ' ГГК в час',
        priority: 1,
        affect: 'credits',
        result({ level }) {
          return (level > 0) ? 0.01 : 0;
        },
      },
    ],
  },
};
