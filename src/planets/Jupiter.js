import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';
import { orbitAround } from '../shared/animations.js';

export class Jupiter {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.jupiter;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
    this._buildMoons(cfg);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_jupiter.jpg');
    const geo = createSphere(cfg.radius, 128, 128);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _buildMoons(cfg) {
    this.moons = [];
    for (const moonCfg of cfg.moons) {
      const geo = createSphere(moonCfg.radius, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: moonCfg.color,
        roughness: 0.85,
      });
      const moon = new THREE.Mesh(geo, mat);
      this.group.add(moon);
      this.moons.push({ mesh: moon, ...moonCfg });
    }
  }

  update(elapsed, delta) {
    this.mesh.rotation.y += delta * PLANETS.jupiter.rotationSpeed;

    for (const moon of this.moons) {
      orbitAround(moon.mesh, elapsed, moon.speed, moon.distance, 0.05);
    }
  }
}
