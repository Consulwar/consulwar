import { _ } from 'meteor/underscore';

const turf = require('@turf/turf');

class PathView {
  constructor(layer, startPoint, endPoint, color, eventId, pathViews) {
    this.layer = layer;
    this.polyline = null;
    this.lineOptions = null;
    this.totalDistance = null;

    const points = [[startPoint.x, startPoint.y], [endPoint.x, endPoint.y]];
    const polyline = new L.Polyline(
      points,
      {
        color,
        weight: 2,
      },
    ).addTo(layer);

    polyline.on('mouseover', function() {
      polyline.setStyle({
        // color: 'purple',
        weight: 3,
      });
      polyline.bringToFront();

      $(`.map-fleet:not([data-id="${eventId}"])`).addClass('blur');

      _(pathViews).keys().forEach((id) => {
        if (id !== eventId) {
          pathViews[id].polyline.setStyle({ opacity: 0.4 });
        }
      });
    });

    polyline.on('mouseout', function() {
      polyline.setStyle({
        weight: 2,
      });
      polyline.bringToBack();

      $('.map-fleet').removeClass('blur');

      _(pathViews).keys().forEach((id) => {
        if (id !== eventId) {
          pathViews[id].polyline.setStyle({ opacity: 1 });
        }
      });
    });

    this.polyline = polyline;

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

  along(k) {
    const coords = this.lineOptions.geometry.coordinates;
    const vector = {x: coords[1][0] - coords[0][0], y: coords[1][1] - coords[0][1]};
    const length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
    return {x: (vector.x / length) * k, y: (vector.y / length) * k};
  }

  getPointAlongDistanceByCoef(_k) {
    let k = _k;
    if (k > 1) {
      k = 1;
    } else if (k < 0) {
      k = 0;
    }

    // const along1 = this.along(this.totalDistance * k);

    const along = turf.along(this.lineOptions, this.totalDistance * k, 'kilometers');

    return {
      x: along.geometry.coordinates[0],
      y: along.geometry.coordinates[1],
    };
  }
}

export default PathView;
