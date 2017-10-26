import Game from '/moduls/game/lib/main.game';

const calcSegmentCenter = function(
  hand,
  segment,
  maxHands,
  maxSegments,
  rotationFactor,
  maxRadius,
  galacticAngle,
) {
  // central sector
  if (segment === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  // hand segment
  const distance = (maxRadius * (segment + 0.5)) / maxSegments;
  const angle = galacticAngle + (hand * ((Math.PI * 2) / maxHands)) +
    (distance * rotationFactor);

  return {
    x: distance * Math.cos(angle),
    y: distance * Math.sin(angle),
  };
};

const calcSegmentPlanetsAmount = function(
  hand,
  segment,
  maxHands,
  maxSegments,
  minPlanets,
  maxPlanets,
) {
  const kCenter = 0.1; // center = 10% of all planets
  const kHand = (1 - kCenter) / maxHands;

  let min = 0;
  let max = 0;

  if (segment === 0) {
    min = minPlanets * kCenter;
    max = maxPlanets * kCenter;
  } else {
    const k = ((maxSegments + 1) - segment) / maxSegments;
    min = ((minPlanets * kHand) / (maxSegments + 1)) * 2 * k;
    max = ((maxPlanets * kHand) / (maxSegments + 1)) * 2 * k;
  }

  const amount = Game.Random.interval(min, max);
  return (amount >= 1) ? amount : 0;
};

const calcSegmentRandomPoints = function(
  pointsAmount,
  hand,
  segment,
  maxHands,
  maxSegments,
  rotationFactor,
  narrowFactor,
  maxRadius,
  galacticAngle,
) {
  const result = [];
  let angle = 0;
  let distance = 0;

  // central sector
  if (segment <= 0) {
    const radius = (maxRadius / maxSegments) * 0.9;

    let amount = pointsAmount;
    while (amount > 0) {
      distance = Game.Random.random() * radius;
      angle = Game.Random.random() * Math.PI * 2;

      result.push({
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle),
      });

      amount -= 1;
    }

    return result;
  }

  // hand segment
  const handAngle = (Math.PI * 2) / maxHands;
  const handAngleOffset = handAngle * 2;
  const startAngle = (hand * handAngle) + galacticAngle;

  let startDistance = (maxRadius * segment) / maxSegments;
  let endDistance = (maxRadius * (segment + 1)) / maxSegments;

  const delta = endDistance - startDistance;
  startDistance += delta * 0.2;
  endDistance -= delta * 0.2;

  let amount = pointsAmount;
  while (amount > 0) {
    distance = startDistance + (Game.Random.random() * (endDistance - startDistance));

    const rotation = distance * rotationFactor;

    let offset = (Game.Random.random() * handAngleOffset) - (handAngleOffset / 2);
    offset *= narrowFactor / distance;
    if (offset < 0) {
      offset = (offset ** 2) * -1;
    } else {
      offset **= 2;
    }

    if (Math.abs(offset) >= handAngle / 2) {
      offset = (Game.Random.random() * (handAngle * 0.8)) - ((handAngle * 0.8) / 2);
    }

    angle = startAngle + offset + rotation;

    result.push({
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
    });

    amount -= 1;
  }

  return result;
};

export default {
  calcSegmentCenter,
  calcSegmentPlanetsAmount,
  calcSegmentRandomPoints,
};
