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
      profit: { 'Unit/Space/Human/Gammadrone': 1 },
    },
    {
      chance: 20,
      profit: { 'Unit/Space/Human/Wasp': 1 },
    },
    {
      chance: 15,
      profit: { 'Unit/Space/Human/Mirage': 1 },
    },
    {
      chance: 4,
      profit: { 'Unit/Space/Human/Frigate': 1 },
    },
  ],
};
