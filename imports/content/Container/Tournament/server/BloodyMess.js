import BloodyMess from '../lib/BloodyMess';

export default {
  ...BloodyMess,
  drop: [
    {
      chance: 15,
      profit: { 'Resource/Artifact/Green/SecretTechnology': [1, 8] },
    },
    {
      chance: 15,
      profit: { 'Resource/Artifact/Green/RotaryAmplifier': [1, 8] },
    },
    {
      chance: 15,
      profit: { 'Resource/Artifact/Green/ReptileTechnology': [1, 8] },
    },
    {
      chance: 15,
      profit: { 'Resource/Artifact/Green/EmeraldPlasmoid': [1, 8] },
    },
    {
      chance: 15,
      profit: { 'Resource/Artifact/Green/Batteries': [1, 8] },
    },
    {
      chance: 25,
      profit: {
        'Resource/Base/Metal': 50000,
        'Resource/Base/Crystal': 50000,
      },
    },
  ],
};
