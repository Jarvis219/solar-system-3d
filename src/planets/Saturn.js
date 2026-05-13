import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere, createRing } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';

export class Saturn {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.saturn;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
    this._buildRings(cfg);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_saturn.jpg');
    const geo = createSphere(cfg.radius, 128, 128);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.8,
      metalness: 0.05,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _buildRings(cfg) {
    const ringAlpha = loadTexture('./textures/2k_saturn_ring_alpha.png');

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, 'rgba(180, 160, 120, 0.0)');
    gradient.addColorStop(0.05, 'rgba(180, 160, 120, 0.2)');
    gradient.addColorStop(0.12, 'rgba(200, 180, 140, 0.7)');
    gradient.addColorStop(0.22, 'rgba(220, 195, 155, 0.9)');
    gradient.addColorStop(0.32, 'rgba(190, 165, 125, 0.3)');
    gradient.addColorStop(0.36, 'rgba(200, 175, 135, 0.8)');
    gradient.addColorStop(0.50, 'rgba(215, 190, 150, 1.0)');
    gradient.addColorStop(0.65, 'rgba(200, 175, 135, 0.7)');
    gradient.addColorStop(0.80, 'rgba(180, 155, 115, 0.4)');
    gradient.addColorStop(0.92, 'rgba(160, 135, 95, 0.15)');
    gradient.addColorStop(1, 'rgba(140, 115, 75, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 64);
    const ringColorTex = new THREE.CanvasTexture(canvas);
    ringColorTex.colorSpace = THREE.SRGBColorSpace;

    const geo = createRing(cfg.ringInner, cfg.ringOuter, 128);
    const mat = new THREE.MeshStandardMaterial({
      map: ringColorTex,
      alphaMap: ringAlpha,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.85,
      metalness: 0.05,
      depthWrite: false,
    });
    this.rings = new THREE.Mesh(geo, mat);
    this.rings.rotation.x = -Math.PI * 0.5 + 0.2;
    this.group.add(this.rings);
  }

  update(elapsed, delta) {
    this.mesh.rotation.y += delta * PLANETS.saturn.rotationSpeed;
  }
}
