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
import { SECTION_CAMERAS } from './config/cameras.js';

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

scrollManager.onChange((index) => {
  const cam = SECTION_CAMERAS[index];
  controls.target.set(...cam.look);
});

const cam0 = SECTION_CAMERAS[0];
controls.target.set(...cam0.look);

const clock = new THREE.Clock();
let elapsed = 0;
const _moonWorldPos = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  scrollManager.update(delta, controls);
  starField.update(elapsed);
  comet.update(elapsed);

  if (scrollManager.activeSection === 5) {
    earth.moon.getWorldPosition(_moonWorldPos);
    controls.target.lerp(_moonWorldPos, 0.15);
  }

  if (!scrollManager.transitioning) {
    controls.update();
  }

  for (const p of planets) {
    if (p.group.visible) p.update(elapsed, delta);
  }

  sceneManager.render();
}

animate();
overlay.hideLoading();
