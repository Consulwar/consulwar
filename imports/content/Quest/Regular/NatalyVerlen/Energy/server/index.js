import Energy15 from './Energy15';
import Energy20 from './Energy20';
import Energy25 from './Energy25';
import Energy30 from './Energy30';
import Energy35 from './Energy35';
import Energy40 from './Energy40';
import Energy45 from './Energy45';
import Energy50 from './Energy50';
import Energy55 from './Energy55';
import Energy60 from './Energy60';
import Energy65 from './Energy65';
import Energy70 from './Energy70';
import Energy75 from './Energy75';
import Energy80 from './Energy80';
import Energy85 from './Energy85';
import Energy90 from './Energy90';
import Energy95 from './Energy95';
import Energy100 from './Energy100';

export default {
  id: 'Quest/Regular/NatalyVerlen/Energy',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Military/Laboratory', 5],
  ],
  finalText: 'Энергетика достигла своего максимума, и Лаборатории больше нечего исследовать в этой области науки. Мои поздравления, Консул.',
  quests: [
    Energy15,
    Energy20,
    Energy25,
    Energy30,
    Energy35,
    Energy40,
    Energy45,
    Energy50,
    Energy55,
    Energy60,
    Energy65,
    Energy70,
    Energy75,
    Energy80,
    Energy85,
    Energy90,
    Energy95,
    Energy100,
  ],
};
