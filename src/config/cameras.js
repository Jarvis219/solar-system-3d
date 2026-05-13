import { PLANETS, ORBIT_RADII } from './planets.js';

function camForPlanet(name, sideOffset, height, distance) {
  const [px, , pz] = PLANETS[name].position;
  const len = Math.sqrt(px * px + pz * pz);
  const dirX = -px / len;
  const dirZ = -pz / len;
  const perpX = -dirZ;
  const perpZ = dirX;

  return {
    pos: [
      px + dirX * distance + perpX * sideOffset,
      height,
      pz + dirZ * distance + perpZ * sideOffset,
    ],
    look: [px, 0, pz],
  };
}

export const SECTION_CAMERAS = [
  // 0: Intro
  { pos: [0, 40, 80], look: [0, 0, 0] },
  // 1: Sun
  { pos: [12, 6, 12], look: [0, 0, 0] },
  // 2: Mercury — sunlit side, slight left
  camForPlanet('mercury', -1, 0.8, 2.5),
  // 3: Venus
  camForPlanet('venus', 2, 1.5, 4),
  // 4: Earth
  camForPlanet('earth', -2, 1.5, 4.5),
  // 5: Moon — camera near Moon orbit, dynamic tracking in main.js
  (() => {
    const [ex, , ez] = PLANETS.earth.position;
    return { pos: [ex + 1, 1.5, ez + 5], look: [ex + 4, 0, ez] };
  })(),
  // 6: Mars
  camForPlanet('mars', 1.5, 1, 3.5),
  // 7: Jupiter
  camForPlanet('jupiter', -3, 4, 10),
  // 8: Saturn — angled to see rings
  camForPlanet('saturn', 4, 6, 12),
  // 9: Uranus
  camForPlanet('uranus', -2, 3, 7),
  // 10: Neptune
  camForPlanet('neptune', 2, 2.5, 6),
  // 11: Black Hole
  { pos: [-145, 8, -52], look: [-160, 0, -60] },
  // 12: Outro — top-down
  { pos: [0, 200, 50], look: [0, 0, 0] },
];
