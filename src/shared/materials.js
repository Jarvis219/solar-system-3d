import * as THREE from 'three';

const cache = new Map();

export function createPlanetMaterial(color, opts = {}) {
  const key = `planet_${color}_${JSON.stringify(opts)}`;
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.8,
      metalness: opts.metalness ?? 0.1,
      flatShading: opts.flatShading ?? false,
      ...opts,
    }));
  }
  return cache.get(key);
}

export function createEmissive(color, intensity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: intensity,
  });
}

export function createAtmosphereMaterial(color, opacity = 0.3) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
