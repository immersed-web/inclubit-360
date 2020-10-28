
import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE: THREE });

// private start3D() {
//   this.initThreeScene();
//   this.videoToSphere(this.videoElement);
// }

export function videoToSphereMesh (videoTag) {
  // for (i = 0; i < scene.children.length; i++) {
  //   if (scene.children[i].stitchBall === true) {
  //     scene.remove(scene.children[i]);
  //     //console.log("remove");
  //   }
  // }

  const video = videoTag;
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  const geometry = new THREE.SphereGeometry(100, 32, 32, 0);
  // console.log(geometry);
  geometry.scale(-1, 1, 1);

  // geometry.rotateZ(-Math.PI / 2);
  // geometry.rotateZ(stitchHelper.stitchPreSets[stitchHelper.currentMode].rotateZ); //-Math.PI / 2);
  geometry.rotateY(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.stitchBall = true;
  // this.scene.add(mesh);
  return mesh;
}

export function addSphereToScene (sphereMesh) {
  scene.add(sphereMesh);
}

const clock = new THREE.Clock();
let controls;
let scene;
let width;
let height;
const defaultFov = 90;
const defaultCameraDistance = 0.0001; // 5;
// let aspect = 1.78; //default to 16:9
let camera;
let renderer;

export function initThreeScene (drawCanvas) {
  console.log('drawCanvas:', drawCanvas);
  scene = new THREE.Scene();
  // this.threeContainer = <HTMLDivElement>this.$refs.threeContainer;
  // let width = window.screen.width * window.devicePixelRatio;
  // let height = window.screen.height * window.devicePixelRatio;
  const aspect = width / height;
  const near = 0.01;
  const far = 4000;
  camera = new THREE.PerspectiveCamera(defaultFov, aspect, near, far);
  // this.camera.position.set(0, 0, 0.001);
  // this.camera.position.set(0, this.cameraDistance, 0);
  camera.position.set(0, 0, defaultCameraDistance);

  // Test object
  // let demoGeometry = new THREE.SphereGeometry(5,16,16);
  // let demoMaterial = new THREE.MeshBasicMaterial({ color : 0xFF9900, transparent: true, opacity: 0.5, wireframe:true });
  // let mesh = new THREE.Mesh(demoGeometry, demoMaterial);
  // scene.add(mesh);

  // const mesh = new THREE.Mesh(
  //   new THREE.BoxGeometry(1, 1, 1),
  //   new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
  // );
  // scene.add(mesh);

  // const gridHelper = new THREE.GridHelper(50, 50);
  // gridHelper.position.y = -1;
  // scene.add(gridHelper);

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    canvas: drawCanvas,
  });
  renderer.setClearColor(0x000055, 0);

  // handle hidpi screens.
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  resizeScene(drawCanvas);
  // this.renderer.setSize(width, height);
  // let rendererDom = this.renderer.domElement;
  // rendererDom.className = 'three-canvas';
  // this.threeContainer.appendChild(rendererDom);

  window.addEventListener('resize', () => resizeScene(drawCanvas));

  document.addEventListener('fullscreenchange', event => {
    if (document.fullscreen) {
      console.log('removing resize listener');
      window.removeEventListener('resize', () => resizeScene(drawCanvas));
    } else {
      console.log('adding resize listener');
      window.addEventListener('resize', () => resizeScene(drawCanvas));
    }
  });

  // this.effect = new THREE.StereoEffect(renderer);
  // this.effect.setSize(width, height);

  // var directionalLight = new THREE.DirectionalLight(0xffffff);
  // directionalLight.position.set(0, 0.7, 0.7);
  // this.scene.add(directionalLight);

  // console.log('browser VR support:');
  // console.log(WEBVR.isVRSupported());

  // console.log('searching vr:');

  // if (this.$route.query && this.$route.query.novr == 'true') {
  //   console.log('No VR requested. Skipping vr initialization');
  // } else {
  //   WEBVR.isVRFound()
  //     .then((value: any) => {
  //       console.log('vr resolved: ' + value);
  //       this.renderer.vr.enabled = true;
  //       document.body.appendChild(
  //         WEBVR.createButton(this.renderer, {
  //           frameOfReferenceType: 'head-model',
  //         })
  //       );
  //     })
  //     .catch((value: any) => {
  //       console.log('rejected: ' + value);
  //     });
  // }

  controls = new CameraControls(camera, drawCanvas);
  // controls.noPan = true;
  // controls.enableZoom = true;
  // controls.zoomSpeed = 2;
  // this.controls.rotateSpeed = 0.1;
  // this.controls.enableDamping = true;
  // controls.autoRotate = true;

  // function setOrientationControls(e) {
  //   if (e) {
  //     //detect if the device support orientation
  //     if (!e.alpha) {
  //       return;
  //     }
  //   }

  //   HUDSystem.switchGyroMode();
  //   controls = new THREE.DeviceOrientationControls(camera, true);

  //   document.body.addEventListener('touchend', this.fullscreen);
  //   window.removeEventListener(
  //     'deviceorientation',
  //     setOrientationControls,
  //     true
  //   );
  // }

  // controls.enableDamping = true; // Damp is not recommeded;
  // controls.dampingFactor = 0.32;

  // window.addEventListener('deviceorientation', setOrientationControls, true);

  animateLoop();
  // this.updateScene();
}

function updateScene () {
  // if (!settingDB.headset) {
  //   this.renderer.render(this.scene, this.camera);
  // } else {
  //   effect.render(scene, camera);
  // }

  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
}

export function setFov (fov) {
  camera.fov = fov;
  camera.updateProjectionMatrix();
}

function resizeScene (drawCanvas) {
  console.log('resizing render canvas');
  console.log(drawCanvas);
  const width = drawCanvas.clientWidth;
  const height = drawCanvas.clientHeight;
  // console.log(this.renderer.getPixelRatio());
  if (drawCanvas.width !== width || drawCanvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

export function fullscreen (drawCanvas) {
  console.log('entering fullscreen');
  // ignore resize while in fullscreen
  // window.removeEventListener('resize', this.resizeScene);

  //   //console.log("hi");
  //   if (this.threeContainer.requestFullscreen) {
  drawCanvas.requestFullscreen();
  //   } else if (this.threeContainer.msRequestFullscreen) {
  //     this.threeContainer.msRequestFullscreen();
  //   } else if (this.threeContainer.mozRequestFullScreen) {
  //     this.threeContainer.mozRequestFullScreen();
  //   } else if (this.threeContainer.webkitRequestFullscreen) {
  //     this.threeContainer.webkitRequestFullscreen();
  //   }

  const width = window.screen.width; // * window.devicePixelRatio;
  const height = window.screen.height; // * window.devicePixelRatio;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, true);
}

function animateLoop () {
  // requestAnimationFrame(this.animateLoop);
  // // HUDSystem.update();
  // this.updateScene();

  renderer.setAnimationLoop(updateScene);
}

export default {
  initThreeScene,
  videoToSphereMesh,
  addSphereToScene,
  setFov,
  fullscreen,
};
