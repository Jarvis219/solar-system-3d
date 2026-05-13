import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';
import { AtmosphereShader } from '../shaders/atmosphereShader.js';

export class Venus {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.venus;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
    this._buildClouds(cfg);
    this._buildAtmosphere(cfg);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_venus_surface.jpg');
    const geo = createSphere(cfg.radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.9,
      metalness: 0.05,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _buildClouds(cfg) {
    const map = loadTexture('./textures/2k_venus_atmosphere.jpg');
    const geo = createSphere(cfg.radius * 1.04, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map,
      transparent: true,
      opacity: 0.65,
      roughness: 0.8,
      metalness: 0.0,
    });
    this.clouds = new THREE.Mesh(geo, mat);
    this.group.add(this.clouds);
  }

  _buildAtmosphere(cfg) {
    const geo = createSphere(cfg.radius * 1.1, 48, 48);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(...cfg.atmosphereColor) },
        uIntensity: { value: 0.4 },
        uFalloff: { value: 4.0 },
        uTime: { value: 0 },
      },
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(geo, mat);
    this.group.add(this.atmosphere);
  }

  update(elapsed, delta) {
    const cfg = PLANETS.venus;
    this.mesh.rotation.y += delta * cfg.rotationSpeed;
    this.clouds.rotation.y -= delta * cfg.cloudSpeed;
  }
}
