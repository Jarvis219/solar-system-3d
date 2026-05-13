import { PALETTE } from '../shared/colors.js';

export const ORBIT_RADII = {
  mercury: 12,
  venus: 20,
  earth: 30,
  mars: 42,
  jupiter: 62,
  saturn: 84,
  uranus: 108,
  neptune: 132,
};

function orbitPos(name, angleDeg) {
  const r = ORBIT_RADII[name];
  const a = angleDeg * Math.PI / 180;
  return [Math.cos(a) * r, 0, Math.sin(a) * r];
}

export const PLANETS = {
  sun: {
    radius: 5,
    position: [0, 0, 0],
    rotationSpeed: 0.05,
  },
  mercury: {
    radius: 0.5,
    position: orbitPos('mercury', 30),
    rotationSpeed: 0.15,
    color: PALETTE.mercury,
    roughness: 0.95,
    orbitSpeed: 0.12,
  },
  venus: {
    radius: 1.0,
    position: orbitPos('venus', 85),
    rotationSpeed: -0.04,
    color: PALETTE.venus,
    atmosphereColor: [0.95, 0.85, 0.6],
    cloudSpeed: 0.08,
    orbitSpeed: 0.09,
  },
  earth: {
    radius: 1.1,
    position: orbitPos('earth', 150),
    rotationSpeed: 0.3,
    color: PALETTE.earth,
    atmosphereColor: [0.4, 0.6, 1.0],
    moonRadius: 0.35,
    moonDistance: 4,
    moonSpeed: 0.25,
    orbitSpeed: 0.07,
  },
  mars: {
    radius: 0.7,
    position: orbitPos('mars', 210),
    rotationSpeed: 0.28,
    color: PALETTE.mars,
    roughness: 0.95,
    orbitSpeed: 0.055,
    moons: [
      { name: 'Phobos', radius: 0.08, distance: 1.8, speed: 0.8 },
      { name: 'Deimos', radius: 0.05, distance: 2.6, speed: 0.5 },
    ],
  },
  jupiter: {
    radius: 3.2,
    position: orbitPos('jupiter', 265),
    rotationSpeed: 0.6,
    color: PALETTE.jupiter,
    bandSpeed: 0.02,
    orbitSpeed: 0.035,
    moons: [
      { name: 'Io', radius: 0.15, distance: 5.5, speed: 0.5, color: 0xccaa44 },
      { name: 'Europa', radius: 0.12, distance: 7, speed: 0.35, color: 0xbbccdd },
      { name: 'Ganymede', radius: 0.18, distance: 8.8, speed: 0.25, color: 0x998877 },
      { name: 'Callisto', radius: 0.15, distance: 10.5, speed: 0.18, color: 0x665544 },
    ],
  },
  saturn: {
    radius: 2.6,
    position: orbitPos('saturn', 320),
    rotationSpeed: 0.5,
    color: PALETTE.saturn,
    ringInner: 3.5,
    ringOuter: 6.5,
    ringColor: PALETTE.saturnRing,
    orbitSpeed: 0.025,
  },
  uranus: {
    radius: 1.8,
    position: orbitPos('uranus', 15),
    rotationSpeed: -0.35,
    color: PALETTE.uranus,
    tilt: 97.77,
    ringInner: 2.4,
    ringOuter: 3.2,
    orbitSpeed: 0.018,
  },
  neptune: {
    radius: 1.7,
    position: orbitPos('neptune', 60),
    rotationSpeed: 0.32,
    color: PALETTE.neptune,
    atmosphereColor: [0.2, 0.4, 1.0],
    orbitSpeed: 0.012,
  },
};

export const SECTION_ORDER = [
  'intro', 'sun', 'mercury', 'venus', 'earth', 'moon',
  'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'blackhole', 'outro',
];
