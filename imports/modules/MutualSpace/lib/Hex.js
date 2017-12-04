import MutualConfig from './config';

const size = MutualConfig.GALACTIC_RADIUS;

class Hex {
  constructor({ x, y, z }) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  corners() {
    const corners = [];
    const center = this.center();

    for (let i = 0; i <= 5; i += 1) {
      corners.push(Hex.corner(center, i));
    }

    return corners;
  }

  center() {
    const x = -(size * Math.sqrt(3) * (this.z + (this.x / 2)));
    const y = ((size * 3) / 2) * this.x;
    return { x, y };
  }

  static corner(center, i) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    return [
      center.x + (size * Math.sin(angleRad)),
      center.y + (size * Math.cos(angleRad)),
    ];
  }
}

export default Hex;
