initCosmosPathView = function () {

game.PathView = function(map, startPoint, endPoint, startOffset, endOffset, color, template) {

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
	}

	var calcDistanse = function(ax, ay, bx, by) {
		return Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
	}

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

		var coords = curved.geometry.coordinates;
		var result = [];
		for (var i = 0; i < coords.length; i++) {
			result.push({
				x: coords[i][0],
				y: coords[i][1]
			});
		}

		return result;
	}

	var findNewPoint = function(startPoint, midPlanet, angle, isTop) {
		var tmpAng = angle + Math.PI * (isTop ? -0.5: 0.5);
		var tmpDist = midPlanet.radius + 0.1;
		return {
			x: midPlanet.x + Math.cos(tmpAng) * tmpDist,
			y: midPlanet.y + Math.sin(tmpAng) * tmpDist
		};
	}

	var getIntersectedPlantents = function(point1, point2) {
		var planets = [];
		var minRadius = Game.Planets.MIN_PLANET_DISTANCE / 2;

		for (var id in template.data.planetViews) {
			var planetView = template.data.planetViews[id];

			if (calcDistanse(point1.x, point1.y, planetView.x, planetView.y) < minRadius) continue;
			if (calcDistanse(point2.x, point2.y, planetView.x, planetView.y) < minRadius) continue;

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
	}

	var calcDistanseViaPoints = function(points) {
		distance = 0;

		if (points && points.length > 1) {
			for (var i = 0; i < points.length - 1; i++) {
				distance += calcDistanse(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
			}
		}

		return distance;
	}

	var getConnectionPoints = function(startPoint, midPlanet, finishPoint) {
		var angle = Math.atan2(finishPoint.y - startPoint.y, finishPoint.x - startPoint.x);

		var topPoint = findNewPoint(startPoint, midPlanet, angle, true);
		var bottomPoint = findNewPoint(startPoint, midPlanet, angle, false);

		var startToTopIntersects = getIntersectedPlantents(startPoint, topPoint);
		var startToBottomIntersects = getIntersectedPlantents(startPoint, bottomPoint);

		if (!startToTopIntersects.length || !startToBottomIntersects.length) {
			if (startToTopIntersects.length == startToBottomIntersects.length) {

				var distToTop = calcDistanseViaPoints([startPoint, topPoint, finishPoint]);
				var distToBottom = calcDistanseViaPoints([startPoint, bottomPoint, finishPoint]);

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
			var bottomLength = startToBottomIntersects.length + bottomToFinishIntersects.length

			if (topLength > bottomLength) {
				midPlanet = startToBottomIntersects[0];
			} else if(topLength < bottomLength) {
				midPlanet = startToTopIntersects[0];
			} else {
				
				var distToTop = calcDistanseViaPoints([startPoint, topPoint, finishPoint]);
				var distToBottom = calcDistanseViaPoints([startPoint, bottomPoint, finishPoint]);

				if (distToTop > distToBottom) {
					midPlanet = startToBottomIntersects[0];
				} else {
					midPlanet = startToTopIntersects[0];
				}
			}

			return getConnectionPoints(startPoint, midPlanet, finishPoint);
		}
	}

	var getPath = function(startPoint, finishPoint) {
		var coords = [];
		coords.push(startPoint);

		var planets = getIntersectedPlantents(startPoint, finishPoint);

		while (planets.length) {

			var closestPlanet = planets[0];

			var point = getConnectionPoints(coords[coords.length - 1], closestPlanet, finishPoint);
			coords.push(point);

			planets = getIntersectedPlantents(point, finishPoint);
		}

		coords.push(finishPoint);
		return coords;
	}

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

		// build path
		var points = getPath(startPoint, endPoint);
		points = buildSpline(points);

		this.polyline = new L.Polyline([], {
			color: color,
			weight: 3,
			smoothFactor: 1
		}).addTo(map);

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
	}

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
	}

	this.remove = function() {
		if (this.polyline) {
			map.removeLayer(this.polyline);
		}
	}

	this.constructor();
}

}