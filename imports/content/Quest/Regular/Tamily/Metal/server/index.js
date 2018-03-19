import Metal25 from './Metal25';
import Metal30 from './Metal30';
import Metal35 from './Metal35';
import Metal40 from './Metal40';
import Metal45 from './Metal45';
import Metal50 from './Metal50';
import Metal55 from './Metal55';
import Metal60 from './Metal60';
import Metal65 from './Metal65';
import Metal70 from './Metal70';
import Metal75 from './Metal75';
import Metal80 from './Metal80';
import Metal85 from './Metal85';
import Metal90 from './Metal90';
import Metal95 from './Metal95';
import Metal100 from './Metal100';

export default {
  id: 'Quest/Regular/Tamily/Metal',
  condition: [
    ['Research/Evolution/Drill', 25],
    ['Research/Evolution/Alloy', 13],
    ['Building/Residential/Metal', 20],
  ],
  finalText: 'Поздравляем! Шахта Металла достигла максимального уровня. Слава Великому Консулу!',
  quests: [
    Metal25,
    Metal30,
    Metal35,
    Metal40,
    Metal45,
    Metal50,
    Metal55,
    Metal60,
    Metal65,
    Metal70,
    Metal75,
    Metal80,
    Metal85,
    Metal90,
    Metal95,
    Metal100,
  ],
};
