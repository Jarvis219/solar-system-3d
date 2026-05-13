import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';

export class Mercury {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.mercury;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_mercury.jpg');
    const geo = createSphere(cfg.radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.9,
      metalness: 0.1,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  update(elapsed, delta) {
    this.mesh.rotation.y += delta * PLANETS.mercury.rotationSpeed;
  }
}
