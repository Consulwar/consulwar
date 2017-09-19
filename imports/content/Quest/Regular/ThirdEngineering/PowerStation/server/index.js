import PowerStation30 from './PowerStation30';
import PowerStation35 from './PowerStation35';
import PowerStation40 from './PowerStation40';
import PowerStation45 from './PowerStation45';
import PowerStation50 from './PowerStation50';
import PowerStation55 from './PowerStation55';
import PowerStation60 from './PowerStation60';
import PowerStation65 from './PowerStation65';
import PowerStation70 from './PowerStation70';
import PowerStation75 from './PowerStation75';
import PowerStation80 from './PowerStation80';
import PowerStation85 from './PowerStation85';
import PowerStation90 from './PowerStation90';
import PowerStation95 from './PowerStation95';
import PowerStation100 from './PowerStation100';

export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Building/Residential/House', 20],
  ],
  finalText: 'Поздравляем! Электростанция достигла максимального уровня. Слава Великому Консулу!',
  quests: [
    PowerStation30,
    PowerStation35,
    PowerStation40,
    PowerStation45,
    PowerStation50,
    PowerStation55,
    PowerStation60,
    PowerStation65,
    PowerStation70,
    PowerStation75,
    PowerStation80,
    PowerStation85,
    PowerStation90,
    PowerStation95,
    PowerStation100,
  ],
};
