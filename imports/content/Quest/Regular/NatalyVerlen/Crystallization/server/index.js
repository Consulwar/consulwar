import Crystallization5 from './Crystallization5';
import Crystallization10 from './Crystallization10';
import Crystallization15 from './Crystallization15';
import Crystallization20 from './Crystallization20';
import Crystallization25 from './Crystallization25';
import Crystallization30 from './Crystallization30';
import Crystallization35 from './Crystallization35';
import Crystallization40 from './Crystallization40';
import Crystallization45 from './Crystallization45';
import Crystallization50 from './Crystallization50';
import Crystallization55 from './Crystallization55';
import Crystallization60 from './Crystallization60';
import Crystallization65 from './Crystallization65';
import Crystallization70 from './Crystallization70';
import Crystallization75 from './Crystallization75';
import Crystallization80 from './Crystallization80';
import Crystallization85 from './Crystallization85';
import Crystallization90 from './Crystallization90';
import Crystallization95 from './Crystallization95';
import Crystallization100 from './Crystallization100';

export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization',
  condition: [
    ['Building/Military/Laboratory', 16],
    ['Building/Residential/Crystal', 15],
    ['Research/Evolution/Crystallization', 25],
  ],
  finalText: 'Кристаллизация достигла своего максимума, и Лаборатории больше нечего исследовать в этой области науки. Мои поздравления, Консул.',
  quests: [
    Crystallization5,
    Crystallization10,
    Crystallization15,
    Crystallization20,
    Crystallization25,
    Crystallization30,
    Crystallization35,
    Crystallization40,
    Crystallization45,
    Crystallization50,
    Crystallization55,
    Crystallization60,
    Crystallization65,
    Crystallization70,
    Crystallization75,
    Crystallization80,
    Crystallization85,
    Crystallization90,
    Crystallization95,
    Crystallization100,
  ],
};
