import { Meteor } from 'meteor/meteor';

const reduceSpeed = Meteor.settings.public.reduceBuildingSpeed || 1;

const tier1 = level => (
  (
    level
    + (level >= 20 ? (Math.ceil(1.6265 ** (Math.floor(level / 20) - 1)) * 100) : 0)
  ) / reduceSpeed
);

const tier2 = level => (level * 4) / reduceSpeed;

const tier3 = level => (level * 2) / reduceSpeed;

export {
  tier1,
  tier2,
  tier3,
};
