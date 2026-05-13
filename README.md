# Solar System 3D

An interactive 3D Solar System explorer built with vanilla Three.js. Navigate through the solar system, explore each planet with real NASA textures, and discover a black hole lurking beyond Neptune.

![Three.js](https://img.shields.io/badge/Three.js-r172-black?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript)

## Features

- **8 Planets** with NASA 2K textures from Solar System Scope (CC BY 4.0)
- **Custom GLSL Shaders** — plasma Sun surface, Fresnel atmospheres, accretion disk
- **Black Hole** with event horizon, photon ring, accretion disk spiral, lensing halo, and relativistic jets
- **Earth-Moon System** with dynamic camera tracking as the Moon orbits
- **Comet** with glowing head and particle trail on an elliptical orbit
- **Starfield** with 8,000 twinkling stars and Milky Way skybox
- **OrbitControls** — drag to rotate, scroll to zoom, free camera exploration
- **Button Navigation** — fly between planets via the bottom nav bar with smooth cinematic transitions
- **Post-Processing** — UnrealBloomPass for Sun glow + custom vignette shader
- **Glassmorphism UI** — info panels with Vietnamese descriptions and planet statistics
- **Responsive** — mobile-friendly with touch navigation

## Tech Stack

- **Three.js** (r172) — 3D rendering, materials, shaders, post-processing
- **Vite** (v6) — dev server and build tool
- **Vanilla JavaScript** — ES modules, class-based architecture, no frameworks

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Jarvis219/solar-system-3d.git
cd solar-system-3d

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  main.js                 # Entry point, animation loop, OrbitControls
  style.css               # Glassmorphism panels, nav bar, responsive
  core/
    SceneManager.js       # Renderer, camera, bloom, vignette
    ScrollManager.js      # Camera transitions between sections
    TextureLoader.js      # Async texture loading with progress
  planets/
    Sun.js                # Custom plasma shader + corona sprites + PointLight
    Mercury.js            # Textured sphere with crater roughness
    Venus.js              # Surface + cloud layer + Fresnel atmosphere
    Earth.js              # 4-layer surface + clouds + atmosphere + Moon
    Mars.js               # Textured + 2 moons (Phobos, Deimos)
    Jupiter.js            # Textured + 4 Galilean moons
    Saturn.js             # Textured + ring system with alpha
    Uranus.js             # 97.77° axial tilt + faint rings
    Neptune.js            # Deep blue + animated atmosphere
    BlackHole.js          # Event horizon, photon ring, accretion disk, jets
  shared/
    StarField.js          # 8K twinkling stars + Milky Way skybox
    Comet.js              # Elliptical orbit with particle trail
    OrbitLines.js         # Faint orbital path circles
    animations.js         # float, pulse, rotate, orbitAround, easing
    colors.js             # Color palette
    geometries.js         # Cached geometry factories
    materials.js          # Material factories
  shaders/
    sunShader.js          # 4-octave simplex noise plasma
    atmosphereShader.js   # Fresnel rim-glow
    vignetteShader.js     # Post-processing vignette
  config/
    planets.js            # Planet data: radii, orbits, speeds
    cameras.js            # 13 camera positions for each section
  overlay/
    OverlayManager.js     # Panel + nav button toggling
```

## Textures

Planet textures are from [Solar System Scope](https://www.solarsystemscope.com/textures/) under CC BY 4.0 license.

## License

MIT
