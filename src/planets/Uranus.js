import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere, createRing } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';
import { AtmosphereShader } from '../shaders/atmosphereShader.js';

export class Uranus {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.uranus;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
    this._buildAtmosphere(cfg);
    this._buildRings(cfg);

    this.group.rotation.z = THREE.MathUtils.degToRad(cfg.tilt);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_uranus.jpg');
    const geo = new THREE.SphereGeometry(cfg.radius, 96, 96);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.6,
      metalness: 0.05,
      emissive: new THREE.Color(0x1a4455),
      emissiveIntensity: 0.08,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _buildAtmosphere(cfg) {
    const geo = new THREE.SphereGeometry(cfg.radius * 1.06, 64, 64);
    this.atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.4, 0.75, 0.8) },
        uIntensity: { value: 0.5 },
        uFalloff: { value: 3.5 },
        uTime: { value: 0 },
      },
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(geo, this.atmoMat);
    this.group.add(this.atmosphere);
  }

  _buildRings(cfg) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, 'rgba(130, 170, 190, 0.0)');
    gradient.addColorStop(0.1, 'rgba(130, 170, 190, 0.15)');
    gradient.addColorStop(0.3, 'rgba(150, 190, 210, 0.3)');
    gradient.addColorStop(0.5, 'rgba(140, 180, 200, 0.25)');
    gradient.addColorStop(0.7, 'rgba(130, 170, 190, 0.15)');
    gradient.addColorStop(1, 'rgba(130, 170, 190, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 32);
    const ringTex = new THREE.CanvasTexture(canvas);

    const geo = createRing(cfg.ringInner, cfg.ringOuter, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.9,
      depthWrite: false,
    });
    this.rings = new THREE.Mesh(geo, mat);
    this.rings.rotation.x = -Math.PI * 0.5;
    this.group.add(this.rings);
  }

  update(elapsed, delta) {
    this.mesh.rotation.y += delta * PLANETS.uranus.rotationSpeed;
    this.atmoMat.uniforms.uTime.value = elapsed;
  }
}
