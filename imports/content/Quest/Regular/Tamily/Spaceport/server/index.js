import Spaceport15 from './Spaceport15';
import Spaceport20 from './Spaceport20';
import Spaceport25 from './Spaceport25';
import Spaceport30 from './Spaceport30';
import Spaceport35 from './Spaceport35';
import Spaceport40 from './Spaceport40';
import Spaceport45 from './Spaceport45';
import Spaceport50 from './Spaceport50';
import Spaceport55 from './Spaceport55';
import Spaceport60 from './Spaceport60';
import Spaceport65 from './Spaceport65';
import Spaceport70 from './Spaceport70';
import Spaceport75 from './Spaceport75';
import Spaceport80 from './Spaceport80';
import Spaceport85 from './Spaceport85';
import Spaceport90 from './Spaceport90';
import Spaceport95 from './Spaceport95';
import Spaceport100 from './Spaceport100';

export default {
  id: 'Quest/Regular/Tamily/Spaceport',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Residential/House', 20],
  ],
  finalText: 'Поздравляем! Космопорт достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    Spaceport15,
    Spaceport20,
    Spaceport25,
    Spaceport30,
    Spaceport35,
    Spaceport40,
    Spaceport45,
    Spaceport50,
    Spaceport55,
    Spaceport60,
    Spaceport65,
    Spaceport70,
    Spaceport75,
    Spaceport80,
    Spaceport85,
    Spaceport90,
    Spaceport95,
    Spaceport100,
  ],
};
