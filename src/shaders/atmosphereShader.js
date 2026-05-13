export const AtmosphereShader = {
  uniforms: {
    uColor: { value: null },
    uIntensity: { value: 1.2 },
    uFalloff: { value: 3.0 },
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
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uFalloff;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float fresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), uFalloff);
      float alpha = fresnel * uIntensity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};
