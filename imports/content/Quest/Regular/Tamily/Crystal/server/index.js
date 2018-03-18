import Crystal25 from './Crystal25';
import Crystal30 from './Crystal30';
import Crystal35 from './Crystal35';
import Crystal40 from './Crystal40';
import Crystal45 from './Crystal45';
import Crystal50 from './Crystal50';
import Crystal55 from './Crystal55';
import Crystal60 from './Crystal60';
import Crystal65 from './Crystal65';
import Crystal70 from './Crystal70';
import Crystal75 from './Crystal75';
import Crystal80 from './Crystal80';
import Crystal85 from './Crystal85';
import Crystal90 from './Crystal90';
import Crystal95 from './Crystal95';
import Crystal100 from './Crystal100';

export default {
  id: 'Quest/Regular/Tamily/Crystal',
  condition: [
    ['Building/Residential/Crystal', 24],
    ['Research/Evolution/Energy', 14],
    ['Research/Evolution/Crystallization', 25],
  ],
  finalText: 'Поздравляем! Шахта Кристалла достигла максимального уровня. Слава Великому Консулу!',
  quests: [
    Crystal25,
    Crystal30,
    Crystal35,
    Crystal40,
    Crystal45,
    Crystal50,
    Crystal55,
    Crystal60,
    Crystal65,
    Crystal70,
    Crystal75,
    Crystal80,
    Crystal85,
    Crystal90,
    Crystal95,
    Crystal100,
  ],
};
