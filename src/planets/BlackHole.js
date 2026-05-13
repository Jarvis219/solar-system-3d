import * as THREE from 'three';
import { createRing } from '../shared/geometries.js';

export class BlackHole {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-160, 0, -60);

    this._buildEventHorizon();
    this._buildPhotonRing();
    this._buildAccretionDisk();
    this._buildLensingHalo();
    this._buildJets();
  }

  _buildEventHorizon() {
    const geo = new THREE.SphereGeometry(3, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    this.core = new THREE.Mesh(geo, mat);
    this.group.add(this.core);
  }

  _buildPhotonRing() {
    const geo = new THREE.TorusGeometry(4.2, 0.15, 32, 128);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          float angle = atan(vPos.z, vPos.x);
          float flow = fract(angle / 6.2832 + uTime * 0.3);
          float brightness = 0.6 + 0.4 * sin(flow * 12.566);
          vec3 color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.95, 0.8), brightness);
          gl_FragColor = vec4(color * 1.8, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.photonRing = new THREE.Mesh(geo, mat);
    this.photonRing.rotation.x = Math.PI * 0.5;
    this.group.add(this.photonRing);
  }

  _buildAccretionDisk() {
    const geo = createRing(4.5, 14, 256);
    this.diskMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vDist;
        void main() {
          vUv = uv;
          vDist = length(position.xy);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying float vDist;
        void main() {
          float t = vUv.x;
          float angle = atan(vUv.y - 0.5, t - 0.5);

          float flow = fract(t * 3.0 - uTime * 0.2 + sin(angle * 4.0) * 0.1);
          float spiral = sin(flow * 18.84) * 0.5 + 0.5;

          float innerGlow = smoothstep(0.0, 0.15, t);
          float outerFade = smoothstep(1.0, 0.3, t);
          float alpha = innerGlow * outerFade * (0.5 + spiral * 0.5);

          vec3 hot = vec3(1.0, 0.95, 0.85);
          vec3 warm = vec3(1.0, 0.55, 0.1);
          vec3 cool = vec3(0.8, 0.2, 0.05);
          vec3 color = mix(hot, warm, smoothstep(0.0, 0.4, t));
          color = mix(color, cool, smoothstep(0.4, 0.9, t));

          color *= 1.2 + spiral * 0.6;

          gl_FragColor = vec4(color, alpha * 0.85);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.disk = new THREE.Mesh(geo, this.diskMat);
    this.disk.rotation.x = -Math.PI * 0.5 + 0.25;
    this.group.add(this.disk);
  }

  _buildLensingHalo() {
    const geo = new THREE.SphereGeometry(3.8, 64, 64);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), 6.0);
          float flicker = 0.85 + 0.15 * sin(uTime * 2.0 + vNormal.x * 5.0);
          vec3 color = mix(vec3(1.0, 0.5, 0.05), vec3(0.7, 0.85, 1.0), fresnel);
          float alpha = fresnel * 1.2 * flicker;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.halo = new THREE.Mesh(geo, mat);
    this.group.add(this.halo);
  }

  _buildJets() {
    const createJet = (direction) => {
      const count = 600;
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const randoms = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = Math.random();
        const spread = (1 - t) * 0.6 + 0.05;
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = direction * (t * 25 + 0.5);
        positions[i3 + 2] = (Math.random() - 0.5) * spread;
        sizes[i] = 0.05 + Math.random() * 0.12 * (1 - t);
        randoms[i] = Math.random() * 6.28;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uPixelRatio;
          attribute float aSize;
          attribute float aRandom;
          varying float vAlpha;
          void main() {
            float dist = abs(position.y);
            float maxDist = 25.0;
            vAlpha = (1.0 - dist / maxDist) * (0.5 + 0.5 * sin(uTime * 3.0 + aRandom));
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPos;
            gl_PointSize = aSize * uPixelRatio * (80.0 / -mvPos.z);
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float core = smoothstep(0.5, 0.0, d);
            vec3 color = mix(vec3(0.5, 0.6, 1.0), vec3(0.8, 0.9, 1.0), core);
            gl_FragColor = vec4(color, core * vAlpha * 0.7);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geo, mat);
    };

    this.jetTop = createJet(1);
    this.jetBottom = createJet(-1);
    this.group.add(this.jetTop);
    this.group.add(this.jetBottom);
  }

  update(elapsed, delta) {
    this.diskMat.uniforms.uTime.value = elapsed;
    this.photonRing.material.uniforms.uTime.value = elapsed;
    this.halo.material.uniforms.uTime.value = elapsed;
    this.jetTop.material.uniforms.uTime.value = elapsed;
    this.jetBottom.material.uniforms.uTime.value = elapsed;

    this.disk.rotation.z += delta * 0.15;
    this.core.rotation.y += delta * 0.3;
  }
}
