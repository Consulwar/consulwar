import achievements from '../Achievement/lib';
import buildings from '../Building/server';
import containers from '../Container/server';
import houseItems from '../House/server';
import persons from '../Person/server';
import quests from '../Quest/server';
import researches from '../Research/server';
import resources from '../Resource/server';
import units from '../Unit/server';

export default {
  ...achievements,
  ...buildings,
  ...containers,
  ...houseItems,
  ...persons,
  ...quests,
  ...researches,
  ...resources,
  ...units,
};
