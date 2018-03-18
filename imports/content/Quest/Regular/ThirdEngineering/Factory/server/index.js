import Factory10 from './Factory10';
import Factory15 from './Factory15';
import Factory20 from './Factory20';
import Factory25 from './Factory25';
import Factory30 from './Factory30';
import Factory35 from './Factory35';
import Factory40 from './Factory40';
import Factory45 from './Factory45';
import Factory50 from './Factory50';
import Factory55 from './Factory55';
import Factory60 from './Factory60';
import Factory65 from './Factory65';
import Factory70 from './Factory70';
import Factory75 from './Factory75';
import Factory80 from './Factory80';
import Factory85 from './Factory85';
import Factory90 from './Factory90';
import Factory95 from './Factory95';
import Factory100 from './Factory100';

export default {
  id: 'Quest/Regular/ThirdEngineering/Factory',
  condition: [
    ['Building/Residential/Metal', 28],
    ['Building/Military/PowerStation', 22],
    ['Building/Military/Factory', 20],
  ],
  finalText: 'Поздравляем! Военный Завод достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    Factory10,
    Factory15,
    Factory20,
    Factory25,
    Factory30,
    Factory35,
    Factory40,
    Factory45,
    Factory50,
    Factory55,
    Factory60,
    Factory65,
    Factory70,
    Factory75,
    Factory80,
    Factory85,
    Factory90,
    Factory95,
    Factory100,
  ],
};
