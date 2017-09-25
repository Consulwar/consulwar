import Small from '../lib/Small';

export default {
  ...Small,
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
