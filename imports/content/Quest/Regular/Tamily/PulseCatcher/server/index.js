import PulseCatcher1 from './PulseCatcher1';
import PulseCatcher5 from './PulseCatcher5';
import PulseCatcher10 from './PulseCatcher10';
import PulseCatcher15 from './PulseCatcher15';
import PulseCatcher20 from './PulseCatcher20';
import PulseCatcher25 from './PulseCatcher25';
import PulseCatcher30 from './PulseCatcher30';
import PulseCatcher35 from './PulseCatcher35';
import PulseCatcher40 from './PulseCatcher40';
import PulseCatcher45 from './PulseCatcher45';
import PulseCatcher50 from './PulseCatcher50';
import PulseCatcher55 from './PulseCatcher55';
import PulseCatcher60 from './PulseCatcher60';
import PulseCatcher65 from './PulseCatcher65';
import PulseCatcher70 from './PulseCatcher70';
import PulseCatcher75 from './PulseCatcher75';
import PulseCatcher80 from './PulseCatcher80';
import PulseCatcher85 from './PulseCatcher85';
import PulseCatcher90 from './PulseCatcher90';
import PulseCatcher95 from './PulseCatcher95';
import PulseCatcher100 from './PulseCatcher100';

export default {
  id: 'Quest/Regular/Tamily/PulseCatcher',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Research/Evolution/Science', 20],
  ],
  finalText: 'Поздравляем! Импульсный Уловитель достиг максимального уровня. Он ещё послужит величию вашей колонии, вот увидите!',
  quests: [
    PulseCatcher1,
    PulseCatcher5,
    PulseCatcher10,
    PulseCatcher15,
    PulseCatcher20,
    PulseCatcher25,
    PulseCatcher30,
    PulseCatcher35,
    PulseCatcher40,
    PulseCatcher45,
    PulseCatcher50,
    PulseCatcher55,
    PulseCatcher60,
    PulseCatcher65,
    PulseCatcher70,
    PulseCatcher75,
    PulseCatcher80,
    PulseCatcher85,
    PulseCatcher90,
    PulseCatcher95,
    PulseCatcher100,
  ],
};
