import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

export function loadTexture(path, srgb = true) {
  if (cache.has(path)) return cache.get(path);
  const tex = loader.load(path);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  cache.set(path, tex);
  return tex;
}
