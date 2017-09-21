import MadRace from '../lib/MadRace';

export default {
  ...MadRace,
  drop: [
    {
      chance: 5,
      profit: { 'Resource/Artifact/Orange/TopazPlasmoid': [1, 2] },
    },
    {
      chance: 5,
      profit: { 'Resource/Artifact/Orange/AncientTechnology': [1, 2] },
    },
    {
      chance: 5,
      profit: { 'Resource/Artifact/Orange/AncientScheme': [1, 2] },
    },
    {
      chance: 5,
      profit: { 'Resource/Artifact/Orange/AncientKnowledge': [1, 2] },
    },
    {
      chance: 5,
      profit: { 'Resource/Artifact/Orange/AncientArtifact': [1, 2] },
    },
    {
      chance: 75,
      profit: {
        'Resource/Base/Metal': 10000,
        'Resource/Base/Crystal': 10000,
      },
    },
  ],
};
