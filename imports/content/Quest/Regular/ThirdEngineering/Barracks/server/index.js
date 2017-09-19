import Barracks10 from './Barracks10';
import Barracks15 from './Barracks15';
import Barracks20 from './Barracks20';
import Barracks25 from './Barracks25';
import Barracks30 from './Barracks30';
import Barracks35 from './Barracks35';
import Barracks40 from './Barracks40';
import Barracks45 from './Barracks45';
import Barracks50 from './Barracks50';
import Barracks55 from './Barracks55';
import Barracks60 from './Barracks60';
import Barracks65 from './Barracks65';
import Barracks70 from './Barracks70';
import Barracks75 from './Barracks75';
import Barracks80 from './Barracks80';
import Barracks85 from './Barracks85';
import Barracks90 from './Barracks90';
import Barracks95 from './Barracks95';
import Barracks100 from './Barracks100';

export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Military/PowerStation', 10],
  ],
  finalText: 'Поздравляем! Казармы достигли максимального уровня. Слава Великому Консулу!',
  quests: [
    Barracks10,
    Barracks15,
    Barracks20,
    Barracks25,
    Barracks30,
    Barracks35,
    Barracks40,
    Barracks45,
    Barracks50,
    Barracks55,
    Barracks60,
    Barracks65,
    Barracks70,
    Barracks75,
    Barracks80,
    Barracks85,
    Barracks90,
    Barracks95,
    Barracks100,
  ],
};
