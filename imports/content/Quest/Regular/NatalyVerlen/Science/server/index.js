import Science10 from './Science10';
import Science15 from './Science15';
import Science20 from './Science20';
import Science25 from './Science25';
import Science30 from './Science30';
import Science35 from './Science35';
import Science40 from './Science40';
import Science45 from './Science45';
import Science50 from './Science50';
import Science55 from './Science55';
import Science60 from './Science60';
import Science65 from './Science65';
import Science70 from './Science70';
import Science75 from './Science75';
import Science80 from './Science80';
import Science85 from './Science85';
import Science90 from './Science90';
import Science95 from './Science95';
import Science100 from './Science100';

export default {
  id: 'Quest/Regular/NatalyVerlen/Science',
  condition: [
    ['Building/Military/Laboratory', 15],
    ['Research/Evolution/Science', 15],
  ],
  finalText: 'Научный Отдел достиг своего максимума, и Лаборатории больше нечего исследовать в этой области науки. Мои поздравления, Консул.',
  quests: [
    Science10,
    Science15,
    Science20,
    Science25,
    Science30,
    Science35,
    Science40,
    Science45,
    Science50,
    Science55,
    Science60,
    Science65,
    Science70,
    Science75,
    Science80,
    Science85,
    Science90,
    Science95,
    Science100,
  ],
};
