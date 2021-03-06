import Drill25 from './Drill25';
import Drill30 from './Drill30';
import Drill35 from './Drill35';
import Drill40 from './Drill40';
import Drill45 from './Drill45';
import Drill50 from './Drill50';
import Drill55 from './Drill55';
import Drill60 from './Drill60';
import Drill65 from './Drill65';
import Drill70 from './Drill70';
import Drill75 from './Drill75';
import Drill80 from './Drill80';
import Drill85 from './Drill85';
import Drill90 from './Drill90';
import Drill95 from './Drill95';
import Drill100 from './Drill100';

export default {
  id: 'Quest/Regular/NatalyVerlen/Drill',
  condition: [
    ['Building/Military/Laboratory', 13],
    ['Building/Residential/Metal', 15],
    ['Research/Evolution/Drill', 20],
  ],
  finalText: 'Бурильный Бур достиг своего максимума, и Лаборатории больше нечего исследовать в этой области науки. Мои поздравления, Консул.',
  quests: [
    Drill25,
    Drill30,
    Drill35,
    Drill40,
    Drill45,
    Drill50,
    Drill55,
    Drill60,
    Drill65,
    Drill70,
    Drill75,
    Drill80,
    Drill85,
    Drill90,
    Drill95,
    Drill100,
  ],
};
