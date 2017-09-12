initCosmosPathView = function () {
'use strict';

game.PathView = function(map, startPoint, endPoint, startOffset, endOffset, color, eventId, pathViews) {

  var allPlanets = Game.Planets.getAll().fetch();
  let planetsByHand = [];
  for (var i = 0; i < allPlanets.length; i++) {
    let planet = allPlanets[i];
    planet.radius = (planet.size + 3) * 0.02;

    let hand = planet.hand;
    let segment = planet.segment;
    if (!planetsByHand[hand]) {
      planetsByHand[hand] = [];
    }
    if (!planetsByHand[hand][segment]) {
      planetsByHand[hand][segment] = [];
    }
    planetsByHand[hand][segment].push(planet);
  }

  var hitLineVsCircle = function(x1, y1, x2, y2, cx, cy, cRad) {
    var a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    var b = 2 * ((x2 - x1) * (x1 - cx) +(y2 - y1) * (y1 - cy));
    var cc = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - cRad * cRad;
    var deter = b * b - 4 * a * cc;
    if (deter <= 0) {
      return false;
    } else {
      var e = Math.sqrt (deter);
      var u1 = ( - b + e ) / (2 * a );
      var u2 = ( - b - e ) / (2 * a );
      if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
        return false;
      }
    }
    return true;
  };

  var calcDistanse = function(ax, ay, bx, by) {
    return Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
  };

  var buildSpline = function(points) {
    var coords = [];
    for (var i = 0; i < points.length; i++) {
      coords.push([points[i].x, points[i].y]);
    }

    var line = {
      "type": "Feature",
      "properties": {
        "stroke": "#f00"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": coords
      }
    };

    var curved = turf.bezier(line, 20000, 0.4);
    curved.properties = { stroke: '#0f0' };

    var curvedCoords = curved.geometry.coordinates;
    var result = [{x:points[0].x, y:points[0].y}];
    for (var n = 0; n < curvedCoords.length; n++) {
      result.push({
        x: curvedCoords[n][0],
        y: curvedCoords[n][1]
      });
    }

    result.push({x:points[points.length-1].x, y:points[points.length-1].y});

    return result;
  };

  var findNewPoint = function(startPoint, midPlanet, angle, isTop) {
    var tmpAng = angle + Math.PI * (isTop ? -0.5: 0.5);
    var tmpDist = midPlanet.radius + 0.1;
    return {
      x: midPlanet.x + Math.cos(tmpAng) * tmpDist,
      y: midPlanet.y + Math.sin(tmpAng) * tmpDist
    };
  };

  var getIntersectedPlantents = function(point1, point2) {
    var planets = [];

    for (var i = 0; i < allPlanets.length; i++) {
      var planetView = allPlanets[i];

      if (calcDistanse(point1.x, point1.y, planetView.x, planetView.y) < planetView.radius) continue;
      if (calcDistanse(point2.x, point2.y, planetView.x, planetView.y) < planetView.radius) continue;

      if (hitLineVsCircle(point1.x, point1.y, point2.x, point2.y, planetView.x, planetView.y, planetView.radius)) {
        planets.push(planetView);
      }
    }

    if (planets.length <= 0) {
      return []; // no intersections
    }

    // sort
    planets.sort(function(a, b) {
      var da = calcDistanse(point1.x, point1.y, a.x, a.y);
      var db = calcDistanse(point1.x, point1.y, b.x, b.y);
      if (da < db) return -1;
      if (da > db) return 1;
      return 0;
    });

    return planets;
  };

  var calcDistanseViaPoints = function(points) {
    let distance = 0;

    if (points && points.length > 1) {
      for (var i = 0; i < points.length - 1; i++) {
        distance += calcDistanse(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      }
    }

    return distance;
  };

  var getConnectionPoints = function(startPoint, midPlanet, finishPoint) {
    var angle = Math.atan2(finishPoint.y - startPoint.y, finishPoint.x - startPoint.x);

    var topPoint = findNewPoint(startPoint, midPlanet, angle, true);
    var bottomPoint = findNewPoint(startPoint, midPlanet, angle, false);

    var startToTopIntersects = getIntersectedPlantents(startPoint, topPoint);
    var startToBottomIntersects = getIntersectedPlantents(startPoint, bottomPoint);

    var distToTop = 0;
    var distToBottom = 0;

    if (!startToTopIntersects.length || !startToBottomIntersects.length) {
      if (startToTopIntersects.length == startToBottomIntersects.length) {

        distToTop = calcDistanseViaPoints([startPoint, topPoint, finishPoint]);
        distToBottom = calcDistanseViaPoints([startPoint, bottomPoint, finishPoint]);

        if (distToTop > distToBottom) {
          return bottomPoint;
        } else {
          return topPoint;
        }
      } else {
        return startToTopIntersects.length ? bottomPoint : topPoint;
      }
    } else {

      var topToFinishIntersects = getIntersectedPlantents(topPoint, finishPoint);
      var bottomToFinishIntersects = getIntersectedPlantents(bottomPoint, finishPoint);

      var topLength = startToTopIntersects.length + topToFinishIntersects.length;
      var bottomLength = startToBottomIntersects.length + bottomToFinishIntersects.length;

      if (topLength > bottomLength) {
        midPlanet = startToBottomIntersects[0];
      } else if(topLength < bottomLength) {
        midPlanet = startToTopIntersects[0];
      } else {
        
        distToTop = calcDistanseViaPoints([startPoint, topPoint, finishPoint]);
        distToBottom = calcDistanseViaPoints([startPoint, bottomPoint, finishPoint]);

        if (distToTop > distToBottom) {
          midPlanet = startToBottomIntersects[0];
        } else {
          midPlanet = startToTopIntersects[0];
        }
      }

      return getConnectionPoints(startPoint, midPlanet, finishPoint);
    }
  };

  var getPath = function(startPoint, finishPoint) {
    var coords = [];
    coords.push(startPoint);

    var planets = getIntersectedPlantents(startPoint, finishPoint);
    var n = 0;

    while (planets.length) {
      var closestPlanet = planets[0];

      var point = getConnectionPoints(coords[coords.length - 1], closestPlanet, finishPoint);
      coords.push(point);

      planets = getIntersectedPlantents(point, finishPoint);

      if (n++ > 50) {
        console.log('Path build failed! Near planet:', closestPlanet);
        break;
      }
    }

    coords.push(finishPoint);
    return coords;
  };

  let findNearestPlanet = function(point) {
    let minDistance = Infinity;
    let foundPlanet;

    for (let planet of allPlanets) {
      let distance = distanceSqr(planet, point);
      if (distance < minDistance) {
        minDistance = distance;
        foundPlanet = planet;
      }
    }

    return foundPlanet;
  };

  let distanceSqr = function(p1, p2) {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  };

  const angleCoefficient = 2;
  const distanceCoefficient = 1;

  let relevance = function(start, finish, candidate) {
    let ax = candidate.x - start.x;
    let ay = candidate.y - start.y;

    let bx = finish.x - start.x;
    let by = finish.y - start.y;

    let bDist = Math.sqrt(bx * bx + by * by);
    let aDist = Math.sqrt(ax * ax + ay * ay);

    let cos = (ax * bx + ay * by) / (aDist * bDist);

    if (cos < 0) {
      return 0;
    }

    let dist = bDist / aDist;

    return cos * angleCoefficient + dist * distanceCoefficient;
  };

  let findBestPlanet_ = function(start, finish, candidates) {
    let relMax = -Infinity;
    let foundPlanet = finish;

    for (let candidate of candidates) {
      if (candidate === start) {
        continue;
      }

      let check = relevance(start, finish, candidate);
      if (check > relMax) {
        relMax = check;
        foundPlanet = candidate;
      }
    }

    return foundPlanet;
  };

  let findBestPlanet = function(current, finish, candidates) {
    let maxDist = -Infinity;
    let minDist = Infinity;
    let foundPlanet = finish;

    let currentDist = distanceSqr(current, finish);

    for (let candidate of candidates) {
      if (candidate === current) {
        continue;
      }

      let distCandidateFinish = distanceSqr(candidate, finish);
      let distCandidateCurrent = distanceSqr(candidate, current);

      if (distCandidateFinish < currentDist/* && distCandidateFinish > maxDist */&& distCandidateCurrent < minDist) {
        maxDist = distCandidateFinish;
        minDist = distCandidateCurrent;
        foundPlanet = candidate;
      }
    }

    return foundPlanet;
  };

  let concatSegments = function(startIndex, segments) {
    if (startIndex < segments.length - 1) {
      return segments[startIndex].concat( segments[startIndex + 1] );
    } else {
      return segments[startIndex];
    }
  };

  let fillCoordsFromSegments = function(startPlanet, finishPlanet, segments, coords, planetsInPath) {
    let planets;
    let n = 0;
    let bestPlanet;

    let currentIndex = 0;
    planets = concatSegments(currentIndex, segments);

    let currentPlanet = startPlanet;

    do {
      bestPlanet = findBestPlanet(currentPlanet, finishPlanet, planets);

      planetsInPath.push(bestPlanet);

      coords.push(getConnectionPoints(coords[coords.length-1], currentPlanet, bestPlanet));

      if (bestPlanet.segment !== currentPlanet.segment) {
        currentIndex++;
        planets = concatSegments(currentIndex, segments);
      }

      currentPlanet = bestPlanet;

      if (n++ > 500) {
        console.log('Path build failed! Near planet:', currentPlanet);
        break;
      }
    } while (bestPlanet !== finishPlanet);
  };

  let fillHandSegments = function(hand, startSegment, finishSegment, segments) {
    let sign = Math.sign(finishSegment - startSegment);
    let segment = startSegment;
    do {
      segments.push(planetsByHand[hand][segment]);
      segment += sign;
    } while( segment !== finishSegment );

    segments.push(planetsByHand[hand][finishSegment]);
  };

  let isCenter = function(planet) {
    return planet.hand === 0 && planet.segment === 0;
  };

  let getNewPath = function(startPoint, finishPoint, planetsInPath) {
    let coords = [];
    coords.push(startPoint);

    let startPlanet = findNearestPlanet(startPoint);

    planetsInPath.push(startPlanet);

    let finishPlanet = findNearestPlanet(finishPoint);

    let segments = [];

    if (startPlanet.hand === finishPlanet.hand) {
      fillHandSegments(startPlanet.hand, startPlanet.segment, finishPlanet.segment, segments);

      fillCoordsFromSegments(startPlanet, finishPlanet, segments, coords, planetsInPath);
    } else {
      if (isCenter(finishPlanet)) { //finish in center
        // add hand
        fillHandSegments(startPlanet.hand, startPlanet.segment, 1, segments);
        // add center
        segments.push(planetsByHand[0][0]);

        fillCoordsFromSegments(startPlanet, finishPlanet, segments, coords, planetsInPath);
      } else if (isCenter(startPlanet)) { // start in center
        // add center
        segments.push(planetsByHand[0][0]);
        // add hand
        fillHandSegments(finishPlanet.hand, 1, finishPlanet.segment, segments);

        fillCoordsFromSegments(startPlanet, finishPlanet, segments, coords, planetsInPath);
      } else { // start and finish in different hands
        // find nearest planet from center
        let minDistance = Infinity;
        let startCenterPlanet;

        let cx = 0;
        let cy = 0;
        let planets = planetsByHand[startPlanet.hand][1];
        for (let planet of planets) {
          cx += planet.x;
          cy += planet.y;
        }
        let count = planets.length;
        let centerSegment = {x: cx / count, y: cy / count};

        for (let planet of planets) {
          let distance = distanceSqr(planet, centerSegment);
          if (distance < minDistance) {
            minDistance = distance;
            startCenterPlanet = planet;
          }
        }

        // add first hand
        fillHandSegments(startPlanet.hand, startPlanet.segment, 1, segments);

        fillCoordsFromSegments(startPlanet, startCenterPlanet, segments, coords, planetsInPath);

        // find nearest planet from center
        minDistance = Infinity;
        let finishCenterPlanet;

        cx = 0;
        cy = 0;
        planets = planetsByHand[finishPlanet.hand][1];
        for (let planet of planets) {
          cx += planet.x;
          cy += planet.y;
        }
        count = planets.length;
        centerSegment = {x: cx / count, y: cy / count};

        for (let planet of planets) {
          let distance = distanceSqr(planet, centerSegment);
          if (distance < minDistance) {
            minDistance = distance;
            finishCenterPlanet = planet;
          }
        }

        // add center
        segments = [planetsByHand[startPlanet.hand][1]];
        segments.push([planetsByHand[0][0]]);
        segments.push([planetsByHand[finishPlanet.hand][1]]);

        fillCoordsFromSegments(startCenterPlanet, finishCenterPlanet, segments, coords, planetsInPath);

        // add second hand
        segments.length = 0;
        fillHandSegments(finishPlanet.hand, 1, finishPlanet.segment, segments);

        fillCoordsFromSegments(finishCenterPlanet, finishPlanet, segments, coords, planetsInPath);
      }
    }

    coords.push(finishPoint);

    return coords;
  };

  this.polyline = null;
  this.lineOptions = null;
  this.totalDistance = null;

  this.constructor = function() {
    // apply start and end offset
    var angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    
    startPoint.x += startOffset * Math.cos(angle);
    startPoint.y += startOffset * Math.sin(angle);

    endPoint.x -= endOffset * Math.cos(angle);
    endPoint.y -= endOffset * Math.sin(angle);

    this.planetsInPath = [];

    // build path
    let points = getNewPath(startPoint, endPoint, this.planetsInPath);
    // let points = getPath(startPoint, endPoint);

    points = buildSpline(points);

    this.polyline = new L.Polyline([], {
      color: color,
      weight: 2,
      opacity: 1,
      smoothFactor: 1
    }).addTo(map);

    let polyline = this.polyline;
    let planetsInPath = this.planetsInPath;

    polyline.on('mouseover', function() {
      polyline.setStyle({
        // color: 'purple',
        weight: 3
      });
      polyline.bringToFront();

      $(`.map-fleet:not([data-id="${eventId}"])`).addClass('blur');

      $('.map-planet-marker').addClass('blur');

      let planetsId = '[data-id="' + _.map(planetsInPath, (planet)=> planet._id).
        join('"], [data-id="') + '"]';

      $(planetsId).removeClass('blur');

      for (let id in pathViews) {
        if (id !== eventId) {
          pathViews[id].polyline.setStyle({opacity: 0.4});
        }
      }
    });

    polyline.on('mouseout', function() {
      polyline.setStyle({
        weight: 2
      });

      $(`.map-fleet`).removeClass('blur');

      $('.map-planet-marker').removeClass('blur');

      for (let id in pathViews) {
        if (id !== eventId) {
          pathViews[id].polyline.setStyle({opacity: 1});
        }
      }
    });

    for (var i = 0; i < points.length; i++) {
      this.polyline.addLatLng(L.latLng(points[i].x, points[i].y));
    }

    this.lineOptions = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": _.map(points, function(point) {
        return [point.x, point.y];
        })
      }
    };

    this.totalDistance = turf.lineDistance(this.lineOptions, 'kilometers');
  };

  this.getPointAlongDistanceByCoef = function(k) {

    if (k > 1) {
      k = 1;
    } else if (k < 0) {
      k = 0;
    }

    var along = turf.along(this.lineOptions, this.totalDistance * k, 'kilometers');

    return {
      x: along.geometry.coordinates[0],
      y: along.geometry.coordinates[1]
    };
  };

  this.remove = function() {
    if (this.polyline) {
      map.removeLayer(this.polyline);
    }
  };

  this.constructor();
};

};