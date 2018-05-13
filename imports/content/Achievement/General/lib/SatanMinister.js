export default {
  id: 'Achievement/General/SatanMinister',
  field: 'colosseum.tournaments.bloody_mess',
  levels: [100],
  title: 'Служитель Сатаны',
  description: '100 раз устраивал турнир Кровавое Месиво',
  effects: {
    Military: [
      {
        textBefore: 'Урон флота +',
        textAfter: '%',
        condition: 'Unit/Human/Space',
        priority: 2,
        affect: 'damage',
        result({ level }) {
          return (level > 0) ? 1 : 0;
        },
      },
    ],
  },
};
