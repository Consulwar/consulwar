import Shipyard10 from './Shipyard10';
import Shipyard15 from './Shipyard15';
import Shipyard20 from './Shipyard20';
import Shipyard25 from './Shipyard25';
import Shipyard30 from './Shipyard30';
import Shipyard35 from './Shipyard35';
import Shipyard40 from './Shipyard40';
import Shipyard45 from './Shipyard45';
import Shipyard50 from './Shipyard50';
import Shipyard55 from './Shipyard55';
import Shipyard60 from './Shipyard60';
import Shipyard65 from './Shipyard65';
import Shipyard70 from './Shipyard70';
import Shipyard75 from './Shipyard75';
import Shipyard80 from './Shipyard80';
import Shipyard85 from './Shipyard85';
import Shipyard90 from './Shipyard90';
import Shipyard95 from './Shipyard95';
import Shipyard100 from './Shipyard100';

export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Military/PowerStation', 25],
  ],
  finalText: 'Поздравляем! Верфь достигла максимального уровня. Слава Великому Консулу!',
  quests: [
    Shipyard10,
    Shipyard15,
    Shipyard20,
    Shipyard25,
    Shipyard30,
    Shipyard35,
    Shipyard40,
    Shipyard45,
    Shipyard50,
    Shipyard55,
    Shipyard60,
    Shipyard65,
    Shipyard70,
    Shipyard75,
    Shipyard80,
    Shipyard85,
    Shipyard90,
    Shipyard95,
    Shipyard100,
  ],
};
