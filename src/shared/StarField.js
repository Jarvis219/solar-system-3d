import * as THREE from 'three';
import { loadTexture } from '../core/TextureLoader.js';

export class StarField {
  constructor() {
    this.group = new THREE.Group();
    this._buildSkybox();
    this._buildStars();
  }

  _buildSkybox() {
    const map = loadTexture('./textures/2k_stars_milky_way.jpg');
    const geo = new THREE.SphereGeometry(900, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      map,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skybox = new THREE.Mesh(geo, mat);
    this.group.add(this.skybox);
  }

  _buildStars() {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 250 + Math.random() * 550;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const temp = Math.random();
      if (temp < 0.3) {
        colors[i3] = 0.7; colors[i3 + 1] = 0.82; colors[i3 + 2] = 1.0;
      } else if (temp < 0.55) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.97; colors[i3 + 2] = 0.9;
      } else if (temp < 0.75) {
        colors[i3] = 0.6; colors[i3 + 1] = 0.72; colors[i3 + 2] = 1.0;
      } else {
        colors[i3] = 1.0; colors[i3 + 1] = 0.88; colors[i3 + 2] = 0.72;
      }

      sizes[i] = 0.15 + Math.random() * 1.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aSize;
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPos;
          float twinkle = sin(uTime * (0.6 + aSize * 0.4) + position.x * 0.3 + position.z * 0.2) * 0.5 + 0.5;
          gl_PointSize = aSize * uPixelRatio * (60.0 / -mvPos.z) * (0.6 + twinkle * 0.4);
          vOpacity = (0.5 + twinkle * 0.5) * smoothstep(850.0, 50.0, -mvPos.z);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float core = smoothstep(0.5, 0.0, d);
          float glow = smoothstep(0.5, 0.1, d);
          float alpha = (core * 0.85 + glow * 0.15) * vOpacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    this.stars = new THREE.Points(geo, mat);
    this.group.add(this.stars);
  }

  update(elapsed) {
    if (this.stars) {
      this.stars.material.uniforms.uTime.value = elapsed;
    }
  }
}
