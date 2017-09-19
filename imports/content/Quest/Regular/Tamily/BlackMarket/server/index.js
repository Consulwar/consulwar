import BlackMarket1 from './BlackMarket1';
import BlackMarket5 from './BlackMarket5';
import BlackMarket10 from './BlackMarket10';
import BlackMarket15 from './BlackMarket15';
import BlackMarket20 from './BlackMarket20';
import BlackMarket25 from './BlackMarket25';
import BlackMarket30 from './BlackMarket30';
import BlackMarket35 from './BlackMarket35';
import BlackMarket40 from './BlackMarket40';
import BlackMarket45 from './BlackMarket45';
import BlackMarket50 from './BlackMarket50';
import BlackMarket55 from './BlackMarket55';
import BlackMarket60 from './BlackMarket60';
import BlackMarket65 from './BlackMarket65';
import BlackMarket70 from './BlackMarket70';
import BlackMarket75 from './BlackMarket75';
import BlackMarket80 from './BlackMarket80';
import BlackMarket85 from './BlackMarket85';
import BlackMarket90 from './BlackMarket90';
import BlackMarket95 from './BlackMarket95';
import BlackMarket100 from './BlackMarket100';

export default {
  id: 'Quest/Regular/Tamily/BlackMarket',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Residential/Political', 25],
  ],
  finalText: 'Поздравляем! Чёрный Рынок достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    BlackMarket1,
    BlackMarket5,
    BlackMarket10,
    BlackMarket15,
    BlackMarket20,
    BlackMarket25,
    BlackMarket30,
    BlackMarket35,
    BlackMarket40,
    BlackMarket45,
    BlackMarket50,
    BlackMarket55,
    BlackMarket60,
    BlackMarket65,
    BlackMarket70,
    BlackMarket75,
    BlackMarket80,
    BlackMarket85,
    BlackMarket90,
    BlackMarket95,
    BlackMarket100,
  ],
};
