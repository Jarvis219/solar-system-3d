import * as THREE from 'three';

const cache = new Map();

export function createSphere(radius = 1, widthSeg = 64, heightSeg = 64) {
  const key = `sphere_${radius}_${widthSeg}_${heightSeg}`;
  if (!cache.has(key)) {
    cache.set(key, new THREE.SphereGeometry(radius, widthSeg, heightSeg));
  }
  return cache.get(key);
}

export function createRing(innerRadius, outerRadius, segments = 128) {
  const key = `ring_${innerRadius}_${outerRadius}_${segments}`;
  if (!cache.has(key)) {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const t = (dist - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, t, uv.getY(i));
    }
    cache.set(key, geo);
  }
  return cache.get(key);
}
