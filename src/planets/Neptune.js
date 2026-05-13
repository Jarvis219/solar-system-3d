import * as THREE from 'three';
import { PLANETS } from '../config/planets.js';
import { createSphere } from '../shared/geometries.js';
import { loadTexture } from '../core/TextureLoader.js';
import { AtmosphereShader } from '../shaders/atmosphereShader.js';

export class Neptune {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.neptune;
    this.group.position.set(...cfg.position);

    this._buildPlanet(cfg);
    this._buildStorms(cfg);
    this._buildAtmosphere(cfg);
  }

  _buildPlanet(cfg) {
    const map = loadTexture('./textures/2k_neptune.jpg');
    const geo = new THREE.SphereGeometry(cfg.radius, 96, 96);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.6,
      metalness: 0.05,
      emissive: new THREE.Color(0x0a1a44),
      emissiveIntensity: 0.1,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _buildStorms(cfg) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);

    ctx.fillStyle = 'rgba(10, 20, 60, 0.6)';
    ctx.beginPath();
    ctx.ellipse(320, 110, 22, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(15, 30, 80, 0.4)';
    ctx.beginPath();
    ctx.ellipse(320, 110, 16, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(60, 100, 180, 0.3)';
    ctx.beginPath();
    ctx.ellipse(140, 170, 12, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    const stormTex = new THREE.CanvasTexture(canvas);
    stormTex.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.SphereGeometry(cfg.radius * 1.002, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      map: stormTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    this.storms = new THREE.Mesh(geo, mat);
    this.group.add(this.storms);
  }

  _buildAtmosphere(cfg) {
    const innerGeo = new THREE.SphereGeometry(cfg.radius * 1.015, 64, 64);
    this.atmoInnerMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.15, 0.35, 1.0) },
        uIntensity: { value: 0.35 },
        uFalloff: { value: 4.5 },
        uTime: { value: 0 },
      },
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmoInner = new THREE.Mesh(innerGeo, this.atmoInnerMat);
    this.group.add(this.atmoInner);

    const outerGeo = new THREE.SphereGeometry(cfg.radius * 1.08, 64, 64);
    this.atmoOuterMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.15, 0.3, 0.9) },
        uIntensity: { value: 0.55 },
        uFalloff: { value: 3.0 },
        uTime: { value: 0 },
      },
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmoOuter = new THREE.Mesh(outerGeo, this.atmoOuterMat);
    this.group.add(this.atmoOuter);
  }

  update(elapsed, delta) {
    const cfg = PLANETS.neptune;
    this.mesh.rotation.y += delta * cfg.rotationSpeed;
    this.storms.rotation.y += delta * cfg.rotationSpeed * 1.3;
    this.atmoInnerMat.uniforms.uTime.value = elapsed;
    this.atmoOuterMat.uniforms.uTime.value = elapsed;
  }
}
