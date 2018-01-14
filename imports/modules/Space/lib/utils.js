import Config from './config';

const {
  SPEED_CONFIG,
  MIN_SPEED,
  MAX_SPEED,
  MIN_ACC,
  MAX_ACC,
} = Config;

const calcSpeedK = function(level) {
  const config = SPEED_CONFIG;
  let k = 0;

  if (level >= 100) {
    k = 100;
  } else if (level >= 1) {
    const i = Math.floor(level / 10);
    const j = level % 10;
    k = config[i] + (((config[i + 1] - config[i]) / 10) * j);
  }

  return k / 100;
};

const calcDistance = function(start, end) {
  return Math.sqrt(((end.x - start.x) ** 2) + ((end.y - start.y) ** 2));
};

const calcAngle = function(start, end) {
  return Math.atan2(end.y - start.y, end.x - start.x);
};

const calcDistanceByTime = function(currentTime, totalDistance, maxSpeed, acceleration) {
  const totalDistanceMultiple = totalDistance * 50;

  const incSpeedTime = maxSpeed / acceleration;
  const incSpeedDist = (incSpeedTime * maxSpeed) / 2;

  let traveledDistance = 0;

  if (totalDistanceMultiple < incSpeedDist * 2) {
    const shortDistAccTime = Math.sqrt(totalDistanceMultiple / acceleration);
    const shortDistMaxSpeed = shortDistAccTime * acceleration;

    const maxTime = shortDistAccTime * 2;

    if (currentTime <= shortDistAccTime) {
      traveledDistance = (acceleration * currentTime * currentTime) / 2;
    } else if (currentTime < maxTime) {
      const currentSpeed = shortDistMaxSpeed -
        ((currentTime - shortDistAccTime) * acceleration);

      traveledDistance = ((acceleration * shortDistAccTime * shortDistAccTime) / 2) +
        (((shortDistMaxSpeed + currentSpeed) * (currentTime - shortDistAccTime)) / 2);
    } else {
      traveledDistance = totalDistanceMultiple;
    }
  } else {
    const stableSpeedDist = totalDistanceMultiple - (incSpeedDist * 2);
    const stableSpeedTime = stableSpeedDist / maxSpeed;

    const maxTime = (incSpeedTime * 2) + (stableSpeedDist / maxSpeed);

    if (currentTime < incSpeedTime) {
      traveledDistance = (acceleration * currentTime * currentTime) / 2;
    } else if (currentTime <= (incSpeedTime + stableSpeedTime)) {
      traveledDistance = incSpeedDist + ((currentTime - incSpeedTime) * maxSpeed);
    } else if (currentTime <= maxTime) {
      const slowingTime = currentTime - incSpeedTime - stableSpeedTime;
      traveledDistance = (incSpeedDist + stableSpeedDist) +
        ((((maxSpeed * 2) - (acceleration * slowingTime)) * slowingTime) / 2);
    } else {
      traveledDistance = totalDistanceMultiple;
    }
  }
  return traveledDistance / 50;
};

const calcTotalTimeByDistance = function(totalDistance, maxSpeed, acceleration) {
  const totalDistanceMultiple = totalDistance * 50;

  const incSpeedTime = maxSpeed / acceleration;
  const incSpeedDist = (incSpeedTime * maxSpeed) / 2;

  let totalTime;

  if (totalDistanceMultiple < incSpeedDist * 2) {
    const shortDistAccTime = Math.sqrt(totalDistanceMultiple / acceleration);

    totalTime = shortDistAccTime * 2;
  } else {
    const stableSpeedDist = totalDistanceMultiple - (incSpeedDist * 2);
    const stableSpeedTime = stableSpeedDist / maxSpeed;

    totalTime = stableSpeedTime + (incSpeedTime * 2);
  }

  return Math.round(totalTime);
};

const calcTimeByDistance = function(currentDistance, totalDistance, maxSpeed, acceleration) {
  const currentDistanceMultiple = currentDistance * 50;
  const totalDistanceMultiple = totalDistance * 50;

  const incSpeedTime = maxSpeed / acceleration;
  const incSpeedDist = (incSpeedTime * maxSpeed) / 2;

  let stableSpeedDist = totalDistanceMultiple - (incSpeedDist * 2);

  let time;

  if (currentDistanceMultiple < incSpeedDist) {
    time = Math.sqrt((2 * currentDistanceMultiple) / acceleration);
  } else if (currentDistanceMultiple < (incSpeedDist + stableSpeedDist)) {
    const stableSpeedCurrent = currentDistanceMultiple - incSpeedDist;
    time = incSpeedTime + (stableSpeedCurrent / maxSpeed);
  } else if (currentDistanceMultiple < totalDistanceMultiple) {
    stableSpeedDist = totalDistanceMultiple - (incSpeedDist * 2);
    const stableSpeedTime = stableSpeedDist / maxSpeed;

    const decSpeedDist = currentDistanceMultiple - (incSpeedDist + stableSpeedDist);

    // Решаем квадратное уравнение: (a*t^2)/2 - V0 * t + S = 0
    // дискриминант (b2 - 4ac) = V0^2 - 2 * a * S
    // корней получается 2, т.е. точек пересечения 2 (ближняя и через
    // возврат с положительным ускорением),
    // поэтому берем корень с трицательным дискриминантом, это будет ближняя точка

    const decSpeedTime = (maxSpeed - Math.sqrt((maxSpeed ** 2) - (2 *
      acceleration * decSpeedDist))) / acceleration;

    time = incSpeedTime + stableSpeedTime + decSpeedTime;
  } else {
    time = calcTotalTimeByDistance(totalDistanceMultiple, maxSpeed, acceleration);
  }

  return Math.round(time);
};

const calcMaxSpeed = function(level) {
  const min = MIN_SPEED;
  const max = MAX_SPEED;
  return min + ((max - min) * calcSpeedK(level));
};

const calcAcceleration = function(level) {
  const min = MIN_ACC;
  const max = MAX_ACC;
  return min + ((max - min) * calcSpeedK(level));
};

const calcFlyTime = function(startPoint, endPoint, engineLevel) {
  const distance = calcDistance(startPoint, endPoint);
  const maxSpeed = calcMaxSpeed(engineLevel);
  const acceleration = calcAcceleration(engineLevel);

  return calcTotalTimeByDistance(distance, maxSpeed, acceleration);
};

export default {
  calcDistance,
  calcAngle,
  calcDistanceByTime,
  calcTotalTimeByDistance,
  calcTimeByDistance,
  calcMaxSpeed,
  calcAcceleration,
  calcFlyTime,
};
