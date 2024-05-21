import * as THREE from 'three';
function AddScene()
{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, 2, 0.1, 1000);
    const light = new THREE.DirectionalLight(0xffffff, .5);
    {
        camera.position.set(100, -100, 50);
        camera.lookAt(0, 1, 0);
        light.position.set(-1, 2, 4);
        scene.add(light);
        //scene.fog = new THREE.Fog(0x000000, 40, 75);
    }
    return { scene, camera};
}

export default AddScene;