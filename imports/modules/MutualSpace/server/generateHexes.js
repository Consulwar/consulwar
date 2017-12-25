const Cube = function(x, z) {
  return { x, z };
};

const cubeDirections = [
  Cube(0, +1), Cube(-1, +1), Cube(-1, 0),
  Cube(0, -1), Cube(+1, -1), Cube(+1, 0),
];

const cubeDirection = function(direction) {
  return cubeDirections[direction];
};

const cubeAdd = function(hex1, hex2) {
  return Cube(hex1.x + hex2.x, hex1.z + hex2.z);
};

const cubeScale = function(dir, k) {
  return Cube(dir.x * k, dir.z * k);
};

const cubeNeighbor = function(cube, direction) {
  return cubeAdd(cube, cubeDirection(direction));
};

let allCount = 1;

const cubeRing = function(center, radius) {
  const results = [];
  let cube = cubeAdd(center, cubeScale(cubeDirection(4), radius));

  for (let i = 0; i < 6; i += 1) {
    for (let j = 0; j < radius; j += 1) {
      if (allCount % 5 === 0) {
        cube.username = null;
      }

      results.push(cube);
      allCount += 1;

      cube = cubeNeighbor(cube, i);
    }
  }

  return results;
};

const cubeSpiral = function(center, count, initialRadius = 0) {
  const hexes = [];

  let radius;
  if (initialRadius === 0) {
    hexes.push(center);
    radius = 1;
  } else {
    radius = initialRadius;
  }

  while (hexes.length < count) {
    hexes.push.apply(hexes, cubeRing(center, radius));

    radius += 1;
  }

  return hexes;
};

export default function generateHexes(collection, count) {
  const hexes = cubeSpiral(Cube(0, 0, 0), count);

  hexes.forEach((hex) => {
    collection.insert(hex);
  });
}

// const needCount = parseInt(process.argv[2], 10);
// const initialRadius = parseInt(process.argv[3], 10) || 0;
//
// console.log(JSON.stringify(cubeSpiral(Cube(0, 0, 0), needCount, initialRadius)));
