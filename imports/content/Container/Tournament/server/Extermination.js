import Extermination from '../lib/Extermination';

export default {
  ...Extermination,
  drop: [
    {
      chance: 11,
      profit: { 'Resource/Artifact/Blue/SapphirePlasmoid': [1, 6] },
    },
    {
      chance: 11,
      profit: { 'Resource/Artifact/Blue/QuadCooler': [1, 6] },
    },
    {
      chance: 11,
      profit: { 'Resource/Artifact/Blue/PlasmaTransistors': [1, 6] },
    },
    {
      chance: 11,
      profit: { 'Resource/Artifact/Blue/NanoWires': [1, 6] },
    },
    {
      chance: 11,
      profit: { 'Resource/Artifact/Blue/Chip': [1, 6] },
    },
    {
      chance: 45,
      profit: {
        'Resource/Base/Metal': 2500,
        'Resource/Base/Crystal': 2500,
      },
    },
  ],
};
