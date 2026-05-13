import * as THREE from 'three';
import { ORBIT_RADII } from '../config/planets.js';

export class OrbitLines {
  constructor() {
    this.group = new THREE.Group();
    this._buildOrbits();
  }

  _buildOrbits() {
    const names = Object.keys(ORBIT_RADII);
    for (const name of names) {
      const radius = ORBIT_RADII[name];
      const segments = 128;
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x223355,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      this.group.add(line);
    }
  }
}
