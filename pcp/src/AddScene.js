import * as THREE from 'three';
function AddScene()
{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, 2, 0.001, 1000);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    {
        camera.position.set(0, -150, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 1, 0);
        light.position.set(100, -100, 200);
        scene.add(light);
        //scene.rotation.y = Math.PI;
        scene.fog = new THREE.Fog(0x222222, 50, 180);
    }
    return { scene, camera};
}

export default AddScene;