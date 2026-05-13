import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';
import { orbitAround } from '../shared/animations.js';

export class Mars {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.mars;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
    this._buildDust(cfg);
    this._buildMoons(cfg);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_mars.jpg');
    const geo = createSphere(cfg.radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.95,
      metalness: 0.05,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _buildDust(cfg) {
    const count = 300;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = cfg.radius * 1.1 + Math.random() * cfg.radius * 2.5;
      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = (Math.random() - 0.5) * cfg.radius * 0.6;
      positions[i3 + 2] = Math.sin(angle) * r;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xcc6633,
      size: 0.03,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.dust = new THREE.Points(geo, mat);
    this.group.add(this.dust);
  }

  _buildMoons(cfg) {
    this.moons = [];
    for (const moonCfg of cfg.moons) {
      const geo = createSphere(moonCfg.radius, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.9,
      });
      const moon = new THREE.Mesh(geo, mat);
      this.group.add(moon);
      this.moons.push({ mesh: moon, ...moonCfg });
    }
  }

  update(elapsed, delta) {
    this.mesh.rotation.y += delta * PLANETS.mars.rotationSpeed;
    this.dust.rotation.y += delta * 0.015;

    for (const moon of this.moons) {
      orbitAround(moon.mesh, elapsed, moon.speed, moon.distance);
    }
  }
}
