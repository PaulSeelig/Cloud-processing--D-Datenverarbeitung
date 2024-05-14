import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import AddScene from './AddScene';




function RenderOnCanvas(event) {

    const canvas = THREE.createCanvasElement();
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    //const fov = 60; //fov - field of view
    //const aspect = 1; // the canvas default
    //const near = 0.1;
    //const far = 1000;
    //const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //camera.position.set(0, 50, 0);
    //camera.up.set(0, 3, 1);
    //camera.lookAt(0, 3, 1);

    const sceneInfo = AddScene(event.target);
    const scene = sceneInfo.scene;
    const camera = sceneInfo.camera;

    scene.rotateX(-0.4);
    //scene.rotateY(0.2);
    //loader.load('/beethoven_2.xyz', function (points){});
    //loader.load()

    {

        const color = 0xFFFFFF;
        const intensity = 600;
        const light = new THREE.PointLight(color, intensity);
        //light.position.x = 10;
        //light.position.y = 1;
        //light.position.z = 10;
        //light.raycast();
        scene.add(light);

    }


// an array of objects who's rotation to update
    const objects = [];
    const ps = [];
    const solarsystem = new THREE.Object3D();
    scene.add(solarsystem);
    objects.push(solarsystem);

    const radius = 0.8;
    const widthSegments = 100;
    const heightSegments = 100;
    const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
    );
    
    const sunMaterial = new THREE.MeshPhongMaterial({ color: 0xaaFFaa, emissive: 0xddFFdd });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);
    solarsystem.add(sunMesh);
    //objects.push(sunMesh);

    const dunGeometry = new THREE.BoxGeometry(2, 4, 2, 10, 10, 6);
    const dunMaterial = new THREE.MeshPhongMaterial({ color: 0xaa0Faa, emissive: 0xddF0dd });
    const dunMesh = new THREE.Mesh(dunGeometry, dunMaterial);
    dunMesh.position.x = -30;
    dunMesh.position.y = 15;
    //dunMesh.scale.set(5, 5, 5);
    solarsystem.add(dunMesh);
    objects.push(dunMesh);
    objects.push(sunMesh);

    for (var i = 0; i < 100; i++) {
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * 20 * Math.PI, Math.random() * 20 * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * (-20) * Math.PI, Math.random() * (- 20) * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * 20 * Math.PI, Math.random() * (- 20) * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * (-20) * Math.PI, Math.random() * 20 * Math.PI, 0));
        }

    ps.push(createPoint(2, 100, 10, 0xaaaaFF, 0x0000FF, 2, -45, 0));
    ps.push(createPoint(1, 20, 30, 0xaf0eaa, 0x2a0955, 1, -30, 0));
    ps.push(createPoint(1, 15, 300, 0x115511, 0x112244, 7, 10, 0));
    ps.forEach((p) => {
        solarsystem.add(p);
        objects.push(p);
    });

    const { left, right, top, bottom, width, height } = sceneInfo.displayElement.getBoundingClientRect();
    //scene.fog = new THREE.Fog(0x000000, 40, 75);
    //scene.background = new THREE.Color(0xaaaaff);
    camera.fov = 100000 / width;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    function resizeRendererToDisplaySize(renderer) {
        renderer.clear(true, true);
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);

        }

        return needResize;
}

function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
        renderer.clear(true, true);
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    dunMesh.rotation.x = 0.5 * time;
    objects.forEach((obj) => {
        obj.rotation.z = 0.1*time;
        // obj.rotation.x = 0.05 * time;
        time *= 5;
    });
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

    requestAnimationFrame(render);
    event.target.appendChild(canvas);
}

function createPoint(radius, widthsegm, heightsegm, colr, emi, xp, yp, zp)
{
 //   var pointsgeometry = new THREE.SphereGeometry(radius, widthsegm, heightsegm);
    var pointsgeometry = new THREE.SphereGeometry(radius, 10, 10);
    var pointsmaterial = new THREE.MeshPhongMaterial({ color: colr, emissive: emi })
    var poin = new THREE.Mesh(pointsgeometry, pointsmaterial);
    poin.position.x = xp;
    poin.position.y = yp;
    poin.position.z = zp;
    poin.castShadow = true;
    poin.receiveShadow = true;
    //poin.raycast();
    return poin;
}


export default RenderOnCanvas;