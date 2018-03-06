import Game from '/moduls/game/lib/main.game';
import Utils from './utils';
import Hex from '../../MutualSpace/lib/Hex';

const {
  calcAngle,
  calcDistance,
  calcMaxSpeed,
  calcAcceleration,
  calcDistanceByTime,
  calcTimeByDistance,
  calcFlyTime,
} = Utils;

export default function({
  attackerPosition,
  attackerEngineLevel,
  targetShip,
  timeCurrent,
}) {
  const startPosition = { ...targetShip.data.startPosition };
  const targetPosition = { ...targetShip.data.targetPosition };
  if (targetShip.data.hex) {
    const center = new Hex(targetShip.data.hex).center();
    startPosition.x += center.x;
    startPosition.y += center.y;

    const targetHexCenter = new Hex(targetShip.data.targetHex).center();
    targetPosition.x += targetHexCenter.x;
    targetPosition.y += targetHexCenter.y;
  }

  const angle = calcAngle(startPosition, targetPosition);
  const totalDistance = calcDistance(startPosition, targetPosition);

  const startPoint = {
    x: startPosition.x,
    y: startPosition.y,
  };

  const targetShipTime = timeCurrent - Game.dateToTime(targetShip.created);
  const targetShipSpeed = calcMaxSpeed(targetShip.data.engineLevel);
  const targetShipAcc = calcAcceleration(targetShip.data.engineLevel);

  const targetDistance = calcDistanceByTime(
    targetShipTime,
    totalDistance,
    targetShipSpeed,
    targetShipAcc,
  );

  const check = function(distance) {
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

    const timeAttack = calcFlyTime(attackerPosition, attackPoint, attackerEngineLevel);

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
