import * as THREE from 'three';

const TAIL_LEN = 250;

export class Comet {
  constructor() {
    this.group = new THREE.Group();
    this._trail = new Float32Array(TAIL_LEN * 3);
    this._buildHead();
    this._buildTail();
    this._initTrail();
  }

  _buildHead() {
    const geo = new THREE.SphereGeometry(0.18, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xddeeff });
    this.head = new THREE.Mesh(geo, mat);
    this.group.add(this.head);

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(220,240,255,1)');
    g.addColorStop(0.15, 'rgba(180,215,255,0.7)');
    g.addColorStop(0.5, 'rgba(120,170,255,0.2)');
    g.addColorStop(1, 'rgba(80,130,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);

    const tex = new THREE.CanvasTexture(canvas);
    const sm = new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(sm);
    sprite.scale.setScalar(2.5);
    this.head.add(sprite);
  }

  _buildTail() {
    const opacities = new Float32Array(TAIL_LEN);
    const sizes = new Float32Array(TAIL_LEN);
    for (let i = 0; i < TAIL_LEN; i++) {
      const t = i / TAIL_LEN;
      opacities[i] = Math.pow(1.0 - t, 2);
      sizes[i] = THREE.MathUtils.lerp(3.5, 0.3, t);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this._trail, 3));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.5, 0.7, 1.0) },
        uColorTip: { value: new THREE.Color(0.95, 0.97, 1.0) },
      },
      vertexShader: `
        attribute float aOpacity;
        attribute float aSize;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * (200.0 / -mv.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uColorTip;
        varying float vOpacity;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float a = smoothstep(1.0, 0.0, d) * vOpacity;
          vec3 col = mix(uColor, uColorTip, vOpacity);
          gl_FragColor = vec4(col * 1.3, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.tail = new THREE.Points(geo, mat);
    this.group.add(this.tail);
  }

  _orbitPos(elapsed) {
    const a = 85;
    const b = 45;
    const offsetX = 68;
    const tilt = 0.32;
    const speed = 0.045;
    const angle = elapsed * speed + 0.8;

    return [
      Math.cos(angle) * a + offsetX,
      Math.sin(angle) * Math.sin(tilt) * b * 0.4,
      Math.sin(angle) * b,
    ];
  }

  _initTrail() {
    const [x, y, z] = this._orbitPos(0);
    for (let i = 0; i < TAIL_LEN; i++) {
      this._trail[i * 3] = x;
      this._trail[i * 3 + 1] = y;
      this._trail[i * 3 + 2] = z;
    }
    this.head.position.set(x, y, z);
  }

  update(elapsed) {
    const [x, y, z] = this._orbitPos(elapsed);
    this.head.position.set(x, y, z);

    for (let i = TAIL_LEN - 1; i > 0; i--) {
      this._trail[i * 3] = this._trail[(i - 1) * 3];
      this._trail[i * 3 + 1] = this._trail[(i - 1) * 3 + 1];
      this._trail[i * 3 + 2] = this._trail[(i - 1) * 3 + 2];
    }
    this._trail[0] = x;
    this._trail[1] = y;
    this._trail[2] = z;

    this.tail.geometry.attributes.position.needsUpdate = true;
  }
}
