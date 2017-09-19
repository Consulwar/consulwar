import Small from '../lib/Small';

export default {
  ...Small,
  drop: [
    {
      chance: 20,
      profit: { 'Unit/Space/Human/GammaDrone': 1 },
    },
    {
      chance: 19,
      profit: { 'Unit/Space/Human/Wasp': 1 },
    },
    {
      chance: 15,
      profit: { 'Unit/Space/Human/Mirage': 1 },
    },
    {
      chance: 14,
      profit: { 'Unit/Space/Human/Frigate': 1 },
    },
    {
      chance: 12,
      profit: { 'Unit/Space/Human/TruckC': 1 },
    },
    {
      chance: 8,
      profit: { 'Unit/Space/Human/Cruiser': 1 },
    },
    {
      chance: 6,
      profit: { 'Unit/Space/Human/Battleship': 1 },
    },
    {
      chance: 4,
      profit: { 'Unit/Space/Human/Carrier': 1 },
    },
    {
      chance: 1,
      profit: { 'Unit/Space/Human/Dreadnought': 1 },
    },
  ],
};
