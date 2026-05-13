import * as THREE from 'three';

const BH_POS = new THREE.Vector3(-160, 0, -60);
const BH_RADIUS = 4;

const TAIL_VERT = `
  attribute float aOpacity;
  attribute float aSize;
  varying float vOpacity;
  void main() {
    vOpacity = aOpacity;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (200.0 / -mv.z);
  }
`;

const TAIL_FRAG = `
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
`;

let _glowTex = null;
function getGlowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(220,240,255,1)');
  g.addColorStop(0.15, 'rgba(180,215,255,0.7)');
  g.addColorStop(0.5, 'rgba(120,170,255,0.2)');
  g.addColorStop(1, 'rgba(80,130,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

class SingleComet {
  constructor(tailLen, colorBase, colorTip) {
    this.group = new THREE.Group();
    this.tailLen = tailLen;
    this._trail = new Float32Array(tailLen * 3);

    const geo = new THREE.SphereGeometry(0.18, 10, 10);
    const mat = new THREE.MeshBasicMaterial({ color: 0xddeeff });
    this.head = new THREE.Mesh(geo, mat);
    this.group.add(this.head);

    const sm = new THREE.SpriteMaterial({
      map: getGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(sm);
    sprite.scale.setScalar(2.5);
    this.head.add(sprite);

    const opacities = new Float32Array(tailLen);
    const sizes = new Float32Array(tailLen);
    for (let i = 0; i < tailLen; i++) {
      const t = i / tailLen;
      opacities[i] = (1.0 - t) * (1.0 - t);
      sizes[i] = THREE.MathUtils.lerp(3.5, 0.3, t);
    }
    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute('position', new THREE.BufferAttribute(this._trail, 3));
    tGeo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
    tGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.tail = new THREE.Points(tGeo, new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(...(colorBase || [0.5, 0.7, 1.0])) },
        uColorTip: { value: new THREE.Color(...(colorTip || [0.95, 0.97, 1.0])) },
      },
      vertexShader: TAIL_VERT,
      fragmentShader: TAIL_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    this.group.add(this.tail);
  }

  initTrail(x, y, z) {
    for (let i = 0; i < this.tailLen; i++) {
      this._trail[i * 3] = x;
      this._trail[i * 3 + 1] = y;
      this._trail[i * 3 + 2] = z;
    }
  }

  updateTrail() {
    for (let i = this.tailLen - 1; i > 0; i--) {
      this._trail[i * 3] = this._trail[(i - 1) * 3];
      this._trail[i * 3 + 1] = this._trail[(i - 1) * 3 + 1];
      this._trail[i * 3 + 2] = this._trail[(i - 1) * 3 + 2];
    }
    this._trail[0] = this.head.position.x;
    this._trail[1] = this.head.position.y;
    this._trail[2] = this.head.position.z;
    this.tail.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.group.removeFromParent();
    this.head.geometry.dispose();
    this.head.material.dispose();
    this.tail.geometry.dispose();
    this.tail.material.dispose();
  }
}

export class Comet {
  constructor() {
    this.group = new THREE.Group();
    this._orbits = [];
    this._doomed = [];
    this._nextDoomTime = 18 + Math.random() * 22;

    this._addOrbit({ a: 85, b: 45, ox: 68, tilt: 0.32, speed: 0.045, phase: 0.8 });
    this._addOrbit({ a: 110, b: 30, ox: 50, tilt: -0.4, speed: 0.03, phase: 2.5 });
    this._addOrbit({ a: 70, b: 55, ox: 40, tilt: 0.5, speed: 0.055, phase: 4.2 });
  }

  _orbitPos(c, elapsed) {
    const angle = elapsed * c.speed + c.phase;
    return [
      Math.cos(angle) * c.a + c.ox,
      Math.sin(angle) * Math.sin(c.tilt) * c.b * 0.4,
      Math.sin(angle) * c.b,
    ];
  }

  _addOrbit(cfg) {
    const sc = new SingleComet(200);
    sc.cfg = cfg;
    const [x, y, z] = this._orbitPos(cfg, 0);
    sc.head.position.set(x, y, z);
    sc.initTrail(x, y, z);
    this._orbits.push(sc);
    this.group.add(sc.group);
  }

  _spawnDoomed() {
    if (this._doomed.length >= 2) return;

    const sc = new SingleComet(150, [0.9, 0.6, 0.3], [1.0, 0.9, 0.7]);
    const angle = Math.random() * Math.PI * 2;
    const r = 100 + Math.random() * 50;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = (Math.random() - 0.5) * 15;

    sc.head.position.set(x, y, z);
    sc.initTrail(x, y, z);

    const toBH = new THREE.Vector3().copy(BH_POS).sub(sc.head.position).normalize();
    const perp = new THREE.Vector3(-toBH.z, 0, toBH.x);
    sc.velocity = toBH.multiplyScalar(10 + Math.random() * 8)
      .add(perp.multiplyScalar((Math.random() - 0.5) * 6));

    this._doomed.push(sc);
    this.group.add(sc.group);
  }

  update(elapsed, delta) {
    for (const sc of this._orbits) {
      const [x, y, z] = this._orbitPos(sc.cfg, elapsed);
      sc.head.position.set(x, y, z);
      sc.updateTrail();
    }

    if (elapsed > this._nextDoomTime) {
      this._spawnDoomed();
      this._nextDoomTime = elapsed + 25 + Math.random() * 35;
    }

    const dt = delta || 1 / 60;
    for (let i = this._doomed.length - 1; i >= 0; i--) {
      const sc = this._doomed[i];
      const pos = sc.head.position;
      const toBH = new THREE.Vector3().copy(BH_POS).sub(pos);
      const dist = toBH.length();

      if (dist < BH_RADIUS) {
        sc.dispose();
        this._doomed.splice(i, 1);
        continue;
      }

      const pull = 80 / Math.max(dist, 5);
      sc.velocity.add(toBH.normalize().multiplyScalar(pull * dt));
      pos.addScaledVector(sc.velocity, dt);
      sc.updateTrail();
    }
  }
}
