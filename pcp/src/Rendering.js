/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import { randFloat, randInt } from 'three/src/math/MathUtils';
//import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
function RenderOnCanvas(eventObject) {
    document.activeElement.nextSibling
    const canvas = eventObject ? eventObject : document.querySelector('#objViewCont .objViewWin canvas');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 60; //fov - field of view
    const aspect = 3; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 50, 0);
    camera.up.set(0, 3, 1);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.rotateX(-0.4);
    //scene.rotateY(0.2);

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
    objects.push(sunMesh);

    /*const d = new THREE.Points()[x = 2, y = 3, z = 2];*/
    //var rnd = new randFloat(0.2, 1);
    
    for (var i = 0; i < 100; i++) {
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * 30 * Math.PI +10, Math.random() * 30 * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * (-30) * Math.PI + 10, Math.random() * (- 30) * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * 30 * Math.PI + 10, Math.random() * (- 30) * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * (-30) * Math.PI + 10, Math.random() * 30 * Math.PI, 0));
    //ps.push(createPoint(, new randFloat(3, 10), new randFloat(3, 10), 0xFFF00F, 0xFFFFFF, new randInt(-10, 10), new randInt(-70, 70), new randInt(-70, 70)));

        }

    ps.push(createPoint(2, 100, 10, 0xaaaaFF, 0x0000FF, 0, -45, 0));
    ps.push(createPoint(0.8, 20, 30, 0xaf0eaa, 0x2a0955, 0, -20, 0));
    ps.push(createPoint(1, 15, 300, 0x115511, 0x112244, 7, 10, 0));
    ps.forEach((p) => {
        solarsystem.add(p);
        objects.push(p);
    });

    
function resizeRendererToDisplaySize(renderer) {
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
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    objects.forEach((obj) => {
        obj.rotation.z = 0.1*time;
       // obj.rotation.x = 0.05 * time;
        time *= 1000;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
}

function createPoint(radius, widthsegm, heightsegm, colr, emi, xp, yp, zp)
{
    var pointsgeometry = new THREE.SphereGeometry(radius, widthsegm, heightsegm);
    var pointsmaterial = new THREE.MeshPhongMaterial({ color: colr, emissive: emi })
    var poin = new THREE.Mesh(pointsgeometry, pointsmaterial);
    poin.position.x = xp;
    poin.position.y = yp;
    poin.position.z = zp;
    return poin;
}

//function ReadOutXYZ(e)
//{
//    var fileread = new FileReader();

//}

//RenderOnCanvas();
//
//    const canva = eObj/*document.querySelector('#c')*/;
//    const renderer = new THREE.WebGLRenderer({ antialias: true, canva });
//    const fov = 75; // 
//    const aspect = 2;  // the canvas default
//    const near = 0.1;
//    const far = 5;
//    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//    camera.position.z = 2;
//    const scene = new THREE.Scene();
//    const boxWidth = 1;
//    const boxHeight = 1;
//    const boxDepth = 1;
//    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
//    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
//    const cube = new THREE.Mesh(geometry, material);
//    scene.add(cube);
//    renderer.render(scene, camera);
//    function render(time) {
//        time *= 0.001;  // convert time to seconds

//        cube.rotation.x = time;
//        cube.rotation.y = time;

//        renderer.render(scene, camera);

//        requestAnimationFrame(render);
//    }
//    requestAnimationFrame(render);
//}
export default RenderOnCanvas;