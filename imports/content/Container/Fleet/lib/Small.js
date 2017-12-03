export default {
  id: 'Container/Fleet/Small',
  title: 'Малый контейнер флота',
  description: '',
  price: {
    credits: 110,
  },
  drop: [
    {
      chance: 61,
      profit: { 'Unit/Human/Space/Gammadrone': 1 },
    },
    {
      chance: 20,
      profit: { 'Unit/Human/Space/Wasp': 1 },
    },
    {
      chance: 15,
      profit: { 'Unit/Human/Space/Mirage': 1 },
    },
    {
      chance: 4,
      profit: { 'Unit/Human/Space/Frigate': 1 },
    },
  ],
};
