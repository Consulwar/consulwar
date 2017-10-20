import {
  calcAngle,
  calcDistance,
  calcMaxSpeed,
  calcAcceleration,
  calcDistanceByTime,
  calcTimeByDistance,
  calcFlyTime,
} from './utils';

export default function (attackerPlanet, attackerEngineLevel, targetShip, timeCurrent) {
  const angle = calcAngle(
    targetShip.data.startPosition,
    targetShip.data.targetPosition,
  );
  const totalDistance = calcDistance(
    targetShip.data.startPosition,
    targetShip.data.targetPosition,
  );

  const startPoint = {
    x: targetShip.data.startPosition.x,
    y: targetShip.data.startPosition.y,
  };

  const targetShipTime = timeCurrent - targetShip.created;
  const targetShipSpeed = calcMaxSpeed(targetShip.data.engineLevel);
  const targetShipAcc = calcAcceleration(targetShip.data.engineLevel);

  const targetDistance = calcDistanceByTime(
    targetShipTime,
    totalDistance,
    targetShipSpeed,
    targetShipAcc,
  );

  const check = function (distance) {
    // target time
    const timeToPoint = calcTimeByDistance(
      distance,
      totalDistance,
      targetShipSpeed,
      targetShipAcc,
    );

    const timeLeft = timeToPoint - targetShipTime;

    // attack time
    const attackPoint = {
      x: startPoint.x + (distance * Math.cos(angle)),
      y: startPoint.y + (distance * Math.sin(angle)),
    };

    const timeAttack = calcFlyTime(attackerPlanet, attackPoint, attackerEngineLevel);

    // check
    if (timeAttack >= timeLeft) {
      return null;
    }

    return timeAttack;
  };

  if (targetDistance >= totalDistance - 0.1) {
    return null;
  }

  if (!check(totalDistance - 0.1)) {
    return null;
  }

  let left = targetDistance;
  let right = totalDistance - 0.1;
  let resultDistance = totalDistance - 0.1;

  while (Math.abs(right - left) >= 0.05) {
    const cur = left + ((right - left) / 2);
    const checkResult = check(cur);

    if (checkResult) {
      right = cur;
      resultDistance = cur;
    } else {
      left = cur;
    }
  }

  return {
    k: resultDistance / totalDistance,
    time: check(resultDistance),
  };
}
