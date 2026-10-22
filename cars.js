// cars.js
(function (global) {
  const THREE = global.THREE;
  let draco = null;
  let loader = null;

  function getLoader() {
    if (!loader && THREE && THREE.GLTFLoader) {
      draco = new THREE.DRACOLoader();
      draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      loader = new THREE.GLTFLoader();
      loader.setDRACOLoader(draco);
    }
    return loader;
  }

  const CAR1_URL = './car1.glb';
  const CAR2_URL = './car2.glb';

  function loadModelAsset(scene, url, onStart) {
    return loadModel(url, (mesh) => {
      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      if (scene) scene.add(mesh);
      if (onStart) onStart(mesh);
      return mesh;
    });
  }

  function loadCar(scene, onStart) {
    return loadModelAsset(scene, CAR1_URL, onStart);
  }

  function loadCar2(scene, onStart) {
    return loadModelAsset(scene, CAR2_URL, onStart);
  }

  function loadModel(url, onMeshReady) {
    return new Promise((resolve, reject) => {
      const l = getLoader();
      if (!l) {
        reject(new Error("GLTFLoader unavailable"));
        return;
      }
      l.load(
        url,
        (gltf) => {
          const mesh = gltf.scene;
          if (onMeshReady) onMeshReady(mesh);
          resolve(mesh);
        },
        undefined,
        reject
      );
    });
  }

  global.CAR1_URL = CAR1_URL;
  global.CAR2_URL = CAR2_URL;
  global.loadModelAsset = loadModelAsset;
  global.loadCar = loadCar;
  global.loadCar2 = loadCar2;
})(typeof window !== 'undefined' ? window : this);