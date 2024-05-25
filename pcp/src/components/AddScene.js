import * as THREE from 'three';
function AddScene(displayElement) {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, 2, 0.1, 1000);
    const light = new THREE.DirectionalLight(0xffffff, 10);
    {
        camera.position.set(0, -50, 0);
        camera.lookAt(0, 0, 0);

        light.position.set(-1, 2, 4);
        
        scene.add(light);
        scene.fog = new THREE.Fog(0x000000, 40, 75);
    }
    return { scene, camera, displayElement };
}

export default AddScene;