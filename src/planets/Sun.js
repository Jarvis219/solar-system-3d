import * as THREE from 'three';
import { SunShader } from '../shaders/sunShader.js';
import { PLANETS } from '../config/planets.js';

export class Sun {
  constructor() {
    this.group = new THREE.Group();
    const cfg = PLANETS.sun;
    this.group.position.set(...cfg.position);

    this._buildCore(cfg);
    this._buildCorona();
    this._buildLight();
  }

  _buildCore(cfg) {
    const geo = new THREE.SphereGeometry(cfg.radius, 128, 128);
    this.coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: SunShader.vertexShader,
      fragmentShader: SunShader.fragmentShader,
    });
    this.core = new THREE.Mesh(geo, this.coreMat);
    this.group.add(this.core);
  }

  _buildCorona() {
    this.coronas = [];

    const layers = [
      { size: 14, opacity: 0.2, color: [255, 210, 100] },
      { size: 20, opacity: 0.1, color: [255, 160, 60] },
      { size: 30, opacity: 0.04, color: [255, 120, 30] },
    ];

    for (const layer of layers) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      const [r, g, b] = layer.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layer.opacity})`);
      gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${layer.opacity * 0.6})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${layer.opacity * 0.2})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(layer.size, layer.size, 1);
      this.group.add(sprite);
      this.coronas.push({ sprite, baseSize: layer.size });
    }
  }

  _buildLight() {
    this.light = new THREE.PointLight(0xfff5e0, 90, 0, 1.2);
    this.group.add(this.light);
  }

  update(elapsed, delta) {
    this.coreMat.uniforms.uTime.value = elapsed;
    this.core.rotation.y += delta * PLANETS.sun.rotationSpeed;

    for (let i = 0; i < this.coronas.length; i++) {
      const { sprite, baseSize } = this.coronas[i];
      const scale = baseSize * (1 + Math.sin(elapsed * 0.3 + i * 1.5) * 0.05);
      sprite.scale.set(scale, scale, 1);
    }
  }
}
