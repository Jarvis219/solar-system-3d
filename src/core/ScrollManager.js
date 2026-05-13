import * as THREE from 'three';
import { easeInOutCubic } from '../shared/animations.js';
import { SECTION_CAMERAS } from '../config/cameras.js';

const TRANSITION_SPEED = 0.8;

export class ScrollManager {
  constructor(camera) {
    this.camera = camera;
    this.currentSection = 0;
    this.targetSection = 0;
    this.sectionCount = SECTION_CAMERAS.length;
    this.progress = 0;
    this.transitioning = false;
    this._listeners = [];
    this._cameraResolver = null;

    this._fromPos = new THREE.Vector3();
    this._toPos = new THREE.Vector3();
    this._fromLook = new THREE.Vector3();
    this._toLook = new THREE.Vector3();
    this._currentLook = new THREE.Vector3();

    this._setCamera(0);
  }

  setCameraResolver(fn) {
    this._cameraResolver = fn;
  }

  updateTransitionTarget(pos, look) {
    if (!this.transitioning) return;
    this._toPos.set(...pos);
    this._toLook.set(...look);
  }

  _setCamera(index) {
    const cam = SECTION_CAMERAS[index];
    this.camera.position.set(...cam.pos);
    this._currentLook.set(...cam.look);
    this.camera.lookAt(this._currentLook);
  }

  _startTransition(from, to, cam) {
    if (from === to) return;
    this.transitioning = true;
    this.progress = 0;
    this._fromPos.copy(this.camera.position);
    this._toPos.set(...cam.pos);
    this._fromLook.copy(this._currentLook);
    this._toLook.set(...cam.look);
  }

  goTo(index) {
    index = Math.max(0, Math.min(this.sectionCount - 1, index));
    if (index === this.targetSection && !this.transitioning) return;
    const from = this.transitioning ? this.targetSection : this.currentSection;
    this.targetSection = index;
    const cam = this._cameraResolver
      ? this._cameraResolver(index)
      : SECTION_CAMERAS[index];
    this._startTransition(from, index, cam);
    this._emit(index);
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  _emit(section) {
    for (const fn of this._listeners) fn(section);
  }

  update(delta, controls) {
    if (!this.transitioning) return;

    this.progress += delta * TRANSITION_SPEED;
    if (this.progress >= 1) {
      this.progress = 1;
      this.transitioning = false;
      this.currentSection = this.targetSection;
    }

    const t = easeInOutCubic(this.progress);

    this.camera.position.lerpVectors(this._fromPos, this._toPos, t);
    this._currentLook.lerpVectors(this._fromLook, this._toLook, t);
    this.camera.lookAt(this._currentLook);

    if (controls) {
      controls.target.copy(this._currentLook);
    }
  }

  get activeSection() {
    return this.targetSection;
  }
}
