import { L } from '/moduls/game/lib/importCompability';

const turf = require('@turf/turf');

class PathView {
  constructor({
    layer,
    startPoint,
    endPoint,
    color,
    offsetStart,
    offsetEnd,
  }) {
    this.layer = layer;
    this.polyline = null;
    this.lineOptions = null;
    this.totalDistance = null;

    const points = [
      [startPoint.x + offsetStart.x, startPoint.y + offsetStart.y],
      [endPoint.x + offsetEnd.x, endPoint.y + offsetEnd.y],
    ];

    this.polyline = new L.Polyline(
      points,
      {
        color,
        weight: 2,
      },
    ).addTo(layer);

    this.lineOptions = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: points,
      },
    };

    this.totalDistance = turf.lineDistance(this.lineOptions, 'kilometers');
  }

  remove() {
    if (this.polyline) {
      this.layer.removeLayer(this.polyline);
    }
  }

  alongLine(k) {
    const coords = this.lineOptions.geometry.coordinates;
    const vector = {
      x: coords[1][0] - coords[0][0],
      y: coords[1][1] - coords[0][1],
    };
    return {
      x: coords[0][0] + (vector.x * k),
      y: coords[0][1] + (vector.y * k),
    };
  }

  getPointAlongDistanceByCoef(_k) {
    let k = _k;
    if (k > 1) {
      k = 1;
    } else if (k < 0) {
      k = 0;
    }

    return this.alongLine(k);

    // const along = turf.along(this.lineOptions, this.totalDistance * k, 'kilometers');
    //
    // return {
    //   x: along.geometry.coordinates[0],
    //   y: along.geometry.coordinates[1],
    // };
  }
}

export default PathView;
