import SpacePort15 from './SpacePort15';
import SpacePort20 from './SpacePort20';
import SpacePort25 from './SpacePort25';
import SpacePort30 from './SpacePort30';
import SpacePort35 from './SpacePort35';
import SpacePort40 from './SpacePort40';
import SpacePort45 from './SpacePort45';
import SpacePort50 from './SpacePort50';
import SpacePort55 from './SpacePort55';
import SpacePort60 from './SpacePort60';
import SpacePort65 from './SpacePort65';
import SpacePort70 from './SpacePort70';
import SpacePort75 from './SpacePort75';
import SpacePort80 from './SpacePort80';
import SpacePort85 from './SpacePort85';
import SpacePort90 from './SpacePort90';
import SpacePort95 from './SpacePort95';
import SpacePort100 from './SpacePort100';

export default {
  id: 'Quest/Regular/Tamily/SpacePort',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Residential/House', 20],
  ],
  finalText: 'Поздравляем! Космопорт достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    SpacePort15,
    SpacePort20,
    SpacePort25,
    SpacePort30,
    SpacePort35,
    SpacePort40,
    SpacePort45,
    SpacePort50,
    SpacePort55,
    SpacePort60,
    SpacePort65,
    SpacePort70,
    SpacePort75,
    SpacePort80,
    SpacePort85,
    SpacePort90,
    SpacePort95,
    SpacePort100,
  ],
};
