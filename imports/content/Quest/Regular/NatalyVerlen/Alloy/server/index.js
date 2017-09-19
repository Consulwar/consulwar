import Alloy15 from './Alloy15';
import Alloy20 from './Alloy20';
import Alloy25 from './Alloy25';
import Alloy30 from './Alloy30';
import Alloy35 from './Alloy35';
import Alloy40 from './Alloy40';
import Alloy45 from './Alloy45';
import Alloy50 from './Alloy50';
import Alloy55 from './Alloy55';
import Alloy60 from './Alloy60';
import Alloy65 from './Alloy65';
import Alloy70 from './Alloy70';
import Alloy75 from './Alloy75';
import Alloy80 from './Alloy80';
import Alloy85 from './Alloy85';
import Alloy90 from './Alloy90';
import Alloy95 from './Alloy95';
import Alloy100 from './Alloy100';

export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Military/Laboratory', 15],
  ],
  finalText: 'Особые Сплавы достигли своего максимума, и Лаборатории больше нечего исследовать в этой области науки. Мои поздравления, Консул.',
  quests: [
    Alloy15,
    Alloy20,
    Alloy25,
    Alloy30,
    Alloy35,
    Alloy40,
    Alloy45,
    Alloy50,
    Alloy55,
    Alloy60,
    Alloy65,
    Alloy70,
    Alloy75,
    Alloy80,
    Alloy85,
    Alloy90,
    Alloy95,
    Alloy100,
  ],
};
