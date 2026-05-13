import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { SceneManager } from './core/SceneManager.js';
import { ScrollManager } from './core/ScrollManager.js';
import { OverlayManager } from './overlay/OverlayManager.js';
import { StarField } from './shared/StarField.js';
import { OrbitLines } from './shared/OrbitLines.js';
import { Sun } from './planets/Sun.js';
import { Mercury } from './planets/Mercury.js';
import { Venus } from './planets/Venus.js';
import { Earth } from './planets/Earth.js';
import { Mars } from './planets/Mars.js';
import { Jupiter } from './planets/Jupiter.js';
import { Saturn } from './planets/Saturn.js';
import { Uranus } from './planets/Uranus.js';
import { Neptune } from './planets/Neptune.js';
import { BlackHole } from './planets/BlackHole.js';
import { Comet } from './shared/Comet.js';
import { SECTION_CAMERAS, camFromPosition } from './config/cameras.js';
import { PLANETS, ORBIT_RADII } from './config/planets.js';

const canvas = document.getElementById('scene');
const sceneManager = new SceneManager(canvas);
const { scene, camera, renderer } = sceneManager;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 500;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.8;

const scrollManager = new ScrollManager(camera);
const overlay = new OverlayManager(scrollManager);

const starField = new StarField();
scene.add(starField.group);

const orbitLines = new OrbitLines();
scene.add(orbitLines.group);

const comet = new Comet();
scene.add(comet.group);

const sun = new Sun();
const mercury = new Mercury();
const venus = new Venus();
const earth = new Earth();
const mars = new Mars();
const jupiter = new Jupiter();
const saturn = new Saturn();
const uranus = new Uranus();
const neptune = new Neptune();
const blackHole = new BlackHole();

const planets = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, blackHole];

for (const p of planets) {
  scene.add(p.group);
}

const orbits = [
  { obj: mercury, key: 'mercury', initAngle: 30 },
  { obj: venus, key: 'venus', initAngle: 85 },
  { obj: earth, key: 'earth', initAngle: 150 },
  { obj: mars, key: 'mars', initAngle: 210 },
  { obj: jupiter, key: 'jupiter', initAngle: 265 },
  { obj: saturn, key: 'saturn', initAngle: 320 },
  { obj: uranus, key: 'uranus', initAngle: 15 },
  { obj: neptune, key: 'neptune', initAngle: 60 },
];

const SECTION_PLANET = {
  2: mercury, 3: venus, 4: earth, 5: earth,
  6: mars, 7: jupiter, 8: saturn, 9: uranus, 10: neptune,
};

const CAM_PARAMS = {
  2: [-1, 0.8, 2.5],
  3: [2, 1.5, 4],
  4: [-2, 1.5, 4.5],
  5: [1, 1.5, 5],
  6: [1.5, 1, 3.5],
  7: [-3, 4, 10],
  8: [4, 6, 12],
  9: [-2, 3, 7],
  10: [2, 2.5, 6],
};

scrollManager.setCameraResolver((index) => {
  const planet = SECTION_PLANET[index];
  const params = CAM_PARAMS[index];
  if (planet && params) {
    const p = planet.group.position;
    return camFromPosition(p.x, p.z, ...params);
  }
  return SECTION_CAMERAS[index];
});

controls.target.set(...SECTION_CAMERAS[0].look);

const clock = new THREE.Clock();
let elapsed = 0;
const _moonWorldPos = new THREE.Vector3();
const _trackDelta = new THREE.Vector3();

function updateOrbits() {
  for (const o of orbits) {
    const r = ORBIT_RADII[o.key];
    const speed = PLANETS[o.key].orbitSpeed;
    const angle = o.initAngle * Math.PI / 180 + elapsed * speed;
    o.obj.group.position.x = Math.cos(angle) * r;
    o.obj.group.position.z = Math.sin(angle) * r;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  updateOrbits();
  scrollManager.update(delta, controls);
  starField.update(elapsed);
  comet.update(elapsed, delta);

  const section = scrollManager.activeSection;

  if (scrollManager.transitioning && SECTION_PLANET[section] && CAM_PARAMS[section]) {
    const planet = SECTION_PLANET[section];
    const params = CAM_PARAMS[section];
    const cam = camFromPosition(planet.group.position.x, planet.group.position.z, ...params);
    scrollManager.updateTransitionTarget(cam.pos, cam.look);
  }

  if (!scrollManager.transitioning) {
    let trackTarget = null;
    if (section === 5) {
      earth.moon.getWorldPosition(_moonWorldPos);
      trackTarget = _moonWorldPos;
    } else if (SECTION_PLANET[section]) {
      trackTarget = SECTION_PLANET[section].group.position;
    }

    if (trackTarget) {
      _trackDelta.subVectors(trackTarget, controls.target);
      controls.target.add(_trackDelta);
      camera.position.add(_trackDelta);
    }

    controls.update();
  }

  for (const p of planets) {
    if (p.group.visible) p.update(elapsed, delta);
  }

  sceneManager.render();
}

animate();
overlay.hideLoading();
