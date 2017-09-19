import TradingPort1 from './TradingPort1';
import TradingPort5 from './TradingPort5';
import TradingPort10 from './TradingPort10';
import TradingPort15 from './TradingPort15';
import TradingPort20 from './TradingPort20';
import TradingPort25 from './TradingPort25';
import TradingPort30 from './TradingPort30';
import TradingPort35 from './TradingPort35';
import TradingPort40 from './TradingPort40';
import TradingPort45 from './TradingPort45';
import TradingPort50 from './TradingPort50';
import TradingPort55 from './TradingPort55';
import TradingPort60 from './TradingPort60';
import TradingPort65 from './TradingPort65';
import TradingPort70 from './TradingPort70';
import TradingPort75 from './TradingPort75';
import TradingPort80 from './TradingPort80';
import TradingPort85 from './TradingPort85';
import TradingPort90 from './TradingPort90';
import TradingPort95 from './TradingPort95';
import TradingPort100 from './TradingPort100';

export default {
  id: 'Quest/Regular/Tamily/TradingPort',
  condition: [
    ['Quest/Regular/Tamily/Tutorial', true],
    ['Research/Evolution/Alloy', 20],
  ],
  finalText: 'Поздравляем! Торговый Порт достиг максимального уровня. Слава Великому Консулу!',
  quests: [
    TradingPort1,
    TradingPort5,
    TradingPort10,
    TradingPort15,
    TradingPort20,
    TradingPort25,
    TradingPort30,
    TradingPort35,
    TradingPort40,
    TradingPort45,
    TradingPort50,
    TradingPort55,
    TradingPort60,
    TradingPort65,
    TradingPort70,
    TradingPort75,
    TradingPort80,
    TradingPort85,
    TradingPort90,
    TradingPort95,
    TradingPort100,
  ],
};
