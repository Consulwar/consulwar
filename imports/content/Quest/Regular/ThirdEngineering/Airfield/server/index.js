import Airfield10 from './Airfield10';
import Airfield15 from './Airfield15';
import Airfield20 from './Airfield20';
import Airfield25 from './Airfield25';
import Airfield30 from './Airfield30';
import Airfield35 from './Airfield35';
import Airfield40 from './Airfield40';
import Airfield45 from './Airfield45';
import Airfield50 from './Airfield50';
import Airfield55 from './Airfield55';
import Airfield60 from './Airfield60';
import Airfield65 from './Airfield65';
import Airfield70 from './Airfield70';
import Airfield75 from './Airfield75';
import Airfield80 from './Airfield80';
import Airfield85 from './Airfield85';
import Airfield90 from './Airfield90';
import Airfield95 from './Airfield95';
import Airfield100 from './Airfield100';

export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield',
  condition: [
    ['Building/Residential/Crystal', 28],
    ['Building/Military/PowerStation', 27],
    ['Building/Military/Airfield', 20],
  ],
  finalText: 'Поздравляем! Аэродром достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    Airfield10,
    Airfield15,
    Airfield20,
    Airfield25,
    Airfield30,
    Airfield35,
    Airfield40,
    Airfield45,
    Airfield50,
    Airfield55,
    Airfield60,
    Airfield65,
    Airfield70,
    Airfield75,
    Airfield80,
    Airfield85,
    Airfield90,
    Airfield95,
    Airfield100,
  ],
};
