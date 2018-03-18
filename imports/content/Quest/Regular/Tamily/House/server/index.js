import House30 from './House30';
import House35 from './House35';
import House40 from './House40';
import House45 from './House45';
import House50 from './House50';
import House55 from './House55';
import House60 from './House60';
import House65 from './House65';
import House70 from './House70';
import House75 from './House75';
import House80 from './House80';
import House85 from './House85';
import House90 from './House90';
import House95 from './House95';
import House100 from './House100';

export default {
  id: 'Quest/Regular/Tamily/House',
  condition: [
    ['Building/Residential/House', 20],
    ['Research/Evolution/Alloy', 10],
  ],
  finalText: 'Поздравляем! Жилые Комплексы достигли максимального уровня. Слава Великому Консулу!',
  quests: [
    House30,
    House35,
    House40,
    House45,
    House50,
    House55,
    House60,
    House65,
    House70,
    House75,
    House80,
    House85,
    House90,
    House95,
    House100,
  ],
};
