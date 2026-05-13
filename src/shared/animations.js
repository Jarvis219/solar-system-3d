export function float(mesh, elapsed, speed = 1, amplitude = 0.3, offset = 0) {
  const baseY = mesh.userData.baseY ?? (mesh.userData.baseY = mesh.position.y);
  mesh.position.y = baseY + Math.sin(elapsed * speed + offset) * amplitude;
}

export function pulse(mesh, elapsed, speed = 1, min = 0.9, max = 1.1) {
  const t = (Math.sin(elapsed * speed) + 1) / 2;
  const s = min + t * (max - min);
  mesh.scale.setScalar(s);
}

export function rotate(mesh, delta, speed = 0.5) {
  mesh.rotation.y += delta * speed;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function orbitAround(mesh, elapsed, speed, radius, tilt = 0) {
  const angle = elapsed * speed;
  mesh.position.x = Math.cos(angle) * radius;
  mesh.position.z = Math.sin(angle) * radius;
  mesh.position.y = Math.sin(angle) * Math.tan(tilt) * radius * 0.3;
}
