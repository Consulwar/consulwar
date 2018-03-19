import DefenseComplex1 from './DefenseComplex1';
import DefenseComplex5 from './DefenseComplex5';
import DefenseComplex10 from './DefenseComplex10';
import DefenseComplex15 from './DefenseComplex15';
import DefenseComplex20 from './DefenseComplex20';
import DefenseComplex25 from './DefenseComplex25';
import DefenseComplex30 from './DefenseComplex30';
import DefenseComplex35 from './DefenseComplex35';
import DefenseComplex40 from './DefenseComplex40';
import DefenseComplex45 from './DefenseComplex45';
import DefenseComplex50 from './DefenseComplex50';
import DefenseComplex55 from './DefenseComplex55';
import DefenseComplex60 from './DefenseComplex60';
import DefenseComplex65 from './DefenseComplex65';
import DefenseComplex70 from './DefenseComplex70';
import DefenseComplex75 from './DefenseComplex75';
import DefenseComplex80 from './DefenseComplex80';
import DefenseComplex85 from './DefenseComplex85';
import DefenseComplex90 from './DefenseComplex90';
import DefenseComplex95 from './DefenseComplex95';
import DefenseComplex100 from './DefenseComplex100';

export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex',
  condition: [
    ['Building/Military/PowerStation', 20],
  ],
  finalText: 'Поздравляем! Оборонный комплекс достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    DefenseComplex1,
    DefenseComplex5,
    DefenseComplex10,
    DefenseComplex15,
    DefenseComplex20,
    DefenseComplex25,
    DefenseComplex30,
    DefenseComplex35,
    DefenseComplex40,
    DefenseComplex45,
    DefenseComplex50,
    DefenseComplex55,
    DefenseComplex60,
    DefenseComplex65,
    DefenseComplex70,
    DefenseComplex75,
    DefenseComplex80,
    DefenseComplex85,
    DefenseComplex90,
    DefenseComplex95,
    DefenseComplex100,
  ],
};
