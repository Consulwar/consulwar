import Human from './Human';
import Metal from './Metal';
import Crystal from './Crystal';
import Honor from './Honor';
import Credit from './Credit';

export default {
  'Resource/Base/Human': Human,
  'Resource/Base/Metal': Metal,
  'Resource/Base/Crystal': Crystal,
  'Resource/Base/Honor': Honor,
  'Resource/Base/Credit': Credit,

  // legacy compatibility
  humans: Human,
  metals: Metal,
  crystals: Crystal,
  honor: Honor,
  credits: Credit,
};
