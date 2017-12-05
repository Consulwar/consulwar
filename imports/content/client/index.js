import achievements from '../Achievement/lib';
import buildings from '../Building/client';
import containers from '../Container/client';
import houseItems from '../House/client';
import persons from '../Person/client';
import researches from '../Research/client';
import resources from '../Resource/client';
import units from '../Unit/client';

export default {
  ...achievements,
  ...buildings,
  ...containers,
  ...houseItems,
  ...persons,
  ...researches,
  ...resources,
  ...units,
};
