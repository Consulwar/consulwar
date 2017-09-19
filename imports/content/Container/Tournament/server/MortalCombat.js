import MortalCombat from '../lib/MortalCombat';

export default {
  ...MortalCombat,
  drop: [
    {
      chance: 8,
      profit: { 'Resource/Artifact/Purple/Nicolascagium': [1, 4] },
    },
    {
      chance: 8,
      profit: { 'Resource/Artifact/Purple/Keanureevesium': [1, 4] },
    },
    {
      chance: 8,
      profit: { 'Resource/Artifact/Purple/Jimcarrium': [1, 4] },
    },
    {
      chance: 8,
      profit: { 'Resource/Artifact/Purple/Garyoldmanium': [1, 4] },
    },
    {
      chance: 8,
      profit: { 'Resource/Artifact/Purple/AmethystPlasmoid': [1, 4] },
    },
    {
      chance: 60,
      profit: {
        'Resource/Base/Metal': 500000,
        'Resource/Base/Crystal': 500000,
      },
    },
  ],
};
