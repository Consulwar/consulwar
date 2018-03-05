import Laboratory25 from './Laboratory25';
import Laboratory30 from './Laboratory30';
import Laboratory35 from './Laboratory35';
import Laboratory40 from './Laboratory40';
import Laboratory45 from './Laboratory45';
import Laboratory50 from './Laboratory50';
import Laboratory55 from './Laboratory55';
import Laboratory60 from './Laboratory60';
import Laboratory65 from './Laboratory65';
import Laboratory70 from './Laboratory70';
import Laboratory75 from './Laboratory75';
import Laboratory80 from './Laboratory80';
import Laboratory85 from './Laboratory85';
import Laboratory90 from './Laboratory90';
import Laboratory95 from './Laboratory95';
import Laboratory100 from './Laboratory100';

export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Residential/SpacePort', 1],
    ['Building/Military/PowerStation', 15],
  ],
  finalText: 'Поздравляем! Врата достигли максимального уровня. Слава Великому Консулу!',
  quests: [
    Laboratory25,
    Laboratory30,
    Laboratory35,
    Laboratory40,
    Laboratory45,
    Laboratory50,
    Laboratory55,
    Laboratory60,
    Laboratory65,
    Laboratory70,
    Laboratory75,
    Laboratory80,
    Laboratory85,
    Laboratory90,
    Laboratory95,
    Laboratory100,
  ],
};
