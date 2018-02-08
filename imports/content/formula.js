import { Meteor } from 'meteor/meteor';

const reduceSpeed = Meteor.settings.public.reduceBuildingSpeed || 1;


const every10x2 = level => (
  (
    level
    + (level >= 10 ? (Math.ceil(2 ** (Math.floor(level / 10) - 1)) * 100) : 0)
  ) / reduceSpeed
);

// 1.62658 ^ 4 = 700
const tier1 = level => (
  (
    level
    + (level >= 20 ? (Math.ceil(1.62658 ** (Math.floor(level / 20) - 1)) * 100) : 0)
  ) / reduceSpeed
);

// 1.31607 ^ 4 = 300
const tier2 = level => (
  (
    level
    + (level >= 20 ? (Math.ceil(1.31607 ** (Math.floor(level / 20) - 1)) * 100) : 0)
  ) / reduceSpeed
);

// 1.10668 ^ 4 = 150
const tier3 = level => (
  (
    (level * 0.5)
    + (level >= 20 ? (Math.ceil(1.10668 ** (Math.floor(level / 20) - 1)) * 100) : 0)
  ) / reduceSpeed
);

const artifact = {
  progress: [
    'Resource/Artifact/White/MeteorFragments',
    'Resource/Artifact/Green/RotaryAmplifier',
    'Resource/Artifact/Blue/Chip',
    'Resource/Artifact/Purple/Nicolascagium',
    'Resource/Artifact/Orange/AncientKnowledge',
  ],
  fleet: [
    'Resource/Artifact/White/CrystalFragments',
    'Resource/Artifact/Green/RotaryAmplifier',
    'Resource/Artifact/Blue/QuadCooler',
    'Resource/Artifact/Purple/Jimcarrium',
    'Resource/Artifact/Orange/AncientTechnology',
  ],
  infantry: [
    'Resource/Artifact/White/WeaponParts',
    'Resource/Artifact/Green/ReptileTechnology',
    'Resource/Artifact/Blue/QuadCooler',
    'Resource/Artifact/Purple/Garyoldmanium',
    'Resource/Artifact/Orange/AncientTechnology',
  ],
  enginery: [
    'Resource/Artifact/White/MeteorFragments',
    'Resource/Artifact/Green/SecretTechnology',
    'Resource/Artifact/Blue/NanoWires',
    'Resource/Artifact/Purple/Nicolascagium',
    'Resource/Artifact/Orange/AncientArtifact',
  ],
  aviation: [
    'Resource/Artifact/White/ShipDetails',
    'Resource/Artifact/Green/Batteries',
    'Resource/Artifact/Blue/PlasmaTransistors',
    'Resource/Artifact/Purple/Jimcarrium',
    'Resource/Artifact/Orange/AncientScheme',
  ],
  special: [
    'Resource/Artifact/White/CrystalFragments',
    'Resource/Artifact/Green/SecretTechnology',
    'Resource/Artifact/Blue/PlasmaTransistors',
    'Resource/Artifact/Purple/Garyoldmanium',
    'Resource/Artifact/Orange/AncientKnowledge',
  ],
  politic: [
    'Resource/Artifact/White/ShipDetails',
    'Resource/Artifact/Green/ReptileTechnology',
    'Resource/Artifact/Blue/NanoWires',
    'Resource/Artifact/Purple/Keanureevesium',
    'Resource/Artifact/Orange/AncientScheme',
  ],
};

const priceT1 = function(level, group) {
  const price = {};

  if (this.basePrice.humans) {
    price.humans = [this.basePrice.humans, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.metals) {
    price.metals = [this.basePrice.metals, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.crystals) {
    price.crystals = [this.basePrice.crystals, 'slowExponentialGrow', 0];
  }

  if (level > 19 && this.basePrice.honor) {
    price.honor = [this.basePrice.honor, 'slowExponentialGrow', 20];
  }

  if (level < 40) {
    // no changes
  } else if (level < 60) {
    price[artifact[group][0]] = [3, 'slowLinearGrow', 40];
  } else if (level < 80) {
    price[artifact[group][1]] = [4, 'slowLinearGrow', 60];
  } else {
    price[artifact[group][2]] = [5, 'slowLinearGrow', 80];
  }
  return price;
};

const priceT2 = function(level, group) {
  const price = {};

  if (this.basePrice.humans) {
    price.humans = [this.basePrice.humans, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.metals) {
    price.metals = [this.basePrice.metals, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.crystals) {
    price.crystals = [this.basePrice.crystals, 'slowExponentialGrow', 0];
  }

  if (level > 19 && this.basePrice.honor) {
    price.honor = [this.basePrice.honor, 'slowExponentialGrow', 20];
  }

  if (level < 40) {
    // no changes
  } else if (level < 52) {
    price[artifact[group][0]] = [2, 'slowLinearGrow', 40];
  } else if (level < 65) {
    price[artifact[group][1]] = [3, 'slowLinearGrow', 52];
  } else if (level < 78) {
    price[artifact[group][2]] = [4, 'slowLinearGrow', 65];
  } else if (level < 90) {
    price[artifact[group][3]] = [5, 'slowLinearGrow', 78];
  } else {
    price[artifact[group][4]] = [6, 'slowLinearGrow', 90];
  }
  return price;
};

const priceT3 = function(level, group) {
  const price = {};

  if (this.basePrice.humans) {
    price.humans = [this.basePrice.humans, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.metals) {
    price.metals = [this.basePrice.metals, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.crystals) {
    price.crystals = [this.basePrice.crystals, 'slowExponentialGrow', 0];
  }

  if (this.basePrice.honor) {
    price.honor = [this.basePrice.honor, 'slowExponentialGrow', 0];
  }

  if (level < 20) {
    // no changes
  } else if (level < 38) {
    price[artifact[group][0]] = [2, 'slowLinearGrow', 20];
  } else if (level < 55) {
    price[artifact[group][1]] = [3, 'slowLinearGrow', 38];
  } else if (level < 70) {
    price[artifact[group][2]] = [4, 'slowLinearGrow', 55];
  } else if (level < 85) {
    price[artifact[group][3]] = [5, 'slowLinearGrow', 70];
  } else {
    price[artifact[group][4]] = [6, 'slowLinearGrow', 85];
  }
  return price;
};

const priceT4 = function(level, group) {
  const price = {};

  if (this.basePrice.humans) {
    price.humans = [this.basePrice.humans, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.metals) {
    price.metals = [this.basePrice.metals, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.crystals) {
    price.crystals = [this.basePrice.crystals, 'slowExponentialGrow', 0];
  }
  if (this.basePrice.honor) {
    price.honor = [this.basePrice.honor, 'slowExponentialGrow', 0];
  }

  if (level < 20) {
    price[artifact[group][0]] = [3, 'slowLinearGrow', 0];
  } else if (level < 40) {
    price[artifact[group][1]] = [4, 'slowLinearGrow', 20];
  } else if (level < 60) {
    price[artifact[group][2]] = [5, 'slowLinearGrow', 40];
  } else if (level < 80) {
    price[artifact[group][3]] = [6, 'slowLinearGrow', 60];
  } else {
    price[artifact[group][4]] = [7, 'slowLinearGrow', 80];
  }
  return price;
};

export {
  every10x2,
  tier1,
  tier2,
  tier3,
  priceT1,
  priceT2,
  priceT3,
  priceT4,
};
