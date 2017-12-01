import Small from '../lib/Small';

export default {
  ...Small,
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
